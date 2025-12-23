

import { cx } from 'cva'
import ArrowDownIcon from '~icons/lucide/arrow-down'
import ArrowUpIcon from '~icons/lucide/arrow-up'

export type PortfolioValueTilesProps = {
  totalValue: string
  valueChange: string
  valueChangePercent: string
  inPositions: string
  totalPnL24h: string
  totalProfit: string
  totalLoss: string
  isLoading?: boolean
}

export function PortfolioValueTiles(props: PortfolioValueTilesProps) {
  const {
    totalValue,
    valueChange,
    valueChangePercent,
    inPositions,
    totalPnL24h,
    totalProfit,
    totalLoss,
  } = props

  const isValuePositive = !valueChange.startsWith('-')
  const isPnLPositive = !totalPnL24h.startsWith('-')

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
      {/* Main Tile - Total Portfolio Value */}
      <div className="space-y-4 rounded-lg border border-gray6 bg-gray2 p-6 dark:border-gray5 dark:bg-gray3">
        <div>
          <div className="mb-1 font-medium text-gray11 text-sm">
            Total Portfolio Value
          </div>
          <div className="font-semibold text-3xl">{totalValue}</div>
        </div>

        <div
          className={cx(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-sm',
            isValuePositive
              ? 'bg-green-600/10 text-green-600'
              : 'bg-red-600/10 text-red-600',
          )}
        >
          {isValuePositive ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
          <span>
            {valueChange} {valueChangePercent}
          </span>
          <span className="text-gray11">Last 30 days</span>
        </div>

        <div className="flex gap-6 border-gray6 border-t pt-4 dark:border-gray5">
          <div>
            <div className="mb-1 font-medium text-gray11 text-xs">
              In Positions
            </div>
            <div className="font-semibold text-lg">{inPositions}</div>
          </div>
          <div>
            <div className="mb-1 font-medium text-gray11 text-xs">
              Total PnL (24h)
            </div>
            <div
              className={cx(
                'font-semibold text-lg',
                isPnLPositive ? 'text-green-600' : 'text-red-600',
              )}
            >
              {totalPnL24h}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Profit/Loss Tiles */}
      <div className="grid gap-3">
        {/* Total Profit */}
        <div className="space-y-1 rounded-lg border border-gray6 bg-gray2 p-4 dark:border-gray5 dark:bg-gray3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray11 text-sm">Total Profit</div>
            <div className="rounded-full bg-green-600/10 p-1.5">
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div className="font-semibold text-2xl text-green-600">
            {totalProfit}
          </div>
        </div>

        {/* Total Loss */}
        <div className="space-y-1 rounded-lg border border-gray6 bg-gray2 p-4 dark:border-gray5 dark:bg-gray3">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray11 text-sm">Total Loss</div>
            <div className="rounded-full bg-red-600/10 p-1.5">
              <ArrowDownIcon className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <div className="font-semibold text-2xl text-red-600">{totalLoss}</div>
        </div>
      </div>
    </div>
  )
}
