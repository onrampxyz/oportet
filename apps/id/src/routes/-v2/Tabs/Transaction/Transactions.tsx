import { Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'
import { useSelector, useWallet } from '~/hooks'
import { AddressFormatter } from '~/utils'

type TransactionStatus = 'pending' | 'completed' | 'failed'

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const statusStyles = {
    completed:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <span
      className={cx(
        'rounded-full px-2.5 py-1 font-medium text-xs capitalize',
        statusStyles[status],
      )}
    >
      {status}
    </span>
  )
}

export function Transactions() {
  const { address } = useAccount()
  const { calls, isLoading } = useWallet({
    address,
  })

  console.log('calls', calls.data)

  const getDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
  }

  const getAmount = (decodedArgs: string) => {
    if (decodedArgs === '') return 0

    const amountArg = JSON.parse(decodedArgs)
    console.log('amountArg', amountArg)

    return `${Number(formatEther(amountArg[1] || 0)).toFixed(2)}`
  }

  const getUniqueSelectors = () => {
    if (!calls.data?.intents) return []

    const selectors = calls.data.intents
      .map((transaction) => transaction.calls[0]?.selector)
      .filter((selector): selector is string => !!selector)

    // Return unique selectors only
    return [...new Set(selectors)]
  }
  const uniqueSelectors = getUniqueSelectors()

  const selectorQueries = useSelector({
    enabled: uniqueSelectors.length > 0,
    selectors: uniqueSelectors,
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-gray12 text-lg">
          Recent Transactions
        </h2>
      </div>

      {!isLoading && calls.data?.intents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <p className="text-gray10 text-sm">No transactions yet</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center pt-6">
          <Spinner className="size-6!" />
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-2">
        {!isLoading &&
          calls.data?.intents?.map((transaction) => (
            <div
              className="flex items-center justify-between rounded-lg border border-gray5 bg-white p-4 transition-colors hover:bg-gray2 dark:bg-gray1"
              key={transaction.id}
            >
              {/* Left section: Type and Description */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray12 text-sm capitalize">
                    {transaction.calls[0]?.functionName || (
                      <p className={cx('text-sm')}>
                        {selectorQueries.data.get(
                          transaction.calls[0]?.selector ?? '',
                        )?.primarySignature || transaction.calls[0]?.selector}
                      </p>
                    )}
                  </h3>
                </div>
                <p className="mt-0.5 text-gray10 text-xs">
                  Block: {transaction.blockNumber}
                </p>
              </div>

              {/* Middle section: Status and Timestamp */}
              <div className="flex flex-col items-center gap-1 px-8">
                <StatusBadge
                  status={transaction.success ? 'completed' : 'failed'}
                />
                <p className="text-gray10 text-xs">
                  {getDate(Number(transaction.timestamp))}
                </p>
              </div>

              {/* Right section: Amount and Link */}
              <div className="flex flex-col items-end gap-1">
                {transaction.calls[0]?.decodedArgsJson ? (
                  <p className={cx('font-semibold text-sm capitalize')}>
                    {getAmount(transaction.calls[0]?.decodedArgsJson)} {transaction.calls[0]?.tokenSymbol ?? "ETH"}
                  </p>
                ) : (
                  <p className={cx('text-sm')}>
                    {AddressFormatter.mask(transaction.calls[0]?.to)}
                  </p>
                )}
                {transaction.txHash && (
                  <a
                    className="text-violet9 text-xs hover:underline"
                    href={`https://explorer.testnet.riselabs.xyz/tx/${transaction.txHash}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="View on explorer"
                  >
                    See Transaction
                  </a>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
