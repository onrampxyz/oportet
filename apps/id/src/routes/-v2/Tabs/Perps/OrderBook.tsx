import { cx } from 'cva'
import { useEffect } from 'react'
import { useOrderbook } from '~/contexts/OrderbookContext'

export type Order = {
  price: string
  size: string
  total: string
  isMid?: boolean
}

export type OrderBookProps = {
  orders: Order[]
  marketId: string
}

export function OrderBook(props: Readonly<OrderBookProps>) {
  const { orders, marketId } = props

  const { orderbook, subscribeToOrderBook, unsubscribeFromOrderBook } = useOrderbook()
  console.log('Websocket-orderbook:: ', orderbook)

  useEffect(() => {
    subscribeToOrderBook(marketId);

    return () => {
      unsubscribeFromOrderBook(marketId);
    };
  }, [marketId, subscribeToOrderBook, unsubscribeFromOrderBook]);

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
                  Number.parseFloat(order.price.replaceAll(/[$,]/g, '')) > 98244
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
