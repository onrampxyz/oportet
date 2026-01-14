import { privateKeyToAccount } from 'viem/accounts'
import {
  RISEX_AUTH_CONTRACT,
  RISEX_PERP_CONTRACT,
  VERIFY_SIGNATURE_TYPES,
} from '~/constants/auth'
import {
  createClientNonce,
  getRISExDomain,
  hashEncodedData,
} from '~/lib/utils/auth'
import type {
  SignOrderDataParams,
  SignOrderDataResult,
} from '~/types/perps/auth'

/**
 * Signs place order data with the signing key
 *
 * This function:
 * 1. Hashes the encoded order data
 * 2. Creates a unique nonce
 * 3. Signs the VerifySignature typed data with the signing key
 *
 * @param params - Parameters including account, encoded data, and signing key
 * @returns Object containing the signature and nonce
 *
 * @example
 * ```tsx
 * const { signature, nonce } = await signPlaceOrderData({
 *   account: '0x1234...',
 *   encodedData: '0xabcd...',
 *   signingKey: '0x...'
 * })
 * ```
 */
export const signPlaceOrderData = async ({
  account,
  encodedData,
  signingKey,
  deadline,
}: SignOrderDataParams): Promise<SignOrderDataResult> => {
  try {
    const signerAccount = privateKeyToAccount(signingKey)

    console.log('signerAccount:: ', signerAccount)

    // Hash the encoded data before signing
    const messageHash = hashEncodedData(encodedData)

    // Generate nonce
    const nonce = createClientNonce(account)
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
    console.error('Error in signPlaceOrderData:', e)

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
 * This function:
 * 1. Hashes the encoded cancel order data
 * 2. Creates a unique nonce
 * 3. Signs the VerifySignature typed data with the signing key
 *
 * @param params - Parameters including account, encoded data, and signing key
 * @returns Object containing the signature and nonce
 *
 * @example
 * ```tsx
 * const { signature, nonce } = await signCancelOrderData({
 *   account: '0x1234...',
 *   encodedData: '0xabcd...',
 *   signingKey: '0x...'
 * })
 * ```
 */
export const signCancelOrderData = async ({
  account,
  encodedData,
  signingKey,
  deadline,
}: SignOrderDataParams): Promise<SignOrderDataResult> => {
  try {
    const signerAccount = privateKeyToAccount(signingKey)

    // Hash the encoded data before signing
    const messageHash = hashEncodedData(encodedData)

    // Generate nonce
    const nonce = createClientNonce(account)

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
    console.error('Error in signCancelOrderData:', e)

    return {
      nonce: '',
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    }
  }
}
