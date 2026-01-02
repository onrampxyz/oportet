import { useQuery } from '@tanstack/react-query'
import type { Address } from 'ox'
import type { AccountBalance } from '~/types/market'

const API_BASE_URL = process.env.VITE_API_BASE_URL

/**
 * Fetches account balance for a given address
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAccountBalance({
 *   address: '0x1234...',
 *   enabled: true
 * })
 * ```
 */
export function useAccountBalance({
  address,
  enabled = true,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/v1/account/balance?user=${address}`,
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch account balance: ${response.statusText}`,
        )
      }
      return response.json() as Promise<AccountBalance[]>
    },
    queryKey: ['account', 'balance', address],
    refetchInterval: 10_000, // Refetch every 10 seconds
    staleTime: 5_000, // Consider data stale after 5 seconds
  })
}
