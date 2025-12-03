import { Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import type { WalletSummary } from '~/types/wallet'
import { ValueFormatter } from '~/utils'

export type SummaryProps = {
  summary?: WalletSummary
  transactionCount?: number
  isLoading: boolean
}

export type SummaryCardProps = {
  title: string
  value?: string | number
  isLoading?: boolean
  className?: string
}

export function SummaryCard(props: SummaryCardProps) {
  const { title, value, isLoading, className } = props

  return (
    <div className="rounded-md border border-gray5 p-5 text-center">
      <p className="mb-1 text-gray10 text-xs">{title}</p>

      {isLoading ? (
        <Spinner className="size-6!" />
      ) : (
        <p className={cx('text-2xl', className)}>{value}</p>
      )}
    </div>
  )
}

export function Summary(props: SummaryProps) {
  const { summary, isLoading, transactionCount } = props

  const formatValue = (value: number | undefined) => {
    if (value === undefined || value === 0) return '$0.00'
    return `$${ValueFormatter.formatToPrice(value)}`
  }

  return (
    <div className="rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="mb-2 font-semibold text-lg">Portfolio Summary</h2>

      <p className="mb-4 text-gray10 text-sm">
        Summary of portfolio changes over the last 24 hours
      </p>

      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          isLoading={isLoading}
          title="Total Change"
          value={formatValue(summary?.totalValue)}
        />
        <SummaryCard
          className="text-green-600"
          isLoading={isLoading}
          title="Wallet"
          value={formatValue(summary?.breakdown?.tokens.value)}
        />
        <SummaryCard
          className="text-green-600"
          isLoading={isLoading}
          title="Protocols"
          value={formatValue(summary?.breakdown?.protocols.value)}
        />
        <SummaryCard
          isLoading={isLoading}
          title="Transactions"
          value={transactionCount}
        />
      </div>
    </div>
  )
}
