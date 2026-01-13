import { SignatureErc8010 } from 'ox/erc8010'
import { useState } from 'react'
import { type Address, encodePacked, type Hex, keccak256 } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useSendCallsSync, useSignTypedData } from 'wagmi'
import {
  OrderSide,
  type OrderType,
  type STPMode,
  TimeInForce,
} from '~/types/perps/order'
import { AddressFormatter } from '~/utils'

// mainnet
// export const RISEX_AUTH_CONTRACT =
//   '0xE97B9CCe868f7d221395764F74581f2BE955DEF5' as Address

// export const RISEX_PERP_CONTRACT =
//   '0xa05E081c59e5eAe31F1C7def4FBb2C98648dCfc2' as Address

// export const RISEX_USDC_CONTRACT =
//   '0x8d17fc7db6b4fcf40afb296354883dec95a12f58' as Address

// from api/config
// testnet
export const RISEX_AUTH_CONTRACT =
  '0x8d8708f9d87ef522c1f99dd579bf6a051e34c28e' as Address

export const RISEX_PERP_CONTRACT =
  '0x68cacd54a8c93a3186bf50be6b78b761f728e1b4' as Address

export const RISEX_USDC_CONTRACT =
  '0x8d17fc7db6b4fcf40afb296354883dec95a12f58' as Address

// testnet
// export const RISEX_AUTH_CONTRACT =
//   '0xc81317B0d589Cd0414Ae14d62aa909A967799682' as Address

// export const RISEX_PERP_CONTRACT =
//   '0x19Ec7351883158a5ff264EE3cfD12293fcA3aA6A' as Address

// export const RISEX_USDC_CONTRACT =
//   '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393' as Address

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

const VERIFY_SIGNATURE_TYPES = {
  VerifySignature: [
    { name: 'account', type: 'address' },
    { name: 'target', type: 'address' },
    { name: 'hash', type: 'bytes32' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
}

const getRISExDomain = (authContractAddress: `0x${string}`) => ({
  chainId: 11155931, // RISE testnet
  name: 'RISEx',
  verifyingContract: authContractAddress,
  version: '1',
})

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

      console.log('authenticate-response:: ', response)

      // Get transaction hash from receipts
      const hash = response.receipts?.[0]?.transactionHash

      localStorage.setItem(
        'risex-authInfo',
        JSON.stringify({
          permissionExpiration: expiration,
          signer: signerAddress,
          signerSignature,
          signingKey,
        }),
      )

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

/**
 * Signs place order data with the signing key
 *
 * @param encodedData - The encoded order data to sign
 * @param signingKey - The private key for signing
 * @param account - The user's account address
 * @param deadline - The deadline timestamp for the signature
 * @returns Object containing the signature and nonce
 */
export const signPlaceOrderData = async ({
  account,
  encodedData,
  signingKey,
}: {
  account: `0x${string}`
  encodedData: Hex
  signingKey: `0x${string}`
}): Promise<{ nonce: string; signature: `0x${string}` }> => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
  try {
    const signerAccount = privateKeyToAccount(signingKey)

    // Hash the encoded data before signing
    const messageHash = keccak256(encodedData)

    // Generate nonce
    const nonce = createClientNonce(account)

    const deadline = Math.floor((Date.now() + SEVEN_DAYS) / 1000)

    const domain = getRISExDomain(RISEX_AUTH_CONTRACT)

    const signingKeySignature = await signerAccount.signTypedData({
      domain,
      message: {
        account,
        deadline,
        hash: messageHash,
        nonce: BigInt(nonce),
        target: RISEX_PERP_CONTRACT,
      },
      primaryType: 'VerifySignature',
      types: { VerifySignature: VERIFY_SIGNATURE_TYPES.VerifySignature },
    })

    return { nonce, signature: signingKeySignature }
  } catch (e) {
    console.log('error-signPlaceOrderData:: ', e)

    return {
      nonce: '',
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    }
  }
}

/**
 * Signs cancel order data with the signing key
 *
 * @param encodedData - The encoded cancel order data to sign
 * @param signingKey - The private key for signing
 * @param account - The user's account address
 * @param deadline - The deadline timestamp for the signature
 * @returns Object containing the signature and nonce
 */
export const signCancelOrderData = async ({
  account,
  encodedData,
  signingKey,
}: {
  account: `0x${string}`
  encodedData: Hex
  signingKey: `0x${string}`
}): Promise<{ nonce: string; signature: `0x${string}` }> => {
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

  const signerAccount = privateKeyToAccount(signingKey)

  // Hash the encoded data before signing
  const messageHash = keccak256(encodedData)

  // Generate nonce
  const nonce = createClientNonce(account)
  const domain = getRISExDomain(RISEX_AUTH_CONTRACT)

  const deadline = Math.floor((Date.now() + SEVEN_DAYS) / 1000)

  const signingKeySignature = await signerAccount.signTypedData({
    domain,
    message: {
      account,
      deadline,
      hash: messageHash,
      nonce: BigInt(nonce),
      target: RISEX_PERP_CONTRACT,
    },
    primaryType: 'VerifySignature',
    types: { VerifySignature: VERIFY_SIGNATURE_TYPES.VerifySignature },
  })

  return { nonce, signature: signingKeySignature }
}

/**
 * Type definitions for encoding order data
 */
type EncodePlaceOrderParams = {
  expiry: number
  marketId: string
  orderType: OrderType
  postOnly: boolean
  price: bigint
  reduceOnly: boolean
  side: OrderSide
  size: bigint
  stpMode: STPMode
  timeInForce?: TimeInForce
}

type EncodeCancelOrderParams = {
  marketId: string
  orderId: bigint
}

/**
 * Encodes place order data into packed binary format
 *
 * @param marketId - Market ID (uint64)
 * @param size - Order size (uint128)
 * @param price - Order price (uint128)
 * @param side - Order side (Long/Short)
 * @param stpMode - Self-trade prevention mode
 * @param orderType - Order type (Market/Limit)
 * @param postOnly - Post-only flag
 * @param reduceOnly - Reduce-only flag
 * @param timeInForce - Time in force option (defaults to GoodTillCancelled)
 * @param expiry - Expiry timestamp (uint32)
 * @returns Hex-encoded packed data
 */
export const encodePlaceOrderData = ({
  expiry,
  marketId,
  orderType,
  postOnly,
  price,
  reduceOnly,
  side,
  size,
  stpMode,
  timeInForce = TimeInForce.GoodTillCancelled,
}: EncodePlaceOrderParams): Hex => {
  // Pack flags: bit 0 = side, bit 1 = postOnly, bit 2 = reduceOnly, bits 3-4 = stpMode
  let flags = 0
  if (side === OrderSide.Short) flags |= 0x01 // bit 0: side (0 = Long/Buy, 1 = Short/Sell)
  if (postOnly) flags |= 0x02 // bit 1: postOnly
  if (reduceOnly) flags |= 0x04 // bit 2: reduceOnly
  flags |= stpMode << 3 // bits 3-4: stpMode

  return encodePacked(
    ['uint64', 'uint128', 'uint128', 'uint8', 'uint8', 'uint8', 'uint32'],
    [BigInt(marketId), size, price, flags, orderType, timeInForce, expiry],
  )
}

/**
 * Encodes cancel order data into packed binary format
 *
 * @param marketId - Market ID (uint64)
 * @param orderId - Order ID (uint192)
 * @returns Hex-encoded packed data
 */
export const encodeCancelOrderData = ({
  marketId,
  orderId,
}: EncodeCancelOrderParams): Hex => {
  // Since viem's encodePacked doesn't support uint192 directly, we manually construct the bytes
  // uint64 (8 bytes) + uint192 (24 bytes) = 32 bytes total
  const marketIdBytes = encodePacked(['uint64'], [BigInt(marketId)])
  // Convert orderId to 24-byte hex string (uint192)
  // 24 bytes = 48 hex characters
  const orderIdHex = orderId.toString(16).padStart(48, '0')
  // Concatenate: marketId (8 bytes) + orderId (24 bytes) = 32 bytes
  // Remove 0x prefix from marketIdBytes and prepend 0x to the final result
  return `0x${marketIdBytes.slice(2)}${orderIdHex}` as Hex
}
