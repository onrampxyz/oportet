import { useMemo } from 'react'
import { useOrderbook } from '~/contexts/OrderbookContext'
import type { FilteredMarket } from '~/hooks'
import { ValueFormatter } from '~/utils'

export type Order = {
  price: string
  size: string
  total: string
  isMid?: boolean
}

export type OrderBookProps = {
  selectedMarket?: FilteredMarket | null
}

export function OrderBook(props: Readonly<OrderBookProps>) {
  const { selectedMarket } = props
  const { orderBookBuy, orderBookSell, totalBuy, totalSell } = useOrderbook(
    selectedMarket?.market_id,
  )

  console.log('orderBookSell:: ', orderBookSell)

  // Calculate max size for depth visualization
  const maxSize = useMemo(() => {
    const allOrders = [...orderBookBuy, ...orderBookSell]
    const sizes = allOrders.map((order) =>
      ValueFormatter.anyToFloat(order.size),
    )
    return Math.max(...sizes, 1)
  }, [orderBookBuy, orderBookSell])

  return (
    <div className="space-y-1 rounded-lg border border-gray5 p-4">
      <h3 className="mb-4 font-semibold">Order Book</h3>

      {/* Header */}
      <div className="mb-2 flex justify-between text-gray10 text-xs">
        <span>Price</span>
        <span>Size</span>
        <span>Mine</span>
      </div>

      {/* Sell Orders (Asks) */}
      <div className="space-y-0.5">
        {orderBookSell.map((order) => {
          const totalAcc = orderBookSell.at(-1)?.size_acc || 1
          const sizePercent = ((order?.size_acc || 1) / totalAcc) * 100

          return (
            <div
              className="relative flex justify-between px-2 py-1 text-xs"
              key={order.price}
            >
              {/* Background depth bar */}
              <div
                className="absolute left-0 h-full transform-gpu bg-red-950/40 transition-[width] duration-500 ease-out"
                style={{ width: `${sizePercent}%` }}
              />

              <div
                className="absolute left-0 h-full transform-gpu bg-red-800 transition-[width] duration-500 ease-out"
                style={{
                  width: `${(ValueFormatter.anyToFloat(order.size) / totalSell) * 15}%`,
                }}
              />

              {/* Content */}
              <span className="relative z-10 font-mono text-red-300">
                {ValueFormatter.anyToFloat(order.price).toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 1,
                    minimumFractionDigits: 1,
                  },
                )}
              </span>
              <span className="relative z-10 font-mono">
                {ValueFormatter.anyToFloat(order.size).toFixed(6)}
              </span>
              <span className="relative z-10 text-gray-500">-</span>
            </div>
          )
        })}
      </div>

      {/* Buy Orders (Bids) */}
      <div className="mt-2 space-y-0.5">
        {orderBookBuy.map((order) => {
          const totalAcc = orderBookBuy.at(-1)?.size_acc || 1
          const sizePercent = ((order?.size_acc ?? 1) / (totalAcc || 1)) * 100

          return (
            <div
              className="relative flex justify-between px-2 py-1 text-xs"
              key={order.price}
            >
              {/* Background depth bar */}
              <div
                className="absolute inset-0 transform-gpu bg-teal-950/40 transition-[width] duration-500 ease-out"
                style={{ width: `${sizePercent}%` }}
              />

              <div
                className="absolute left-0 h-full transform-gpu bg-teal-600 text-green-500 transition-[width] duration-500 ease-out"
                style={{
                  width: `${(ValueFormatter.anyToFloat(order.size) / totalBuy) * 10}%`,
                }}
              />

              {/* Content */}
              <span className="relative z-10 font-mono text-teal-200">
                {ValueFormatter.anyToFloat(order.price).toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 1,
                    minimumFractionDigits: 1,
                  },
                )}
              </span>
              <span className='relative z-10 font-mono'>
                {ValueFormatter.anyToFloat(order.size).toFixed(6)}
              </span>
              <span className="relative z-10 text-gray-500">-</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
