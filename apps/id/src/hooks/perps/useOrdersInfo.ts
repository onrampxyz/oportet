import { useMemo } from 'react'
import { ValueFormatter } from '~/utils'
import { useOrderHistory } from '../api/useOrders'
import type { MarketInfo } from './useMaketInfo'

export type OrderInfo = {
  market?: string
  marketId: string
  side: 'LONG' | 'SHORT'
  type: 'Limit' | 'Market'
  size: string
  price: string
  filled: string
  status: 'Open' | 'Partial' | 'Filled' | 'Cancelled'
  quoteSymbol?: string
  orderId: string
}

export type UseOrdersInfoParams = {
  markets: MarketInfo[]
  enabled?: boolean
  status?: string
}

/**
 * Hook to fetch and process order information
 *
 * @example
 * ```tsx
 * const { orders, isLoading, error } = useOrdersInfo({
 *   markets: [...],
 *   enabled: true,
 *   status: 'ORDER_STATUS_OPEN'
 * })
 * ```
 */
export function useOrdersInfo(params?: UseOrdersInfoParams) {
  const markets = params?.markets || []

  // const { address } = useAccount()
  // testdata
  // 0x6a691f9e1F3eFEcBa7D73B3b6b6adc58a5839247

  const { data, isLoading, error } = useOrderHistory({
    address: '0x6a691f9e1F3eFEcBa7D73B3b6b6adc58a5839247',
    limit: 10,
    status: params?.status,
  })

  const ordersData = data?.data?.orders || []

  const orders = useMemo(() => {
    if (!ordersData || ordersData.length === 0) return []

    return ordersData.map((order) => {
      const market = markets.find((m) => m.market_id === order.market_id)

      // Format size
      const size = order.size

      // Format filled size
      const filledSize = order.filled_size
      // const totalSize = order.size

      const filledPercent = ((Number(filledSize) / Number(size)) * 100).toFixed(
        0,
      )

      const filled = `${filledSize}/${size} (${filledPercent}%)`

      // Map side
      const side = order.side === 'BUY' ? 'LONG' : 'SHORT'

      // Map type
      const type = order.type === 'LIMIT' ? 'Limit' : 'Market'

      // Map status
      let status: 'Open' | 'Partial' | 'Filled' | 'Cancelled'
      if (order.status === 'ORDER_STATUS_OPEN') {
        status = Number(order.filled_size) > 0 ? 'Partial' : 'Open'
      } else if (order.status === 'ORDER_STATUS_FILLED') {
        status = 'Filled'
      } else if (order.status === 'ORDER_STATUS_CANCELLED') {
        status = 'Cancelled'
      } else {
        status = 'Open'
      }

      return {
        filled,
        market: market?.product_id,
        marketId: order.market_id,
        orderId: order.id,
        price: ValueFormatter.formatWithSuffix(order.price) ?? '-',
        quoteSymbol: market?.base_asset,
        side,
        size,
        status,
        type,
      } as OrderInfo
    })
  }, [markets, ordersData])

  return {
    error,
    isLoading,
    orders,
  }
}
