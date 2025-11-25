import { useAccount } from 'wagmi'
import { useWallet } from '~/hooks'
import { BalancesByProtocol } from './BalancesByProtocol'
import { Summary } from './Summary'
import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  const { address } = useAccount()
  const { balances, protocol, summary, calls, isLoading } = useWallet({
    address,
  })

  console.log('calls:: ', calls.data)

  const handleRefetch = () => {
    console.log('-----------------------------------')
    console.log('Refetching portfolio data...')
    balances.refetch()
    summary.refetch()
    calls.refetch()

    console.log('balances-new:: ', balances.data)
    console.log('summary-new:: ', summary.data)
    console.log('-----------------------------------')
  }

  return (
    <div className="space-y-3">
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
