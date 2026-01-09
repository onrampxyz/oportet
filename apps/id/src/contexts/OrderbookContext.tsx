import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { formatEther } from 'viem'
import { ValueFormatter } from '~/utils'
import { useWebSocketConnection } from './WebSocketConnectionContext'
import { useWebSocketMessageBus } from './WebSocketMessageBus'

export type OrderbookLevel = {
  block_number: number
  log_index: number
  order_count: number
  price: string
  quantity: string
  size: string
  size_acc?: number
}

export type OrderbookData = {
  market_id: string
  bids: OrderbookLevel[] // buy
  asks: OrderbookLevel[] // sell
  timestamp: string
}

type OrderbookContextState = {
  orderbook: OrderbookData | null
  loading: boolean
  orderBookBuy: OrderbookLevel[]
  orderBookSell: OrderbookLevel[]
  totalSell: number
  totalBuy: number
  subscribeToOrderBook: (marketId: string) => void
  unsubscribeFromOrderBook: (marketId: string) => void
}

const OrderbookContext = createContext<OrderbookContextState | undefined>(
  undefined,
)

export function useOrderbook(marketId?: string) {
  const context = useContext(OrderbookContext)

  if (!context) {
    throw new Error('useOrderbook must be used within an OrderbookProvider')
  }

  const { subscribeToOrderBook, unsubscribeFromOrderBook } = context

  useEffect(() => {
    if (marketId) {
      subscribeToOrderBook(marketId)

      return () => {
        unsubscribeFromOrderBook(marketId)
      }
    }
  }, [marketId, subscribeToOrderBook, unsubscribeFromOrderBook])

  return context
}

type OrderbookProviderProps = {
  children: React.ReactNode
  marketId?: string
}

export function OrderbookProvider({
  children,
}: Readonly<OrderbookProviderProps>) {
  const { send, isConnected } = useWebSocketConnection()
  const { subscribe } = useWebSocketMessageBus()
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [loading, setLoading] = useState(true)

  const subscribedMarketsRef = useRef<Set<string>>(new Set())
  const MAX_DISPLAY = 5

  const handleOrderbookMessage = useCallback(
    (type: string, data: OrderbookData) => {
      if (type === 'snapshot') {
        const orderbookData: OrderbookData = {
          asks: data.asks
            .map((item) => ({
              ...item,
              price: formatEther(BigInt(item?.price || '0')),
              size: formatEther(BigInt(item?.quantity || '0')),
            }))
            .sort(
              (a, b) =>
                ValueFormatter.anyToFloat(a.price) -
                ValueFormatter.anyToFloat(b.price),
            ),
          bids: data.bids
            .map((item) => ({
              ...item,
              price: formatEther(BigInt(item?.price || '0')),
              size: formatEther(BigInt(item?.quantity || '0')),
            }))
            .sort(
              (a, b) =>
                ValueFormatter.anyToFloat(b.price) -
                ValueFormatter.anyToFloat(a.price),
            ),
          market_id: data.market_id,
          timestamp: data.timestamp,
        }

        setOrderbook(orderbookData)
        setLoading(false)
      } else if (type === 'update') {
        // console.log("update-data:: ", data)
        setOrderbook((prev) => {
          if (!prev) return prev

          const newBids = [...prev.bids]
          const newAsks = [...prev.asks]

          data.asks?.forEach((item) => {
            const price = formatEther(BigInt(item?.price || '0'))
            const size = formatEther(BigInt(item?.quantity || '0'))

            const findIndex = newAsks.findIndex(
              (order) => order.price === price,
            )

            if (findIndex === -1) {
              let insertIndex = 0
              while (
                insertIndex < newAsks.length &&
                ValueFormatter.anyToFloat(price) >
                ValueFormatter.anyToFloat(newAsks[insertIndex]?.price)
              )
                insertIndex += 1
              newAsks.splice(insertIndex, 0, {
                ...item,
                price,
                quantity: size,
                size,
              } as any)
            } else if (ValueFormatter.anyToFloat(size)) {
              newAsks.splice(findIndex, 1, {
                ...newAsks[findIndex],
                ...item,
                price,
                quantity: size,
                size,
              } as any)
            } else {
              newAsks.splice(findIndex, 1)
            }
          })

          data.bids?.forEach((item) => {
            const price = formatEther(BigInt(item?.price || '0'))
            const size = formatEther(BigInt(item?.quantity || '0'))
            const findIndex = newBids.findIndex(
              (order) => order.price === price,
            )
            if (findIndex === -1) {
              let insertIndex = 0
              while (
                insertIndex < newBids.length &&
                ValueFormatter.anyToFloat(price) <
                ValueFormatter.anyToFloat(newBids[insertIndex]?.price)
              )
                insertIndex += 1
              newBids.splice(insertIndex, 0, {
                ...item,
                price,
                quantity: size,
                size,
              } as any)
            } else if (ValueFormatter.anyToFloat(size)) {
              newBids.splice(findIndex, 1, {
                ...newBids[findIndex],
                ...item,
                price,
                quantity: size,
                size,
              } as any)
            } else {
              newBids.splice(findIndex, 1)
            }
          })

          return {
            ...prev,
            asks: newAsks.toSorted(
              (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price),
            ),
            bids: newBids.toSorted(
              (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price),
            ),
            timestamp: data.timestamp || prev.timestamp, // TODO: fix this
          }
        })
      }
    },
    [],
  )

  const subscribeToOrderBook = useCallback(
    (marketId: string) => {
      if (!marketId) return
      if (!isConnected) return
      if (subscribedMarketsRef.current.has(marketId)) return

      send({
        method: 'subscribe',
        params: {
          channel: 'orderbook',
          market_ids: [Number(marketId)],
        },
      })
      subscribedMarketsRef.current.add(marketId)
    },
    [isConnected, send],
  )

  const unsubscribeFromOrderBook = useCallback(
    (marketId: string) => {
      if (!marketId) return
      if (!isConnected) return
      if (!subscribedMarketsRef.current.has(marketId)) return

      send({
        method: 'unsubscribe',
        params: {
          channel: 'orderbook',
          market_ids: [Number(marketId)],
        },
      })
      subscribedMarketsRef.current.delete(marketId)
    },
    [isConnected, send],
  )

  const orderBookBuy = useMemo(() => {
    const orderBuy = orderbook?.bids.slice(0, MAX_DISPLAY) ?? []

    if (orderBuy[0]) {
      orderBuy[0].size_acc = ValueFormatter.anyToFloat(orderBuy[0].size)
      for (let i = 1; i < orderBuy.length; i += 1) {
        orderBuy[i]!.size_acc =
          orderBuy[i - 1]!.size_acc +
          ValueFormatter.anyToFloat(orderBuy[i]!.size)
      }
    }

    return orderBuy
  }, [orderbook])

  const orderBookSell = useMemo(() => {
    const orderSell =
      orderbook?.asks
        .slice(0, MAX_DISPLAY)
        .toSorted(
          (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price),
        ) ?? []

    if (orderSell[0]) {
      orderSell[0].size_acc = ValueFormatter.anyToFloat(orderSell[0].size)
      for (let i = 1; i < orderSell.length; i += 1) {
        orderSell[i]!.size_acc =
          orderSell[i - 1]!.size_acc +
          ValueFormatter.anyToFloat(orderSell[i]!.size)
      }
    }

    return orderSell
  }, [orderbook])

  const totalSell = useMemo(() => {
    return orderBookSell.reduce(
      (acc, item) => acc + ValueFormatter.anyToFloat(item.size),
      0,
    )
  }, [orderBookSell])

  const totalBuy = useMemo(() => {
    return orderBookBuy.reduce(
      (acc, item) => acc + ValueFormatter.anyToFloat(item.size),
      0,
    )
  }, [orderBookBuy])

  // Subscribe to orderbook messages from the message bus
  useEffect(() => {
    const unsubscribe = subscribe('orderbook', handleOrderbookMessage)
    return unsubscribe
  }, [subscribe, handleOrderbookMessage])

  const value = useMemo<OrderbookContextState>(
    () => ({
      loading,
      orderBookBuy,
      orderBookSell,
      orderbook,
      subscribeToOrderBook,
      totalBuy,
      totalSell,
      unsubscribeFromOrderBook,
    }),
    [
      orderbook,
      loading,
      orderBookBuy,
      orderBookSell,
      totalSell,
      totalBuy,
      subscribeToOrderBook,
      unsubscribeFromOrderBook,
    ],
  )

  return (
    <OrderbookContext.Provider value={value}>
      {children}
    </OrderbookContext.Provider>
  )
}

// Export message handler type for parent to use
export type OrderbookMessageHandler = (type: string, data: any) => void
