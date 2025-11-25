import type { Address } from 'ox'
import { Hooks } from 'porto/wagmi'
import { zeroAddress } from 'viem'
import { useAccount, useCapabilities } from 'wagmi'
import { assetsToWalletBalances } from '~/lib/Mapper'
import type { Asset } from '~/types/asset'
import { WalletBalances } from '../Portfolio/WalletBalances'

const dummy: Asset = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as Address.Address,
  balance: 1000000000n, // 1000 USDC (6 decimals)
  chainId: 1,
  feeToken: false,
  metadata: {
    decimals: 6,
    logo: 'https://example.com/usdc-logo.png',
    name: 'USD Coin',
    symbol: 'USDC',
  },
  type: 'erc20',
}

export function Assets() {
  const { address } = useAccount()

  const account = useAccount()

  const capabilities = useCapabilities({
    query: { enabled: account.status === 'connected' },
  })

  const assets = Hooks.useAssets({
    query: {
      enabled: account.status === 'connected',
      select: (data) => {
        const formattedAssets: Array<Asset> = []
        for (const chainId in data) {
          const chainAssets = data[chainId]
          if (chainId === '0' || !chainAssets) continue

          const feeTokens =
            capabilities?.data?.[Number(chainId)]?.feeToken.tokens
          for (const asset of chainAssets) {
            const isNative = asset.type === 'native'

            const address = isNative
              ? zeroAddress
              : (asset.address as Address.Address)
            if (!address || asset.balance === 0n) continue
            formattedAssets.push({
              address,
              balance: asset.balance,
              chainId: Number(chainId),
              feeToken: isNative
                ? true
                : (feeTokens?.some((token) => token.address === address) ??
                  false),
              metadata: {
                ...asset.metadata,
                decimals: isNative ? 18 : asset.metadata!.decimals,
                name: isNative ? 'Ether' : asset.metadata!.name,
                symbol: isNative ? 'ETH' : asset.metadata!.symbol,
              },
              type: asset.type as any,
            })
          }
        }

        return formattedAssets.sort((a, b) => (a.balance > b.balance ? -1 : 1))
      },
    },
  })

  console.log('assets:: ', assets)

  const wallet = assetsToWalletBalances(assets.data ?? [], new Map())

  return (
    <div className="space-y-3">
      {/* Wallet Balances Section - Per Chain */}
      <WalletBalances
        balances={wallet.balances}
        isLoading={assets.isLoading || assets.isPending}
        refetch={assets.refetch}
      />
    </div>
  )
}
