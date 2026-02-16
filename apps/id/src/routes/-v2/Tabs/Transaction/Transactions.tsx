import { Toast } from '@porto/apps/components'
import { cx } from 'cva'
import { Hooks } from 'rise-wallet/wagmi'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useConnection } from 'wagmi'
import { useSelector, useWallet } from '~/hooks'
import { AddressFormatter } from '~/utils'
import LucideCopy from '~icons/lucide/copy'

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
  const { address } = useConnection()
  const { calls, isLoading } = useWallet({
    address,
  })

  const { data: callsHistory, isPending: isCallsHistoryPending } =
    Hooks.useCallsHistory({
      // address,
      limit: 50,
      sort: 'desc',
    })

  console.log('callsHistory:: ', callsHistory)

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

  const handleCopyAddress = async (address: string) => {
    if (!address) return

    try {
      await navigator.clipboard.writeText(address)
      toast.custom((t) => (
        <Toast
          className={t}
          description="Address copied to clipboard!"
          kind="success"
          title="Copied!"
        />
      ))
    } catch (error) {
      console.info(error)
      toast.custom((t) => (
        <Toast
          className={t}
          description="Failed to copy address"
          kind="error"
          title="Copy Failed"
        />
      ))
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-gray12 text-lg">
          Recent Transactions
        </h2>
      </div>

      {isCallsHistoryPending && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <div className="size-6 animate-spin rounded-full border-2 border-gray8 border-t-transparent" />
          <p className="mt-3 text-gray10 text-sm">Loading transactions...</p>
        </div>
      )}

      {!isCallsHistoryPending && callsHistory?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray5 bg-white p-12 dark:bg-gray1">
          <p className="text-gray10 text-sm">No transactions yet</p>
        </div>
      )}

      {/* Transactions List */}
      {callsHistory && <div className="flex flex-col gap-2 rounded-md border border-gray7 p-3">
        {callsHistory?.map((call) => {
          return (
            <div className="grid gap-2" key={call.id} p-3>
              {call.transactions.map((tx) => {
                return (
                  <div
                    className='flex flex-wrap items-center justify-between gap-2 rounded-md bg-gray3 px-3 py-1'
                    key={tx.transactionHash}
                  >
                    <div>
                      <p className="text-gray10 text-xs">Chain Id</p>
                      <p className="text-sm">{tx.chainId}</p>
                    </div>
                    <div>
                      <p className="text-gray10 text-xs">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">
                          {AddressFormatter.mask(tx.transactionHash, {
                            end: 12,
                            start: 12,
                          })}
                        </p>
                        {/* TODO: Make this reusable - copy button */}
                        <button
                          className="text-gray11 transition-colors hover:text-gray12"
                          onClick={() => {
                            // biome-ignore lint/nursery/noFloatingPromises: do not await
                            handleCopyAddress(tx.transactionHash)
                          }}
                          title="Copy address"
                          type="button"
                        >
                          <LucideCopy className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <a
                        className="text-sm underline"
                        href={`https://testnet.risexplorer.com/tx/${tx.transactionHash}`}
                        rel="noopener"
                        target="_blank"
                      >
                        View Transaction
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>}
    </div>
  )
}
