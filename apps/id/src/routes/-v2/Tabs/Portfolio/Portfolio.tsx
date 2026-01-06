import { useAccount } from 'wagmi'
import { useWallet } from '~/hooks'
import { BalancesByProtocol } from './BalancesByProtocol'
import { Summary } from './Summary'
import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  const { address } = useAccount()
  const { balances, protocol, summary, calls, isLoading, isPending } =
    useWallet({
      address,
    })

  const handleRefetch = () => {
    balances.refetch()
    summary.refetch()
    calls.refetch()
  }

  console.log('isPending:: ', isPending)
  console.log('isLoading:: ', isLoading)

  return (
    <div className="space-y-3">
      {/* Perps Portfolio */}
      {/* <PortfolioValueTiles /> */}

      {/* 24h Balance Change Section */}
      <Summary
        isLoading={isLoading}
        summary={summary.data}
        transactionCount={calls.data?.totalCount ?? 0}
      />

      {/* Wallet Balances Section - Per Chain */}
      <WalletBalances
        balances={balances.data}
        isLoading={isLoading}
        refetch={handleRefetch}
      />

      {/* Balances by Protocol Section */}
      <BalancesByProtocol
        isLoading={isLoading}
        positions={protocol?.data?.positions}
      />
    </div>
  )
}
