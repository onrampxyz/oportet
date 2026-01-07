import { cx } from 'cva'
import { useState } from 'react'
import type { FilteredMarket } from '~/hooks'
import { OrdersTable } from './Orders'
import { PositionsTable } from './PositionsTable'

export type TradeDisplayProps = {
  markets: FilteredMarket[]
}

export function TradeDisplay(props: Readonly<TradeDisplayProps>) {
  const { markets } = props
  const [activeTab, setActiveTab] = useState<'orders' | 'positions'>('positions')

  return (
    <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
      {/* Tabs Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-4">
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
              activeTab === 'positions'
                ? 'border-violet9 border-b-2 text-gray12'
                : 'text-gray10 hover:text-gray12',
            )}
            onClick={() => setActiveTab('positions')}
            type="button"
          >
            Positions
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
      {activeTab === 'orders' ? <OrdersTable /> : <PositionsTable markets={markets} />}
    </div>
  )
}
