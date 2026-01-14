import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import {
  DEFAULT_CHAIN_ID,
  REGISTER_TYPES,
  RISEX_AUTH_CONTRACT,
} from '~/constants/auth'
import { createClientNonce, getRISExDomain } from '~/lib/utils/auth'
import type {
  GetSignerParams,
  GetSignerResult,
  VerifySignerMessage,
} from '~/types/perps/auth'

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
 *
 * @example
 * ```tsx
 * const { signingKey, signerAddress, signerSignature, nonce } = await getSigner({
 *   account: '0x1234...',
 *   chainId: 11155931
 * })
 * ```
 */
export async function getSigner({
  account,
  chainId = DEFAULT_CHAIN_ID,
}: GetSignerParams): Promise<GetSignerResult> {
  const signingKey = generatePrivateKey()
  const signerAccount = privateKeyToAccount(signingKey)
  const signerAddress = signerAccount.address

  const nonce = createClientNonce(account)
  const domain = getRISExDomain(RISEX_AUTH_CONTRACT)

  const verifySignerMessage: VerifySignerMessage = {
    account,
    nonce,
  }

  const signingKeySignature = await signerAccount.signTypedData({
    domain: {
      ...domain,
      chainId,
    },
    message: verifySignerMessage,
    primaryType: 'VerifySigner',
    types: { VerifySigner: REGISTER_TYPES.VerifySigner },
  })

  return {
    nonce,
    signerAccount,
    signerAddress,
    signingKey,
    signingKeySignature,
  }
}
