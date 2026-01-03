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
import type { FilteredMarket } from '~/hooks/perps/useFilteredMarkets'
import { useWebSocket } from '~/hooks/perps/useWebSocket'
import type { Position, UserOrder } from '~/routes/-v2/Tabs/Perps/Positions'

// Orderbook types
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

// Context state type
type PerpsContextState = {
  // Orderbook
  orderbook: OrderbookData | null
  orderbookLoading: boolean

  // Positions
  positions: Position[]
  positionsLoading: boolean

  // Orders
  orders: UserOrder[]
  ordersLoading: boolean

  // Markets
  selectedMarket: FilteredMarket | null
  setSelectedMarket: (market: FilteredMarket) => void

  // WebSocket
  isConnected: boolean
  reconnect: () => void
  disconnect: () => void

  // Actions
  subscribeToOrderbook: (marketId: string) => void
  unsubscribeFromOrderbook: (marketId: string) => void
  cancelOrder: (orderId: string) => void
  closePosition: (marketId: string) => void
  closeAllPositions: () => void
}

const PerpsContext = createContext<PerpsContextState | undefined>(undefined)

export function usePerps() {
  const context = useContext(PerpsContext)
  if (!context) {
    throw new Error('usePerps must be used within a PerpsProvider')
  }
  return context
}

type PerpsProviderProps = {
  children: React.ReactNode
  autoConnect?: boolean
}

export function PerpsProvider({
  children,
  autoConnect = true,
}: Readonly<PerpsProviderProps>) {
  // State
  const [orderbook, setOrderbook] = useState<OrderbookData | null>(null)
  const [orderbookLoading, setOrderbookLoading] = useState(true)
  const [positions, setPositions] = useState<Position[]>([])
  const [positionsLoading, setPositionsLoading] = useState(true)
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [selectedMarket, setSelectedMarket] = useState<FilteredMarket | null>(
    null,
  )

  // Create refs for message handlers to avoid dependency issues
  const handlersRef = useRef({
    handleMarkets: (type: string, data: any) => {
      if (type === 'update') {
        setSelectedMarket((prev) => {
          if (prev?.market_id === data.market_id) {
            return { ...prev, ...data }
          }
          return prev
        })
      }
    },
    handleOrderbook: (type: string, data: any) => {
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
        setOrderbookLoading(false)
      } else if (type === 'update') {
        setOrderbook((prev) => {
          if (!prev) return prev

          const newBids = [...prev.bids]
          const newAsks = [...prev.asks]

          if (data.bids) {
            for (const [price, size] of data.bids) {
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
    },
    handleOrders: (type: string, data: any) => {
      if (type === 'snapshot') {
        setOrders(data)
        setOrdersLoading(false)
      } else if (type === 'update') {
        setOrders((prev) => {
          const index = prev.findIndex((o) => o.market === data.market)
          if (index !== -1) {
            const updated = [...prev]
            updated[index] = data
            return updated
          }
          return [...prev, data]
        })
      } else if (type === 'cancel') {
        setOrders((prev) => prev.filter((o) => o.market !== data.market))
      }
    },
    handlePositions: (type: string, data: any) => {
      if (type === 'snapshot') {
        setPositions(data)
        setPositionsLoading(false)
      } else if (type === 'update') {
        setPositions((prev) => {
          const index = prev.findIndex((p) => p.market === data.market)
          if (index !== -1) {
            const updated = [...prev]
            updated[index] = data
            return updated
          }
          return [...prev, data]
        })
      } else if (type === 'close') {
        setPositions((prev) => prev.filter((p) => p.market !== data.market))
      }
    },
  })

  // WebSocket connection
  const { send, isConnected, connect, close } = useWebSocket({
    autoConnect,
    onClose: () => {
      console.log('Perps WebSocket disconnected')
    },
    onError: (error) => {
      console.error('Perps WebSocket error:', error)
    },
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data)
        const { channel, type, data } = message

        switch (channel) {
          case 'orderbook':
            handlersRef.current.handleOrderbook(type, data)
            break
          case 'positions':
            handlersRef.current.handlePositions(type, data)
            break
          case 'orders':
            handlersRef.current.handleOrders(type, data)
            break
          case 'markets':
            handlersRef.current.handleMarkets(type, data)
            break
          default:
            console.log('Unknown channel:', channel, message)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    },
    onOpen: () => {
      console.log('Perps WebSocket connected')
      // TODO: positions and orders need to authenticate first before subscription
      send({ method: 'subscribe', params: { channel: 'positions' } })
      send({ method: 'subscribe', params: { channel: 'orders' } })

      // No authentication required for orderbook channel
      send({ method: 'subscribe', params: { channel: 'orderbook' } })
    },
  })

  // Actions
  const subscribeToOrderbook = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      send({
        method: 'subscribe',
        params: {
          channel: 'orderbook',
          market_id: marketId,
        },
      })
    },
    [isConnected, send],
  )

  const unsubscribeFromOrderbook = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      send({
        method: 'unsubscribe',
        params: {
          channel: 'orderbook',
          market_id: marketId,
        },
      })
    },
    [isConnected, send],
  )

  const cancelOrder = useCallback(
    (orderId: string) => {
      if (!isConnected) return
      send({
        method: 'cancel_order',
        params: {
          order_id: orderId,
        },
      })
    },
    [isConnected, send],
  )

  const closePosition = useCallback(
    (marketId: string) => {
      if (!isConnected) return
      send({
        method: 'close_position',
        params: {
          market_id: marketId,
        },
      })
    },
    [isConnected, send],
  )

  const closeAllPositions = useCallback(() => {
    if (!isConnected) return
    send({
      method: 'close_all_positions',
      params: {},
    })
  }, [isConnected, send])

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  const disconnect = useCallback(() => {
    close()
  }, [close])

  // Subscribe to orderbook when selected market changes
  useEffect(() => {
    if (selectedMarket && isConnected) {
      subscribeToOrderbook(selectedMarket.market_id)
      return () => {
        unsubscribeFromOrderbook(selectedMarket.market_id)
      }
    }
  }, [
    selectedMarket,
    isConnected,
    subscribeToOrderbook,
    unsubscribeFromOrderbook,
  ])

  const value: PerpsContextState = useMemo(() => {
    return {
      cancelOrder,
      closeAllPositions,
      closePosition,
      disconnect,
      isConnected,
      orderbook,
      orderbookLoading,
      orders,
      ordersLoading,
      positions,
      positionsLoading,
      reconnect,
      selectedMarket,
      setSelectedMarket,
      subscribeToOrderbook,
      unsubscribeFromOrderbook,
    }
  }, [
    cancelOrder,
    closeAllPositions,
    closePosition,
    disconnect,
    isConnected,
    orderbook,
    orderbookLoading,
    orders,
    ordersLoading,
    positions,
    positionsLoading,
    reconnect,
    selectedMarket,
    subscribeToOrderbook,
    unsubscribeFromOrderbook,
  ])

  return <PerpsContext.Provider value={value}>{children}</PerpsContext.Provider>
}
