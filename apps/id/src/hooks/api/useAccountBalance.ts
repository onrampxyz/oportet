import { useQuery } from '@tanstack/react-query'
import type { Address } from 'ox'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

type AccountBalanceResponse = {
  data: {
    balance: string
  }
  request_id: string
}

/**
 * Fetches account balance for a specific token
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAccountBalance({
 *   userAddress: '0x1234...',
 *   tokenAddress: '0x5678...',
 *   enabled: true
 * })
 *
 * console.log(data?.balance) // "2000000000000000000000"
 * ```
 */
export function useAccountBalance({
  enabled = true,
  tokenAddress,
  userAddress,
}: {
  enabled?: boolean
  tokenAddress?: Address.Address
  userAddress?: Address.Address
}) {
  const query = useQuery({
    enabled: enabled && !!userAddress && !!tokenAddress,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (userAddress) params.append('account', userAddress)
      if (tokenAddress) params.append('token', tokenAddress)

      const response = await fetch(
        `${API_BASE_URL}/v1/account/balance?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch account balance: ${response.statusText}`,
        )
      }

      return response.json() as Promise<AccountBalanceResponse>
    },
    queryKey: ['account-balance', userAddress, tokenAddress],
    refetchInterval: 10_000, // Refetch every 10 seconds
    staleTime: 5_000, // Consider data stale after 5 seconds
  })

  return {
    balance: query.data?.data.balance,
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    requestId: query.data?.request_id,
  }
}
