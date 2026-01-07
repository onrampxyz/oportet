import { useQuery } from '@tanstack/react-query'
import type { Address } from 'ox'
import type { PositionsResponse } from '~/types/perps/position'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

export function useOpenPositions({
  address,
  enabled = true,
  marketId,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
  marketId?: string
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (address) params.append('account', address)
      if (marketId) params.append('market_id', marketId)

      const response = await fetch(
        `${API_BASE_URL}/v1/positions?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch open orders: ${response.statusText}`)
      }
      return response.json() as Promise<PositionsResponse>
    },
    queryKey: ['orders', 'open', address, marketId],
    refetchInterval: 10_000, // Refetch every 5 seconds
    staleTime: 3_000, // Consider data stale after 3 seconds
  })
}
