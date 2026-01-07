import { useMutation } from '@tanstack/react-query'
import type { Address } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useWriteContract } from 'wagmi'

const RISEX_AUTH_CONTRACT =
  '0x8d8708f9d87ef522c1f99dd579bf6a051e34c28e' as Address

const RISEX_AUTH_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'string', name: 'message', type: 'string' },
      { internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { internalType: 'uint40', name: 'expiration', type: 'uint40' },
      { internalType: 'bytes', name: 'accountSignature', type: 'bytes' },
      { internalType: 'bytes', name: 'signerSignature', type: 'bytes' },
    ],
    name: 'registerSigner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

type VerifySignerMessage = {
  account: Address
  nonce: string
}

type RegisterSignerMessage = {
  expiration: string
  message: string
  nonce: string
  signer: Address
}

export const nowInNano = () => {
  const loadNs = BigInt(0) // process?.hrtime?.bigint?.() || BigInt(0)
  const loadMs = Date.now()

  if (process?.hrtime?.bigint) {
    const current = process.hrtime.bigint()
    return BigInt(
      BigInt(loadMs) * 1000000n + BigInt(current - loadNs),
    ).toString()
  }

  const rand6Digits = Math.round(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')

  const timestamp = Date.now() // milliseconds since epoch

  return `${timestamp}${rand6Digits}`
}

export function hashToUint32(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  // eslint-disable-next-line no-bitwise
  return hash >>> 0
}

export const createClientNonce = (address: string | undefined) => {
  const baseNonce = nowInNano()
  const secondOfNonce = baseNonce.slice(0, -9)
  return (
    baseNonce.slice(0, -6) +
    hashToUint32(`${secondOfNonce}${address?.toLowerCase()}`)
      .toString()
      .slice(-6)
  )
}

/**
 * Custom hook for registering a signer with the RiseX contract.
 *
 * This hook handles the complete flow:
 * 1. Generates a new private key for the signer
 * 2. Creates a signer signature using the VerifySigner typed data
 * 3. Creates an account signature using the RegisterSigner typed data
 * 4. Registers the signer via the contract call
 *
 * @see https://docs.risechain.com/docs/risex/api/register-signer
 *
 * @example
 * ```tsx
 * const { registerSigner, isPending, error } = useRegisterSigner()
 *
 * const handleRegister = async () => {
 *   const result = await registerSigner({
 *     account: '0x1234...',
 *     chainId: 11155931
 *   })
 *
 *   // Store the signing key securely
 *   localStorage.setItem('signingKey', result.signingKey)
 * }
 * ```
 */
export function useRegisterSigner() {
  const { writeContractAsync } = useWriteContract()

  const mutation = useMutation({
    mutationFn: async ({
      account,
      chainId = 11155931,
      expirationDays = 7,
    }: {
      account: Address
      chainId?: number
      expirationDays?: number
    }) => {
      // Step 1: Generate a new private key for the signer
      const signingKey = generatePrivateKey()
      const signerAccount = privateKeyToAccount(signingKey)
      const signerAddress = signerAccount.address

      // Generate nonce (random string)
      const nonce = createClientNonce(account)

      // Calculate expiration timestamp (in seconds) = 7 days from now
      const expiration = Math.floor(Date.now() / 1000) + expirationDays * 86400

      // Step 2: Create signer signature using VerifySigner typed data
      const domain = {
        chainId, // Rise testnet = 11155931
        name: 'RISEx',
        verifyingContract: RISEX_AUTH_CONTRACT as Address,
        version: '1',
      }

      const verifySignerMessage: VerifySignerMessage = {
        account,
        nonce,
      }

      const signerSignature = await signerAccount.signTypedData({
        domain,
        message: verifySignerMessage,
        primaryType: 'VerifySigner',
        types: {
          VerifySigner: [
            { name: 'account', type: 'address' },
            { name: 'nonce', type: 'string' },
          ],
        },
      })

      // Step 3: Create account signature using RegisterSigner typed data
      const message = 'Register signer for RiseX'
      const toSignMessage: RegisterSignerMessage = {
        expiration: expiration.toString(),
        message,
        nonce,
        signer: signerAddress,
      }

      const accountSignature = await signerAccount.signTypedData({
        domain,
        message: {
          expiration,
          message,
          nonce: BigInt(toSignMessage.nonce),
          signer: toSignMessage.signer,
        },
        primaryType: 'RegisterSigner',
        types: {
          RegisterSigner: [
            { name: 'signer', type: 'address' },
            { name: 'message', type: 'string' },
            { name: 'expiration', type: 'uint40' },
            { name: 'nonce', type: 'uint256' },
          ],
        },
      })

      // Step 4: Submit registration via contract call
      const hash = await writeContractAsync({
        abi: RISEX_AUTH_ABI,
        address: RISEX_AUTH_CONTRACT,
        args: [
          account, // account
          signerAddress, // signer
          message, // message
          BigInt(nonce), // nonce
          expiration, // expiration
          accountSignature, // accountSignature
          signerSignature, // signerSignature
        ],
        functionName: 'registerSigner',
      })

      return {
        accountSignature,
        expiration,
        hash,
        nonce,
        signer: signerAddress,
        signerSignature,
        signingKey, // IMPORTANT: Store this securely - it authorizes all transactions
      }
    },
    mutationKey: ['register-signer'],
  })

  return {
    error: mutation.error,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    registerSigner: mutation.mutateAsync,
    reset: mutation.reset,
  }
}
