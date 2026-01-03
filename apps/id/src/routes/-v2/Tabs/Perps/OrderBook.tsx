import { cx } from 'cva'
import { useEffect } from 'react'
import { createSocket } from '~/services/websocket'

export type Order = {
  price: string
  size: string
  total: string
  isMid?: boolean
}

export type OrderBookProps = {
  orders: Order[]
}

function subscribeToMarkets() {
  const ws = createSocket({
    onMessage: (event) => {
      const data = JSON.parse(event.data)

      console.log("web-socket-data:: ", data)

      // Handle different message types
      switch (data.type) {
        case 'market_update':
          console.log('Market update:', data)
          break
        case 'trade':
          console.log('New trade:', data)
          break
        case 'orderbook':
          console.log('Orderbook update:', data)
          break
        default:
          console.log('Unknown message type:', data)
      }
    },
    onOpen: () => {
      // Subscribe to multiple channels
      // ws.send({ channel: 'orderbook', market_id: '1', type: 'subscribe' })
      ws.send({
        method: 'subscribe',
        params: {
          channel: 'orderbook',
          market_ids: [1],
        },
      })
    },
  })

  ws.connect()
  return ws
}

export function OrderBook(props: Readonly<OrderBookProps>) {
  const { orders } = props

  console.log("Entering Orderbook")

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoid rerender
  useEffect(() => {
    subscribeToMarkets()
  }, [])

  return (
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      <h3 className="mb-4 font-semibold">Order Book</h3>
      <div className="space-y-1">
        {orders.map((order) => (
          <div
            className={cx(
              'flex justify-between text-xs',
              order.isMid ? 'border-gray5 border-y py-1 font-medium' : '',
            )}
            key={order.price}
          >
            <span
              className={cx(
                !order.isMid &&
                  Number.parseFloat(order.price.replace(/[$,]/g, '')) > 98244
                  ? 'text-red-600'
                  : order.isMid
                    ? 'text-gray12'
                    : 'text-green-600',
              )}
            >
              {order.price}
            </span>
            <span className="text-gray10">{order.size}</span>
            <span className="text-gray10">{order.total}</span>
          </div>
        ))}
        <div className="mt-2 text-center text-gray10 text-xs">
          Spread $6 (0.006%)
        </div>
      </div>
    </div>
  )
}
