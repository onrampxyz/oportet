import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Address } from 'ox'
import { parseEther } from 'viem'
import {
  encodeCancelOrderData,
  encodePlaceOrderData,
  signCancelOrderData,
  signPlaceOrderData,
} from '~/hooks/perps/useRegisterSigner'
import type { CancelOrderResponse, Order } from '~/types/market'
import type {
  OrderHistoryResponse,
  PlaceOrderResponse,
} from '~/types/perps/market'
import type {
  OrderSide,
  OrderType,
  STPMode,
  TimeInForce,
} from '~/types/perps/order'

const API_BASE_URL =
  process.env.VITE_API_BASE_URL ?? 'https://api.testnet.rise.trade'

type PermitParams = {
  account: string
  signer: string
  deadline: string
  signature: string
  nonce: string
}

type OrderParams = {
  market_id: string
  size: string
  price: string
  side: OrderSide
  stp_mode: STPMode
  order_type: OrderType
  post_only: boolean
  reduce_only: boolean
  tif: TimeInForce
  expiry: number
}

type PlaceOrderParams = {
  order_params: OrderParams
  permit_params: PermitParams
}

type CancelOrderParams = {
  order_id: string
  market_id: string
  permit_params: PermitParams
}

type PlaceOrderRequest = {
  address: Address.Address
  // signer: string
  marketId: string
  orderType: OrderType
  postOnly: boolean
  price: bigint
  reduceOnly: boolean
  side: OrderSide
  size: bigint
  stpMode: STPMode
  timeInForce: TimeInForce
}

/**
 * Places a new order
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = usePlaceOrder()
 *
 * mutate({
 *   marketId: '1',
 *   size: '0.1',
 *   price: '50000',
 *   side: 'buy',
 *   orderType: 'limit',
 *   address: '0x1234...',
 *   signer: '0x5678...',
 *   signature: '0x...',
 *   deadline: '1234567890',
 * })
 * ```
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      address,
      marketId,
      orderType,
      postOnly,
      price,
      reduceOnly,
      side,
      // signer,
      size,
      stpMode,
      timeInForce,
    }: PlaceOrderRequest) => {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400 // 24hours

      // Encode the place order data according to SC format
      const encodedData = encodePlaceOrderData({
        expiry: expiresAt,
        marketId,
        orderType,
        postOnly,
        price,
        reduceOnly,
        side,
        size,
        stpMode,
        timeInForce,
      })

      console.log('encodedData:: ', encodedData)

      const storedAuth = localStorage.getItem(
        'risex-authInfo',
      ) as Address.Address

      if (!storedAuth) {
        console.error('No signing key found')
        return
      }

      console.log('storedAuth:: ', storedAuth)
      const { signer, signingKey } = JSON.parse(storedAuth)

      console.log('signer:: ', signer)
      console.log('signingKey:: ', signingKey)

      // Sign the encoded data using the signer's private key
      const { signature, nonce } = await signPlaceOrderData({
        account: address,
        encodedData,
        signingKey,
      })

      const request: PlaceOrderParams = {
        order_params: {
          expiry: expiresAt,
          market_id: marketId,
          order_type: orderType,
          post_only: postOnly,
          price: parseEther(price.toString()).toString(),
          reduce_only: reduceOnly,
          side,
          size: parseEther(size.toString()).toString(),
          stp_mode: stpMode,
          tif: timeInForce,
        },
        permit_params: {
          account: address || '',
          deadline: expiresAt.toString(),
          nonce,
          signature: signature || `0x${'0'.repeat(130)}`,
          signer,
        },
      }

      const response = await fetch(`${API_BASE_URL}/v1/orders/place`, {
        body: JSON.stringify(request),
        headers: {
          // Accept: 'application/json',
          // 'Content-Type': 'application/json',
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
 *   orderId: 'order_123',
 *   marketId: '1',
 *   address: '0x1234...',
 *   signer: '0x5678...',
 *   signature: '0x...',
 * })
 * ```
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      address,
      marketId,
      orderId,
    }: {
      address: Address.Address
      marketId: string
      orderId: string
      signature?: `0x${string}`
      signer: string
    }) => {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400 // 24hours

      const encodedData = encodeCancelOrderData({
        marketId: marketId,
        orderId: BigInt(orderId),
      })

      const storedAuth = localStorage.getItem(
        'risex-authInfo',
      ) as Address.Address

      if (!storedAuth) {
        console.error('No signing key found')
        return
      }

      const { signer, signingKey } = JSON.parse(storedAuth)

      const { signature, nonce } = await signCancelOrderData({
        account: address,
        encodedData,
        signingKey,
      })

      const request: CancelOrderParams = {
        market_id: marketId.toString(),
        order_id: orderId.toString(),
        permit_params: {
          account: address || '',
          deadline: expiresAt.toString(),
          nonce,
          signature: signature || `0x${'0'.repeat(130)}`,
          signer,
        },
      }

      const response = await fetch(`${API_BASE_URL}/v1/orders/cancel`, {
        body: JSON.stringify(request),
        headers: {
          Accept: 'application/json',
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
