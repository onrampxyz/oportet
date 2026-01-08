import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
// import type { UserOrder } from '~/routes/-v2/Tabs/Perps/Positions'
import { useWebSocketConnection } from './WebSocketConnectionContext'
import { useWebSocketMessageBus } from './WebSocketMessageBus'
import type { OrderInfo } from '~/hooks'

type OrdersContextState = {
  orders: OrderInfo[]
  loading: boolean
  cancelOrder: (orderId: string) => void
}

const OrdersContext = createContext<OrdersContextState | undefined>(undefined)

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider')
  }
  return context
}

type OrdersProviderProps = {
  children: React.ReactNode
}

export function OrdersProvider({ children }: Readonly<OrdersProviderProps>) {
  const { send, isConnected } = useWebSocketConnection()
  const { subscribe } = useWebSocketMessageBus()

  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)

  // This will be called from parent when WebSocket messages arrive
  const handleOrdersMessage = useCallback((type: string, data: any) => {
    if (type === 'snapshot') {
      setOrders(data)
      setLoading(false)
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
  }, [])

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

  // Subscribe to orders messages from the message bus
  useEffect(() => {
    const unsubscribe = subscribe('orders', handleOrdersMessage)
    return unsubscribe
  }, [subscribe, handleOrdersMessage])

  // Adds subscription

  const value = useMemo<OrdersContextState>(
    () => ({
      cancelOrder,
      loading,
      orders,
    }),
    [orders, loading, cancelOrder],
  )

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  )
}

// Export message handler for parent to call
export type OrdersMessageHandler = (type: string, data: any) => void
