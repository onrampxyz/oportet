import { useMutation } from '@tanstack/react-query'
import type { Address } from 'ox'
import { createClientNonce } from '~/hooks/perps/useRegisterSigner'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

type PermitParams = {
  account: Address.Address
  signer: string
  deadline: string
  signature: `0x${string}`
  nonce: string
}

type DepositTokenRequest = {
  account: Address.Address
  amount?: string
  token?: string
  permit_params: PermitParams
}

type DepositTokenResponse = {
  data: {
    amount: string
    hash?: string
    status: string
    token: string
  }
  request_id: string
}

/**
 * Deposits tokens to an account (faucet functionality)
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useDepositToken()
 *
 * mutate({
 *   account: '0x1234...',
 *   signer: '0x5678...',
 *   amount: '1000',
 *   token: 'USDC'
 * })
 * ```
 */
export function useDepositToken() {
  return useMutation({
    mutationFn: async ({
      account,
      amount,
      signer,
      token,
    }: {
      account: Address.Address
      amount?: string
      token?: string
      signer?: string
    }) => {
      const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000
      const expiresAt = Math.floor((Date.now() + SEVEN_DAYS) / 1000)

      const request: DepositTokenRequest = {
        account,
        amount,
        permit_params: {
          account,
          deadline: expiresAt.toString(),
          nonce: createClientNonce(account),
          signature: `0x${'0'.repeat(130)}`,
          signer: signer || '',
        },
        token,
      }

      const response = await fetch(`${API_BASE_URL}/v1/account/deposit`, {
        body: JSON.stringify(request),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Failed to deposit tokens: ${response.statusText}`)
      }

      return response.json() as Promise<DepositTokenResponse>
    },
    mutationKey: ['deposit-token'],
  })
}
