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
import { useWebSocketConnection } from './WebSocketConnectionContext'
import { useWebSocketMessageBus } from './WebSocketMessageBus'

export type OrderbookLevel = {
  price: string
  size: string
  total: string
}

export type OrderbookData = {
  marketId: string
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  timestamp: string
}

type OrderbookContextState = {
  orderbook: OrderbookData | null
  loading: boolean
  subscribeToMarket: (marketId: string) => void
  unsubscribeFromMarket: (marketId: string) => void
}

const OrderbookContext = createContext<OrderbookContextState | undefined>(
  undefined,
)

export function useOrderbook() {
  const context = useContext(OrderbookContext)
  if (!context) {
    throw new Error('useOrderbook must be used within an OrderbookProvider')
  }
  return context
}

type OrderbookProviderProps = {
  children: React.ReactNode
}

export function OrderbookProvider({
  children,
}: Readonly<OrderbookProviderProps>) {
  const { send, isConnected } = useWebSocketConnection()
  const { subscribe } = useWebSocketMessageBus()
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [loading, setLoading] = useState(true)
  const subscribedMarketsRef = useRef<Set<string>>(new Set())

  const handleOrderbookMessage = useCallback((type: string, data: any) => {
    if (type === 'snapshot') {
      const orderbookData: OrderbookData = {
        asks: data.asks.map(([price, size]: [string, string]) => ({
          price,
          size,
          total: (Number.parseFloat(price) * Number.parseFloat(size)).toFixed(
            2,
          ),
        })),
        bids: data.bids.map(([price, size]: [string, string]) => ({
          price,
          size,
          total: (Number.parseFloat(price) * Number.parseFloat(size)).toFixed(
            2,
          ),
        })),
        marketId: data.market_id,
        timestamp: data.timestamp,
      }
      setOrderbook(orderbookData)
      setLoading(false)
    } else if (type === 'update') {
      setOrderbook((prev) => {
        if (!prev) return prev

        const newBids = [...prev.bids]
        const newAsks = [...prev.asks]

        if (data.bids) {
          for (const [price, size] of data.bids) {
            // TODO: Consider a Map<price, level> internally and derive sorted arrays only when needed
            const index = newBids.findIndex((bid) => bid.price === price)
            if (Number.parseFloat(size) === 0) {
              if (index !== -1) newBids.splice(index, 1)
            } else if (index === -1) {
              newBids.push({
                price,
                size,
                total: (
                  Number.parseFloat(price) * Number.parseFloat(size)
                ).toFixed(2),
              })
            } else {
              newBids[index] = {
                price,
                size,
                total: (
                  Number.parseFloat(price) * Number.parseFloat(size)
                ).toFixed(2),
              }
            }
          }
        }

        if (data.asks) {
          for (const [price, size] of data.asks) {
            const index = newAsks.findIndex((ask) => ask.price === price)
            if (Number.parseFloat(size) === 0) {
              if (index !== -1) newAsks.splice(index, 1)
            } else if (index === -1) {
              newAsks.push({
                price,
                size,
                total: (
                  Number.parseFloat(price) * Number.parseFloat(size)
                ).toFixed(2),
              })
            } else {
              newAsks[index] = {
                price,
                size,
                total: (
                  Number.parseFloat(price) * Number.parseFloat(size)
                ).toFixed(2),
              }
            }
          }
        }

        return {
          ...prev,
          asks: newAsks.toSorted(
            (a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price),
          ),
          bids: newBids.toSorted(
            (a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price),
          ),
          timestamp: data.timestamp || prev.timestamp,
        }
      })
    }
  }, [])

  // Subscribe to orderbook messages from the message bus
  useEffect(() => {
    const unsubscribe = subscribe('orderbook', handleOrderbookMessage)
    return unsubscribe
  }, [subscribe, handleOrderbookMessage])

  const subscribeToMarket = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      if (subscribedMarketsRef.current.has(marketId)) return

      send({
        method: 'subscribe',
        params: {
          channel: 'orderbook',
          market_id: marketId,
        },
      })
      subscribedMarketsRef.current.add(marketId)
    },
    [isConnected, send],
  )

  const unsubscribeFromMarket = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      if (!subscribedMarketsRef.current.has(marketId)) return

      send({
        method: 'unsubscribe',
        params: {
          channel: 'orderbook',
          market_id: marketId,
        },
      })
      subscribedMarketsRef.current.delete(marketId)
    },
    [isConnected, send],
  )

  const value = useMemo<OrderbookContextState>(
    () => ({
      loading,
      orderbook,
      subscribeToMarket,
      unsubscribeFromMarket,
    }),
    [orderbook, loading, subscribeToMarket, unsubscribeFromMarket],
  )

  return (
    <OrderbookContext.Provider value={value}>
      {children}
    </OrderbookContext.Provider>
  )
}

// Export message handler type for parent to use
export type OrderbookMessageHandler = (type: string, data: any) => void
