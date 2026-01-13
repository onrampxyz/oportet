import type { Address } from 'viem'
import type { privateKeyToAccount } from 'viem/accounts'
import type { useSignTypedData } from 'wagmi'
import type { OrderSide, OrderType, STPMode, TimeInForce } from './order'

/**
 * Message format for verifying a signer
 */
export type VerifySignerMessage = {
  account: Address
  nonce: string
}

/**
 * Message format for registering a signer
 */
export type RegisterSignerMessage = {
  expiration: string
  message: string
  nonce: string
  signer: Address
}

/**
 * Parameters for getSigner function
 */
export type GetSignerParams = {
  account: Address
  chainId: number
}

/**
 * Result from getSigner function
 */
export type GetSignerResult = {
  signingKey: `0x${string}`
  signerAccount: ReturnType<typeof privateKeyToAccount>
  signerAddress: Address
  signerSignature: `0x${string}`
  nonce: string
}

/**
 * Parameters for getAccountSignature function
 */
export type GetAccountSignatureParams = {
  signerAddress: Address
  nonce: string
  expiration: number
  chainId: number
  signTypedDataAsync: ReturnType<typeof useSignTypedData>['signTypedDataAsync']
}

/**
 * Result from getAccountSignature function
 */
export type GetAccountSignatureResult = {
  message: string
  toSignMessage: RegisterSignerMessage
  accountSignature: `0x${string}`
}

/**
 * Parameters for registerSignerContract function
 */
export type RegisterSignerContractParams = {
  account: Address
  signerAddress: Address
  message: string
  nonce: string
  expiration: number
  accountSignature: `0x${string}`
  signerSignature: `0x${string}`
  chainId: number
}

/**
 * Parameters for encoding place order data
 */
export type EncodePlaceOrderParams = {
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

/**
 * Parameters for encoding cancel order data
 */
export type EncodeCancelOrderParams = {
  marketId: string
  orderId: bigint
}

/**
 * Parameters for signing order data
 */
export type SignOrderDataParams = {
  account: `0x${string}`
  encodedData: `0x${string}`
  signingKey: `0x${string}`
}

/**
 * Result from signing order data
 */
export type SignOrderDataResult = {
  nonce: string
  signature: `0x${string}`
}
