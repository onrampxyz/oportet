import { Button, Spinner } from '@porto/apps/components'
import { cx } from 'cva'
import { useState } from 'react'
import { useChains } from 'wagmi'
import type { Balance } from '~/types/wallet'
import { ValueFormatter } from '~/utils'
import LucideSend from '~icons/lucide/send'
import { Transfer } from './Transfer'
import LucideArrowDownUp from '~icons/lucide/arrow-down-up'

export type WalletBalancesProps = {
  balances?: Balance[]
  isLoading: boolean
  refetch: () => void
}

export function WalletBalances(props: Readonly<WalletBalancesProps>) {
  const { balances, isLoading, refetch } = props

  const chains = useChains()

  const [isPanelOpen, setIsPanelOpen] = useState<string | null>(null)

  const hasBalance = balances && balances?.length !== 0

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '$0.00'
    return `$${ValueFormatter.formatToPrice(value)}`
  }

const  handleOpenPanel = (id: string) =>{
  setIsPanelOpen((prev) => (prev === id ? null : id))
  }

  const handleClosePanel = (id: string) => {
    if (isPanelOpen === id) {
      setIsPanelOpen(null)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="font-semibold text-lg">Wallet Balances By Chain</h2>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner className="size-6!" />
        </div>
      )}

      {!hasBalance && !isLoading && (
        <div className="">
          <p className="font-medium text-gray10 text-sm">
            You have no available balance in your wallet!
          </p>
        </div>
      )}

      {hasBalance &&
        !isLoading &&
        chains?.map((chain) => (
          <div className="" key={chain.id}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{chain.id}</h3>
                <p className="text-gray10 text-sm">
                  {balances.length} token
                  {balances.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-full bg-violet9/10 px-3 py-1">
                <p className="font-mono text-violet9 text-xs">{chain.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              {balances.map((balance) => {
                console.log('balance:: ', balance)
                const balanceId = `${chain.id}-${balance.tokenId}-${balance.symbol}`

                const transferId = `transfer-${balanceId}`
                const swapId = `swap-${balanceId}`
                const isOpen = isPanelOpen === transferId || isPanelOpen === swapId

                return (
                  <div key={balanceId}>
                    <div
                      className={cx(
                        'flex items-center justify-between rounded-lg border border-gray4 p-3 capitalize hover:bg-gray2',
                        isOpen && 'rounded-b-none bg-gray2',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet9 to-violet11">
                          <span className="font-semibold text-sm text-white">
                            {balance.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray12 text-sm">
                            {balance.symbol}
                          </p>
                          <p className="text-gray10 text-xs capitalize">
                            {balance.tokenId.replace(`${chain.id}-`, '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray12 text-sm">
                            {balance.balanceFormatted.toFixed(4)}{' '}
                            <span className="font-normal">
                              {balance.symbol}
                            </span>
                          </p>
                          <p className="text-gray10 text-xs">
                            {formatValue(balance.usdValue)}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleOpenPanel(transferId)}
                          size="small"
                          title="Swap"
                        >
                          <LucideArrowDownUp className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleOpenPanel(transferId)}
                          size="small"
                          title="Transfer"
                        >
                          <LucideSend className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <Transfer
                      balance={balance}
                      isOpen={isPanelOpen === transferId}
                      onClose={() => handleClosePanel(transferId)}
                      refetch={refetch}
                    />
                    <Transfer
                      balance={balance}
                      isOpen={isPanelOpen === swapId}
                      onClose={() => handleClosePanel(swapId)}
                      refetch={refetch}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}
