import { useQuery } from '@tanstack/react-query'
import type { Address, Hex } from 'ox'
import { zeroAddress } from 'viem'
import { porto } from '~/lib/Porto'

export type UseWalletBalanceParams = {
  address: Address.Address
  chainId?: number
  tokenAddress?: Address.Address
}

export function useWalletAsset(params: UseWalletBalanceParams) {
  const { address, chainId, tokenAddress } = params

  const { data: balance, refetch } = useQuery({
    enabled: Boolean(chainId && tokenAddress && address),
    async queryFn() {
      if (!chainId || !tokenAddress) return 0n

      const hexChainId = `0x${chainId.toString(16)}` as Hex.Hex
      const isNative = tokenAddress.toLowerCase() === zeroAddress.toLowerCase()
      const response = await porto.provider.request({
        method: 'wallet_getAssets',
        params: [
          {
            account: address,
            assetFilter: {
              [hexChainId]: [
                {
                  address: isNative ? ('native' as const) : tokenAddress,
                  type: isNative ? 'native' : 'erc20',
                },
              ],
            },
            chainFilter: [hexChainId],
          },
        ],
      })
      const assets = response[hexChainId] ?? []
      const asset = assets[0]
      return asset ? BigInt(asset.balance) : 0n
    },
    queryKey: ['wallet-asset-balance', chainId, tokenAddress, address],
  })

  return { balance, refetch }
}
