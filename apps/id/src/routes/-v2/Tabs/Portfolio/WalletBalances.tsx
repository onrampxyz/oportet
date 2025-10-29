import { Spinner } from '@porto/apps/components'
import { toNumber } from 'ox/Hex'
import { Hooks } from 'porto/wagmi'
import { useMemo } from 'react'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { formatBalance } from '~/mock/assets'
import type { AssetsByChain } from '~/types/asset'
import type { BalanceByChain, WalletBalance } from '~/types/portfolio'
import { AddressFormatter } from '~/utils'

// Chain ID to name mapping
const CHAIN_NAMES: Record<string, string> = {
  '0x1': 'Ethereum',
  '0x2105': 'Base',
  '0xAA39DB': 'RISE Testnet',
  '0xa': 'Optimism',
  '0xa4b1': 'Arbitrum',
}

// Get mock price for token
function getMockPrice(symbol: string): number {
  const prices: Record<string, number> = {
    ETH: 3535,
    RISE: 0.1,
    USDC: 1,
    USDT: 1,
    WBTC: 68000,
    WETH: 3535,
  }
  return prices[symbol] || 1
}

function transformAssetsToBalancesByChain(
  assets: AssetsByChain,
): BalanceByChain[] {
  const balancesByChain: BalanceByChain[] = []

  for (const [chainId, chainAssets] of Object.entries(assets)) {
    const balances: WalletBalance[] = []
    if (chainId === '0' || !chainAssets) continue

    for (const asset of chainAssets) {
      if (!asset.metadata) continue

      const formattedBalance = formatBalance(
        asset.balance,
        asset.metadata.decimals,
      )
      const mockPrice = getMockPrice(asset.metadata.symbol)
      const usdValue = Number(formattedBalance) * mockPrice

      balances.push({
        address:
          asset.address === 'native'
            ? 'native'
            : AddressFormatter.short(asset.address),
        balance: `${formattedBalance} ${asset.metadata.symbol}`,
        name: asset.metadata.name,
        symbol: asset.metadata.symbol,
        usdValue: `$${usdValue.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
      })
    }

    // Sort by USD value (descending)
    balances.sort((a, b) => {
      const aValue = Number.parseFloat(a.usdValue.replace(/[$,]/g, ''))
      const bValue = Number.parseFloat(b.usdValue.replace(/[$,]/g, ''))
      return bValue - aValue
    })

    balancesByChain.push({
      balances,
      chainId,
      chainName: CHAIN_NAMES[chainId] || `Chain ${chainId}`,
    })
  }

  return balancesByChain
}

export function WalletBalances() {
  const { address } = useAccount()
  const { data: assets, isPending } = Hooks.useAssets({ account: address })

  const balancesByChain = useMemo(() => {
    if (assets) {
      return transformAssetsToBalancesByChain(assets as AssetsByChain)
    }
    return []
  }, [assets])

  console.log("balancesByChain:: ", balancesByChain)

  return (
    <div className="space-y-4 rounded-lg border border-gray5 bg-white p-6 dark:bg-gray1">

      <h2 className="font-semibold text-lg">Wallet Balances By Chain</h2>
      {/* Loading State */}
      {isPending && (
        <div className="flex items-center justify-center">
          <Spinner className="size-6!" />
        </div>
      )}

      {!isPending && balancesByChain.length === 0 && (
        <div className="">
          <p className="font-medium text-gray10 text-sm">
            No Balance in your wallet!
          </p>
        </div>
      )}

      {!isPending && balancesByChain?.map((chainData) => (
        <div className="" key={chainData.chainId}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{chainData.chainName}</h3>
              <p className="text-gray10 text-sm">
                {chainData.balances.length} token
                {chainData.balances.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="rounded-full bg-violet9/10 px-3 py-1">
              <p className="font-mono text-violet9 text-xs">
                {toNumber(chainData.chainId as Hex)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {chainData.balances.map((balance) => (
              <div
                className="flex items-center justify-between rounded-lg border border-gray4 p-3 hover:bg-gray2"
                key={`${chainData.chainId}-${balance.address}`}
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
                    <p className="text-gray10 text-xs">{balance.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray12 text-sm">
                    {balance.balance}
                  </p>
                  <p className="text-gray10 text-xs">{balance.usdValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
