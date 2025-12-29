import { useQuery } from '@tanstack/react-query'
import type { Market, Orderbook, Trade } from '~/types/rise'

const API_BASE_URL = process.env.API_BASE_URL

/**
 * Fetches all markets
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMarkets({
 *   enabled: true
 * })
 * ```
 */
export function useMarkets({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/v1/markets`)
      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.statusText}`)
      }
      return response.json() as Promise<Market[]>
    },
    queryKey: ['markets'],
    refetchInterval: 30_000, // Refetch every 30 seconds
    staleTime: 20_000, // Consider data stale after 20 seconds
  })
}

/**
 * Fetches trade history for a specific market
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMarketTradeHistory({
 *   marketId: 'BTC-USDC',
 *   limit: 50,
 *   enabled: true
 * })
 * ```
 */
export function useMarketTradeHistory({
  enabled = true,
  limit = 100,
  marketId,
}: {
  enabled?: boolean
  limit?: number
  marketId: string
}) {
  return useQuery({
    enabled: enabled && !!marketId,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(
        `${API_BASE_URL}/v1/markets/id/${marketId}/trade-history?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch market trade history: ${response.statusText}`,
        )
      }
      return response.json() as Promise<Trade[]>
    },
    queryKey: ['markets', 'trade-history', marketId, limit],
    refetchInterval: 5_000, // Refetch every 5 seconds
    staleTime: 3_000, // Consider data stale after 3 seconds
  })
}

/**
 * Fetches global trade history (all markets)
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useTradeHistory({
 *   limit: 50,
 *   enabled: true
 * })
 * ```
 */
export function useTradeHistory({
  enabled = true,
  limit = 100,
}: {
  enabled?: boolean
  limit?: number
} = {}) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(
        `${API_BASE_URL}/v1/trade-history?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch trade history: ${response.statusText}`)
      }
      return response.json() as Promise<Trade[]>
    },
    queryKey: ['trade-history', limit],
    refetchInterval: 5_000, // Refetch every 5 seconds
    staleTime: 3_000, // Consider data stale after 3 seconds
  })
}

/**
 * Fetches orderbook levels for a specific market or all markets
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOrderbookLevels({
 *   marketId: 'BTC-USDC',
 *   depth: 20,
 *   enabled: true
 * })
 * ```
 */
export function useOrderbookLevels({
  depth = 10,
  enabled = true,
  marketId,
}: {
  depth?: number
  enabled?: boolean
  marketId?: string
} = {}) {
  return useQuery({
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (marketId) params.append('market_id', marketId)
      if (depth) params.append('depth', depth.toString())

      const response = await fetch(
        `${API_BASE_URL}/v1/orderbooks?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(
          `Failed to fetch orderbook levels: ${response.statusText}`,
        )
      }
      return response.json() as Promise<Orderbook | Orderbook[]>
    },
    queryKey: ['orderbooks', marketId, depth],
    refetchInterval: 2_000, // Refetch every 2 seconds
    staleTime: 1_000, // Consider data stale after 1 second
  })
}

/**
 * Combined hook that fetches all market data at once
 *
 * @example
 * ```tsx
 * const market = useMarket({
 *   marketId: 'BTC-USDC',
 *   tradeHistoryLimit: 50,
 *   orderbookDepth: 20,
 *   enabled: true
 * })
 *
 * console.log(market.markets.data)
 * console.log(market.tradeHistory.data)
 * console.log(market.orderbook.data)
 * ```
 */
export function useMarket({
  enabled = true,
  marketId,
  orderbookDepth = 10,
  tradeHistoryLimit = 100,
}: {
  enabled?: boolean
  marketId?: string
  orderbookDepth?: number
  tradeHistoryLimit?: number
} = {}) {
  const markets = useMarkets({ enabled })
  const marketTradeHistory = useMarketTradeHistory({
    enabled: enabled && !!marketId,
    limit: tradeHistoryLimit,
    marketId: marketId || '',
  })
  const tradeHistory = useTradeHistory({ enabled, limit: tradeHistoryLimit })
  const orderbook = useOrderbookLevels({
    depth: orderbookDepth,
    enabled,
    marketId,
  })

  return {
    error:
      markets.error ||
      marketTradeHistory.error ||
      tradeHistory.error ||
      orderbook.error,
    isError:
      markets.isError ||
      marketTradeHistory.isError ||
      tradeHistory.isError ||
      orderbook.isError,
    isLoading:
      markets.isLoading ||
      marketTradeHistory.isLoading ||
      tradeHistory.isLoading ||
      orderbook.isLoading,
    marketTradeHistory,
    markets,
    orderbook,
    tradeHistory,
  }
}