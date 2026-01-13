import { cx } from 'cva'
import { type OrderInfo, useCancelOrder } from '~/hooks'
import LucideX from '~icons/lucide/x'

export type OrdersTableProps = {
  orders: OrderInfo[]
  emptyMessage?: string
  address: `0x${string}`
}

export function OrdersTable({
  orders,
  emptyMessage = 'No orders',
  address,
}: Readonly<OrdersTableProps>) {
  const { mutate: cancelOrder, isPending } = useCancelOrder()
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-gray5 border-b text-left">
            <th className="pb-2 font-normal text-xs">Market</th>
            <th className="pb-2 font-normal text-xs">Side</th>
            <th className="pb-2 font-normal text-xs">Type</th>
            <th className="pb-2 font-normal text-xs">Size</th>
            <th className="pb-2 font-normal text-xs">Price</th>
            <th className="pb-2 font-normal text-xs">Filled</th>
            <th className="pb-2 font-normal text-xs">Status</th>
            <th className="pb-2 text-right text-xs" />
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td className="pt-4 text-center text-gray10 text-xs" colSpan={8}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            orders.map((order, index) => (
              <tr
                className="border-gray3 border-b last:border-0"
                key={`${order.orderId}-${index}`}
              >
                <td className="py-1 text-xs">{order.market}</td>
                <td className="py-1">
                  <span
                    className={cx(
                      'rounded px-2 py-0.5 text-xs',
                      order.side === 'LONG'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    {order.side}
                  </span>
                </td>
                <td className="py-1 text-xs">{order.type}</td>
                <td className="py-1 text-xs">
                  {order.size} {order.quoteSymbol}
                </td>
                <td className="py-1 text-xs">${order.price}</td>
                <td className="py-1 text-xs">{order.filled}</td>
                <td className="py-1">
                  <span
                    className={cx(
                      'rounded px-2 py-0.5 text-xs',
                      order.status === 'Open'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : order.status === 'Filled'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : order.status === 'Partial'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-1 text-right">
                  <button
                    className="text-gray10 hover:text-gray12 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isPending || order.status !== 'Open'}
                    onClick={() => {
                      cancelOrder({
                        address,
                        marketId: order.marketId,
                        orderId: order.orderId,
                        signer: address,
                      })
                    }}
                    type="button"
                  >
                    <LucideX className="size-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
