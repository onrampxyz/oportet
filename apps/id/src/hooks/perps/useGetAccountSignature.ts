import { SignatureErc8010 } from 'ox/erc8010'
import type { Address } from 'viem'
import {
  DEFAULT_CHAIN_ID,
  REGISTER_TYPES,
  RISEX_AUTH_CONTRACT,
} from '~/constants/auth'
import { getRISExDomain } from '~/lib/utils/auth'
import type {
  GetAccountSignatureParams,
  GetAccountSignatureResult,
  RegisterSignerMessage,
} from '~/types/perps/auth'
import { AddressFormatter } from '~/utils'

/**
 * Creates the account signature for registering a signer.
 *
 * This function:
 * 1. Constructs the RegisterSigner message
 * 2. Signs the typed data with the user's account
 * 3. Unwraps ERC-8010 signatures if needed
 *
 * @param params - Parameters including the signer address, nonce, expiration, and signing function
 * @returns Object containing the message, typed message, and account signature
 *
 * @example
 * ```tsx
 * const { accountSignature, message } = await getAccountSignature({
 *   signerAddress: '0x5678...',
 *   nonce: '123456',
 *   expiration: 1234567890,
 *   chainId: 11155931,
 *   signTypedDataAsync
 * })
 * ```
 */
export async function getAccountSignature({
  chainId = DEFAULT_CHAIN_ID,
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

  const domain = getRISExDomain(RISEX_AUTH_CONTRACT)

  let accountSignature: any = await signTypedDataAsync({
    domain: {
      ...domain,
      chainId,
    } as any,
    message: {
      expiration,
      message,
      nonce: BigInt(toSignMessage.nonce),
      signer: toSignMessage.signer,
    },
    primaryType: 'RegisterSigner',
    types: REGISTER_TYPES,
  })

  // Unwrap ERC-8010 signatures if needed
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
