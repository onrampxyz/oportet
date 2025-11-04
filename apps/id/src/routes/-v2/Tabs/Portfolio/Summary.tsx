import { Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import type { WalletSummary } from '~/hooks'
import type { BalanceChange } from '~/types/portfolio'

const DUMMY_BALANCE_CHANGE: BalanceChange = {
  protocols: '+$51.15',
  totalChange: '+$51.15',
  transactions: 12,
  wallet: '+$23.45',
}

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
          value={summary?.totalValue.toFixed(2)}
        />
        <SummaryCard
          className="text-green-600"
          isLoading={isLoading}
          title="Wallet"
          value={summary?.breakdown?.tokens.value.toFixed(2)}
        />
        <SummaryCard
          className="text-green-600"
          isLoading={isLoading}
          title="Protocols"
          value={summary?.breakdown?.protocols.value.toFixed(2)}
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
