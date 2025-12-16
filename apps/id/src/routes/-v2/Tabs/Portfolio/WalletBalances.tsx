import { Button, Spinner, Toast } from '@porto/apps/components'
import { Chains } from 'rise-wallet'
import { Hooks } from 'rise-wallet/wagmi'
import { toast } from 'sonner'
import { useAccount, useChains } from 'wagmi'
import type { Balance } from '~/types/wallet'
import { ValueFormatter } from '~/utils'
import LucideArrowDownUp from '~icons/lucide/arrow-down-up'
import LucideSend from '~icons/lucide/send'

export type WalletBalancesProps = {
  balances?: Balance[]
  isLoading: boolean
  refetch: () => void
}

export function WalletBalances(props: Readonly<WalletBalancesProps>) {
  const { balances, isLoading, refetch } = props

  const chains = useChains()
  const { address } = useAccount()

  const hasBalance = balances && balances?.length !== 0

  const transferFunds = Hooks.useTransferFunds({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Failed to transfer funds"
          />
        ))
      },
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            className={t}
            description="Transfer completed successfully"
            kind="success"
            title="Transfer Completed"
          />
        ))
        refetch()
      },
    },
  })

  const swapFunds = Hooks.useSwapFunds({
    mutation: {
      onError: (error) => {
        if (error.name === 'UserRejectedRequestError') return
        toast.custom((t) => (
          <Toast
            className={t}
            description={error.message}
            kind="error"
            title="Failed to swap funds"
          />
        ))
      },
      onSuccess: () => {
        toast.custom((t) => (
          <Toast
            className={t}
            description="Swap completed successfully"
            kind="success"
            title="Swap Completed"
          />
        ))
        refetch()
      },
    },
  })

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '$0.00'
    return `$${ValueFormatter.formatToPrice(value)}`
  }

  const handleTransfer = (balance: Balance) => {
    // Extract token address from tokenId (format: chainId-address)
    const tokenAddress = balance.tokenId.split('-')[1] ?? balance.tokenId

    transferFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      token: {
        address: tokenAddress as `0x${string}`,
        balance: balance.balance,
        balanceFormatted: balance.balanceFormatted,
        decimals: balance.decimals,
        isNative: balance.isNative,
        price: balance.price,
        priceSource: balance.priceSource,
        symbol: balance.symbol,
        tokenId: balance.tokenId,
        updatedAt: balance.updatedAt,
        usdValue: balance.usdValue,
      },
    })
  }

  const handleSwap = (balance: Balance) => {
    // Extract token address from tokenId (format: chainId-address)
    const tokenAddress = balance.tokenId.split('-')[1] ?? balance.tokenId

    swapFunds.mutate({
      address,
      chainId: Chains.riseTestnet.id,
      fromToken: {
        address: tokenAddress as `0x${string}`,
        balance: balance.balance,
        balanceFormatted: balance.balanceFormatted,
        decimals: balance.decimals,
        isNative: balance.isNative,
        price: balance.price,
        priceSource: balance.priceSource,
        symbol: balance.symbol,
        tokenId: balance.tokenId,
        updatedAt: balance.updatedAt,
        usdValue: balance.usdValue,
      },
    })
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
                const balanceId = `${balance.tokenId}-${balance.symbol}`

                return (
                  <div
                    className="flex items-center justify-between rounded-lg border border-gray4 p-3 capitalize hover:bg-gray2"
                    key={balanceId}
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
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <p className="font-semibold text-gray12 text-sm">
                          {balance.balanceFormatted.toFixed(4)}{' '}
                          <span className="font-normal">{balance.symbol}</span>
                        </p>
                        <p className="text-gray10 text-xs">
                          {formatValue(balance.usdValue)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSwap(balance)}
                          size="small"
                          title="Swap"
                        >
                          <LucideArrowDownUp className="size-4" />
                        </Button>
                        <Button
                          onClick={() => handleTransfer(balance)}
                          size="small"
                          title="Transfer"
                        >
                          <LucideSend className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
    </div>
  )
}
