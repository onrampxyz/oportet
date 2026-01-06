import { useAccount } from 'wagmi'
import { useWallet } from '~/hooks'
import { ValueFormatter } from '~/utils'
import { BalancesByProtocol } from './BalancesByProtocol'
import { PortfolioValueTiles } from './PortfolioValueTiles'
import { PortfolioValueTilesSkeleton } from './PortfolioValueTilesSkeleton'
import { Summary } from './Summary'
import { WalletBalances } from './WalletBalances'

export function Portfolio() {
  const { address } = useAccount()
  const { balances, protocol, summary, calls, isLoading } = useWallet({
    address,
  })

  const handleRefetch = () => {
    balances.refetch()
    summary.refetch()
    calls.refetch()
  }

  // Calculate portfolio metrics from available data
  const totalValue = summary.data?.totalValue ?? 0
  // const tokensValue = summary.data?.breakdown?.tokens.value ?? 0
  const protocolsValue = summary.data?.breakdown?.protocols.value ?? 0

  // Mock data for metrics not yet available from API
  // TODO: Replace with real API data when available
  const valueChange = totalValue * 0.22 // 22% mock change
  const inPositions = protocolsValue
  const totalPnL24h = totalValue * 0.08 // 8% mock 24h PnL
  const totalProfit = totalValue * 0.35 // 35% mock profit
  const totalLoss = totalValue * 0.15 // 15% mock loss

  const formatValue = (value: number) => {
    if (value === 0) return '$0.00'
    const formatted = ValueFormatter.formatToPrice(value)
    return value >= 0 ? `+$${formatted}` : `-$${formatted.replace('-', '')}`
  }

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`
  }

  return (
    <div className="space-y-3">
      {/* Portfolio Value Tiles */}
      {isLoading ? (
        <PortfolioValueTilesSkeleton />
      ) : (
        <PortfolioValueTiles
          inPositions={`$${ValueFormatter.formatToPrice(inPositions)}`}
          totalLoss={`-$${ValueFormatter.formatToPrice(Math.abs(totalLoss))}`}
          totalPnL24h={formatValue(totalPnL24h)}
          totalProfit={formatValue(totalProfit)}
          totalValue={`$${ValueFormatter.formatToPrice(totalValue)}`}
          valueChange={formatValue(valueChange)}
          valueChangePercent={formatPercent((valueChange / totalValue) * 100)}
        />
      )}

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
