import { cx } from 'cva'
import { ValueFormatter } from '~/utils'
import ArrowDownIcon from '~icons/lucide/arrow-down'
import ArrowUpIcon from '~icons/lucide/arrow-up'
import { PortfolioValueTilesSkeleton } from './PortfolioValueTilesSkeleton'

export type PortfolioValueTilesProps = {
  isLoading?: boolean
}

export function PortfolioValueTiles(props: Readonly<PortfolioValueTilesProps>) {
  const { isLoading } = props

  const totalValue = 0
  const protocolsValue = 0

  // Mock data for metrics not yet available from API
  // TODO: Replace with real API data when available
  const mockValueChange = totalValue * 0.22 // 22% mock change
  const mockInPositions = protocolsValue
  const mockTotalPnL24h = totalValue * 0.08 // 8% mock 24h PnL
  const mockTotalProfit = totalValue * 0.35 // 35% mock profit
  const mockTotalLoss = totalValue * 0.15 // 15% mock loss

  const formatValue = (value: number) => {
    if (value === 0) return '$0.00'
    const formatted = ValueFormatter.formatToPrice(value)
    return value >= 0 ? `+$${formatted}` : `-$${formatted.replace('-', '')}`
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  // Formatted display values
  const totalValueDisplay = `$${ValueFormatter.formatToPrice(totalValue)}`
  const valueChange = formatValue(mockValueChange)
  const valueChangePercent = formatPercent((mockValueChange / totalValue) * 100)
  const inPositions = `$${ValueFormatter.formatToPrice(mockInPositions)}`
  const totalPnL24h = formatValue(mockTotalPnL24h)
  const totalProfit = formatValue(mockTotalProfit)
  const totalLoss = `-$${ValueFormatter.formatToPrice(Math.abs(mockTotalLoss))}`

  const isValuePositive = !valueChange.startsWith('-')
  const isPnLPositive = !totalPnL24h.startsWith('-')

  if (isLoading) {
    return <PortfolioValueTilesSkeleton />
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
      {/* Main Tile - Total Portfolio Value */}
      <div className="space-y-4 rounded-lg border border-gray6 bg-white p-6 dark:border-gray5 dark:bg-gray1">
        <div>
          <div className="mb-1 font-medium text-gray11 text-sm">
            Total Portfolio Value
          </div>
          <div className="font-semibold text-3xl">{totalValueDisplay}</div>
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
        <div className="space-y-1 rounded-lg border border-gray6 bg-white p-4 dark:border-gray5 dark:bg-gray1">
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
        <div className="space-y-1 rounded-lg border border-gray6 bg-white p-4 dark:border-gray5 dark:bg-gray1">
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
