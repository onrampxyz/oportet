import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Address } from 'ox'
import type {
  CancelOrderRequest,
  CancelOrderResponse,
  Order,
  PlaceOrderRequest,
  PlaceOrderResponse,
} from '~/types/market'
import type { OrderHistoryResponse } from '~/types/perps/market'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

/**
 * Places a new order
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = usePlaceOrder()
 *
 * mutate({
 *   market_id: 'BTC-USDC',
 *   side: 'buy',
 *   type: 'limit',
 *   price: '50000',
 *   quantity: '0.1'
 * })
 * ```
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (order: PlaceOrderRequest) => {
      const response = await fetch(`${API_BASE_URL}/v1/orders/place`, {
        body: JSON.stringify(order),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`)
      }
      return response.json() as Promise<PlaceOrderResponse>
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'open'] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['orderbooks'] })
    },
  })
}

/**
 * Fetches open orders for a user
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOpenOrders({
 *   address: '0x1234...',
 *   marketId: 'BTC-USDC',
 *   enabled: true
 * })
 * ```
 */
export function useOpenOrders({
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
        `${API_BASE_URL}/v1/orders/open?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch open orders: ${response.statusText}`)
      }
      return response.json() as Promise<Order[]>
    },
    queryKey: ['orders', 'open', address, marketId],
    refetchInterval: 5_000, // Refetch every 5 seconds
    staleTime: 3_000, // Consider data stale after 3 seconds
  })
}

/**
 * Cancels an order
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useCancelOrder()
 *
 * mutate({
 *   order_id: 'order_123'
 * })
 * ```
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: CancelOrderRequest) => {
      const response = await fetch(`${API_BASE_URL}/v1/orders/cancel`, {
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`Failed to cancel order: ${response.statusText}`)
      }
      return response.json() as Promise<CancelOrderResponse>
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['orders', 'open'] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'history'] })
      queryClient.invalidateQueries({ queryKey: ['orderbooks'] })
    },
  })
}

/**
 * Fetches order history for a user
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useOrderHistory({
 *   address: '0x1234...',
 *   marketId: 'BTC-USDC',
 *   limit: 50,
 *   enabled: true
 * })
 * ```
 */
export function useOrderHistory({
  address,
  enabled = true,
  limit = 100,
  marketId,
  status,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
  limit?: number
  marketId?: string
  status?: string
}) {
  return useQuery({
    enabled: enabled && !!address,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (address) params.append('account', address)
      if (marketId) params.append('market_id', marketId)
      if (status) params.append('statuses', status)
      if (limit) params.append('limit', limit.toString())

      const response = await fetch(
        `${API_BASE_URL}/v1/orders?${params.toString()}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch order history: ${response.statusText}`)
      }
      return response.json() as Promise<OrderHistoryResponse>
    },
    queryKey: ['orders', 'history', address, marketId, limit],
    refetchInterval: 5_000, // Refetch every 5 seconds
    staleTime: 5_000, // Consider data stale after 5 seconds
  })
}

/**
 * Combined hook that provides all order-related functionality
 *
 * @example
 * ```tsx
 * const orderbook = useOrderbook({
 *   address: '0x1234...',
 *   marketId: 'BTC-USDC',
 *   historyLimit: 50,
 *   enabled: true
 * })
 *
 * // Query data
 * console.log(orderbook.openOrders.data)
 * console.log(orderbook.history.data)
 *
 * // Place order
 * orderbook.placeOrder.mutate({
 *   market_id: 'BTC-USDC',
 *   side: 'buy',
 *   type: 'limit',
 *   price: '50000',
 *   quantity: '0.1'
 * })
 *
 * // Cancel order
 * orderbook.cancelOrder.mutate({ order_id: 'order_123' })
 * ```
 */
export function useOrderbook({
  address,
  enabled = true,
  historyLimit = 100,
  marketId,
}: {
  address?: Address.Address | undefined
  enabled?: boolean
  historyLimit?: number
  marketId?: string
} = {}) {
  const openOrders = useOpenOrders({ address, enabled, marketId })
  const history = useOrderHistory({
    address,
    enabled,
    limit: historyLimit,
    marketId,
  })
  const placeOrder = usePlaceOrder()
  const cancelOrder = useCancelOrder()

  return {
    cancelOrder,
    error: openOrders.error || history.error,
    history,
    isError: openOrders.isError || history.isError,
    isLoading: openOrders.isLoading || history.isLoading,
    openOrders,
    placeOrder,
  }
}
