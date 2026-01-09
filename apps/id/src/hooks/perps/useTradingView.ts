import { useQuery } from '@tanstack/react-query'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

export type CandleData = {
  close: string
  high: string
  interval: string
  low: string
  market_id: string
  open: string
  time: string
  volume: string
}

export type TradingViewResponse = {
  data: {
    data: CandleData[]
  }
  request_id: string
}

/**
 * Fetches trading view candlestick data for a specific market
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTradingView({
 *   market_id: '1',
 *   interval: '1m',
 *   limit: 100,
 *   enabled: true
 * })
 * ```
 */
export function useTradingView({
  enabled = true,
  interval = '1m',
  limit = 100,
  market_id,
}: {
  enabled?: boolean
  interval?: string
  limit?: number
  market_id: string
}) {
  const query = useQuery({
    enabled: enabled && !!market_id,
    queryFn: async () => {
      const params = new URLSearchParams()
      // if (interval) params.append('interval', interval)
      // if (limit) params.append('limit', limit.toString())

      const response = await fetch(
        `${API_BASE_URL}/v1/markets/id/${market_id}/trading-view-data?${params.toString()}`,
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch trading view data: ${response.statusText}`,
        )
      }

      return response.json() as Promise<TradingViewResponse>
    },
    queryKey: ['trading-view', market_id, interval, limit],
    refetchInterval: 10_000, // Refetch every 10 seconds
    staleTime: 5_000, // Consider data stale after 5 seconds
  })

  return {
    candleData: query.data?.data.data || [],
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    requestId: query.data?.request_id,
  }
}
