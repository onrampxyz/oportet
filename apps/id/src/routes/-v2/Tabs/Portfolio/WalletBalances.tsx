import { Spinner } from '@porto/apps/components'
import { useChains } from 'wagmi'
import type { Balance } from '~/types/wallet'

export type WalletBalancesProps = {
  balances?: Balance[]
  isLoading: boolean
}

export function WalletBalances(props: WalletBalancesProps) {
  const { balances, isLoading } = props
  const chains = useChains()

  const hasBalance = !isLoading && balances && balances?.length !== 0

  return (
    <div className="space-y-4 rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">
      <h2 className="font-semibold text-lg">Wallet Balances By Chain</h2>
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center pt-6">
          <Spinner className="size-6!" />
        </div>
      )}

      {!hasBalance && (
        <div className="">
          <p className="font-medium text-gray10 text-sm">
            You have no available balance in your wallet!
          </p>
        </div>
      )}

      {hasBalance && chains?.map((chain) => (
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
            {balances.map((balance) => (
              <div
                className="flex items-center justify-between rounded-lg border border-gray4 p-3 capitalize hover:bg-gray2"
                key={`${balance.tokenId}-${balance.symbol}`}
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
                <div className="text-right">
                  <p className="font-semibold text-gray12 text-sm">
                    {balance.balanceFormatted.toFixed(4)}{' '}
                    <span className="font-normal">{balance.symbol}</span>
                  </p>
                  <p className="text-gray10 text-xs">
                    {balance.usdValue.toFixed(4)} $
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
