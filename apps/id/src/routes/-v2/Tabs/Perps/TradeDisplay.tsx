import { cx } from 'cva'
import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { type MarketInfo, useOrdersInfo } from '~/hooks'
import { OrdersTable } from './Orders'
import { PositionsTable } from './PositionsTable'

type TradeDisplayProps = { markets: MarketInfo[] }

export function TradeDisplay({ markets }: Readonly<TradeDisplayProps>) {
  const { address } = useAccount()
  const [activeTab, setActiveTab] = useState<
    'orders' | 'positions' | 'history'
  >('positions')

  const { orders: historyOrders } = useOrdersInfo({
    markets,
  })

  const openOrders = useMemo(() => {
    return historyOrders.filter(
      (order) => order.status === 'Open' || order.status === 'Partial',
    )
  }, [historyOrders])

  return (
    <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
      {/* Tabs Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
          <button
            className={cx(
              'pb-2 font-semibold text-sm transition-colors',
              activeTab === 'positions'
                ? 'border-violet9 border-b-2 text-gray12'
                : 'text-gray10 hover:text-gray12',
            )}
            onClick={() => setActiveTab('positions')}
            type="button"
          >
            Positions
          </button>
          <button
            className={cx(
              'pb-2 font-semibold text-sm transition-colors',
              activeTab === 'orders'
                ? 'border-violet9 border-b-2 text-gray12'
                : 'text-gray10 hover:text-gray12',
            )}
            onClick={() => setActiveTab('orders')}
            type="button"
          >
            Orders
          </button>
          <button
            className={cx(
              'pb-2 font-semibold text-sm transition-colors',
              activeTab === 'history'
                ? 'border-violet9 border-b-2 text-gray12'
                : 'text-gray10 hover:text-gray12',
            )}
            onClick={() => setActiveTab('history')}
            type="button"
          >
            History
          </button>
        </div>
        {activeTab === 'positions' && (
          <button
            className="text-gray10 text-xs hover:text-gray12"
            type="button"
          >
            Close All
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && address && (
        <OrdersTable
          address={address}
          emptyMessage="No open orders"
          orders={openOrders}
        />
      )}
      {activeTab === 'positions' && address && (
        <PositionsTable address={address} markets={markets} />
      )}
      {activeTab === 'history' && address && (
        <OrdersTable
          address={address}
          emptyMessage="No order history"
          orders={historyOrders}
        />
      )}
    </div>
  )
}
