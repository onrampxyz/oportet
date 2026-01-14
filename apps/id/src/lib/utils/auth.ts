import { encodePacked, type Hex, keccak256 } from 'viem'
import { DEFAULT_CHAIN_ID, RISEX_AUTH_CONTRACT } from '~/constants/auth'
import type {
  EncodeCancelOrderParams,
  EncodePlaceOrderParams,
} from '~/types/perps/auth'
import { type ExpiredAt, OrderSide, TimeInForce } from '~/types/perps/order'

/**
 * Gets the RISEx EIP-712 domain configuration
 *
 * @param authContractAddress - The address of the auth contract
 * @returns EIP-712 domain object
 */
export const getRISExDomain = (
  authContractAddress: `0x${string}` = RISEX_AUTH_CONTRACT,
) => ({
  chainId: DEFAULT_CHAIN_ID,
  name: 'RISEx',
  verifyingContract: authContractAddress,
  version: '1',
})

/**
 * Generates a timestamp in nanoseconds with random padding
 * Used for creating unique nonces
 *
 * @returns Timestamp string with nanosecond precision
 */
export const nowInNano = (): string => {
  const rand6Digits = Math.round(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')

  const timestamp = Date.now() // milliseconds since epoch

  return `${timestamp}${rand6Digits}`
}

/**
 * Hashes a string to a 32-bit unsigned integer
 * Used for creating address-specific nonce components
 *
 * @param input - String to hash
 * @returns 32-bit unsigned integer
 */
export function hashToUint32(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 31 + input.charCodeAt(i)) | 0
  }
  // eslint-disable-next-line no-bitwise
  return hash >>> 0
}

/**
 * Creates a unique client nonce incorporating the address
 * Used for preventing replay attacks
 *
 * @param address - User's wallet address
 * @returns Unique nonce string
 */
export const createClientNonce = (address: string | undefined): string => {
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
 * Encodes place order data into packed binary format
 *
 * The encoding format is:
 * - uint64: marketId (8 bytes)
 * - uint128: size (16 bytes)
 * - uint128: price (16 bytes)
 * - uint8: flags (1 byte) - bit 0: side, bit 1: postOnly, bit 2: reduceOnly, bits 3-4: stpMode
 * - uint8: orderType (1 byte)
 * - uint8: timeInForce (1 byte)
 * - uint32: expiry (4 bytes)
 *
 * @param params - Order parameters
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
 * The encoding format is:
 * - uint64: marketId (8 bytes)
 * - uint192: orderId (24 bytes)
 *
 * Note: viem's encodePacked doesn't support uint192 directly,
 * so we manually construct the bytes.
 *
 * @param params - Cancel order parameters
 * @returns Hex-encoded packed data
 */
export const encodeCancelOrderData = ({
  marketId,
  orderId,
}: EncodeCancelOrderParams): Hex => {
  // uint64 (8 bytes) + uint192 (24 bytes) = 32 bytes total
  const marketIdBytes = encodePacked(['uint64'], [BigInt(marketId)])
  // Convert orderId to 24-byte hex string (uint192)
  // 24 bytes = 48 hex characters
  const orderIdHex = orderId.toString(16).padStart(48, '0')
  // Concatenate: marketId (8 bytes) + orderId (24 bytes) = 32 bytes
  // Remove 0x prefix from marketIdBytes and prepend 0x to the final result
  return `0x${marketIdBytes.slice(2)}${orderIdHex}` as Hex
}

/**
 * Hashes encoded data using keccak256
 * Used before signing order operations
 *
 * @param encodedData - Hex-encoded data to hash
 * @returns Keccak256 hash of the data
 */
export const hashEncodedData = (encodedData: Hex): Hex => {
  return keccak256(encodedData)
}

export const convertExpiredAtToSeconds = (expiredAt: ExpiredAt) => {
  const unitToSeconds: Record<string, number> = {
    d: 86400, // days
    h: 3600, // hours
    m: 60, // minutes
    s: 1, // seconds
  }

  const seconds = expiredAt.num * (unitToSeconds[expiredAt.unit] || 1)
  const nowInSeconds = Math.floor(Date.now() / 1000)

  return seconds + nowInSeconds
}
