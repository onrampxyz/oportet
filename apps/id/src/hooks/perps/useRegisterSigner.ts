import { SignatureErc8010 } from 'ox/erc8010'
import { useState } from 'react'
import type { Address } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useSendCallsSync, useSignTypedData } from 'wagmi'
import { AddressFormatter } from '~/utils'

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

const REGISTER_TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  RegisterSigner: [
    { name: 'signer', type: 'address' },
    { name: 'message', type: 'string' },
    { name: 'expiration', type: 'uint40' },
    { name: 'nonce', type: 'uint256' },
  ],
  VerifySigner: [
    { name: 'account', type: 'address' },
    { name: 'nonce', type: 'uint256' },
  ],
}

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

type GetSignerParams = {
  account: Address
  chainId: number
}

type GetSignerResult = {
  signingKey: `0x${string}`
  signerAccount: ReturnType<typeof privateKeyToAccount>
  signerAddress: Address
  signerSignature: `0x${string}`
  nonce: string
}

type GetAccountSignatureParams = {
  signerAddress: Address
  nonce: string
  expiration: number
  chainId: number
  signTypedDataAsync: ReturnType<typeof useSignTypedData>['signTypedDataAsync']
}

type GetAccountSignatureResult = {
  message: string
  toSignMessage: RegisterSignerMessage
  accountSignature: `0x${string}`
}

type RegisterSignerContractParams = {
  account: Address
  signerAddress: Address
  message: string
  nonce: string
  expiration: number
  accountSignature: `0x${string}`
  signerSignature: `0x${string}`
  chainId: number
}

export const nowInNano = () => {
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
 * Generates a new signer key and creates a signature for verification.
 *
 * This function:
 * 1. Generates a new private key for the signer
 * 2. Creates a signer account from the private key
 * 3. Signs the VerifySigner typed data with the signer account
 *
 * @param params - Parameters including the main account address and chain ID
 * @returns Object containing the signing key, signer account, address, and signature
 */
async function getSigner({
  account,
  chainId,
}: GetSignerParams): Promise<GetSignerResult> {
  const signingKey = generatePrivateKey()
  const signerAccount = privateKeyToAccount(signingKey)
  const signerAddress = signerAccount.address

  const nonce = createClientNonce(account)

  const domain = {
    chainId,
    name: 'RISEx',
    verifyingContract: RISEX_AUTH_CONTRACT,
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
    types: { VerifySigner: REGISTER_TYPES.VerifySigner },
  })

  return {
    nonce,
    signerAccount,
    signerAddress,
    signerSignature,
    signingKey,
  }
}

/**
 * Creates the account signature for registering a signer.
 *
 * This function:
 * 1. Constructs the RegisterSigner message
 * 2. Signs the typed data with the signer account
 *
 * @param params - Parameters including the signer account, address, nonce, expiration, and chain ID
 * @returns Object containing the message, typed message, and account signature
 */
async function getAccountSignature({
  chainId,
  expiration,
  nonce,
  signerAddress,
  signTypedDataAsync,
}: GetAccountSignatureParams): Promise<GetAccountSignatureResult> {
  const message = 'Please sign in with your wallet to access RISEx.'
  const toSignMessage: RegisterSignerMessage = {
    expiration: expiration.toString(),
    message,
    nonce,
    signer: signerAddress,
  }

  const domain = {
    chainId,
    name: 'RISEx',
    verifyingContract: RISEX_AUTH_CONTRACT,
    version: '1',
  }

  let accountSignature: any

  accountSignature = await signTypedDataAsync({
    domain: domain as any,
    message: {
      expiration,
      message,
      nonce: BigInt(toSignMessage.nonce),
      signer: toSignMessage.signer,
    },
    primaryType: 'RegisterSigner',
    types: REGISTER_TYPES,
  })

  if (SignatureErc8010.validate(accountSignature)) {
    const { signature } = SignatureErc8010.unwrap(accountSignature)
    accountSignature = signature
  }

  return {
    accountSignature: AddressFormatter.formatSignature(
      accountSignature,
    ) as Address,
    message,
    toSignMessage,
  }
}

/**
 * Calls the RiseX contract to register the signer.
 *
 * @param params - All parameters needed for the contract call
 * @param sendCallsSyncAsync - Function to send the contract call
 * @returns Contract call response
 */
async function registerSignerContract(
  params: RegisterSignerContractParams,
  sendCallsSyncAsync: ReturnType<typeof useSendCallsSync>['sendCallsSyncAsync'],
) {
  const {
    account,
    accountSignature,
    chainId,
    expiration,
    message,
    nonce,
    signerAddress,
    signerSignature,
  } = params

  const response = await sendCallsSyncAsync({
    calls: [
      {
        abi: RISEX_AUTH_ABI,
        args: [
          account,
          signerAddress,
          message,
          BigInt(nonce),
          expiration,
          accountSignature,
          signerSignature,
        ],
        functionName: 'registerSigner',
        to: RISEX_AUTH_CONTRACT,
      },
    ],
    chainId: chainId as any,
    timeout: 180_000,
  })

  console.log('response:: ', response)

  return response
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
 * const registerSigner = useRegisterSigner()
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
  const [isPending, setIsPending] = useState(false)

  const { signTypedDataAsync } = useSignTypedData()
  const { sendCallsSyncAsync } = useSendCallsSync({
    mutation: {
      retry: false,
    },
  })

  const authenticate = async ({
    account,
    chainId = 11155931, // Default to RISE testnet
    expirationDays = 7,
  }: {
    account: Address
    chainId?: number
    expirationDays?: number
  }) => {
    try {
      setIsPending(true)

      // Calculate expiration timestamp (in seconds) = 7 days from now
      const expiration = Math.floor(Date.now() / 1000) + expirationDays * 86400

      // Step 1: Generate signer and create signer signature
      const { signingKey, signerAddress, signerSignature, nonce } =
        await getSigner({
          account,
          chainId,
        })

      // Step 2: Create account signature
      const { message, accountSignature } = await getAccountSignature({
        chainId,
        expiration,
        nonce,
        signerAddress,
        signTypedDataAsync,
      })

      // Step 3: Register signer via contract call
      const response = await registerSignerContract(
        {
          account,
          accountSignature,
          chainId,
          expiration,
          message,
          nonce,
          signerAddress,
          signerSignature,
        },
        sendCallsSyncAsync,
      )

      // Get transaction hash from receipts
      const hash = response.receipts?.[0]?.transactionHash

      return {
        accountSignature,
        expiration,
        hash,
        nonce,
        response,
        signer: signerAddress,
        signerSignature,
        signingKey, // IMPORTANT: Store this securely - it authorizes all transactions
      }
    } catch (e) {
      console.log('Error in authenticate:: ', e)
    } finally {
      setIsPending(false)
    }
  }

  return {
    authenticate,
    isPending,
  }
}
