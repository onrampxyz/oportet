import { useQuery } from '@tanstack/react-query'
import type { Address, Hex } from 'ox'
import { porto } from '~/lib/Porto'

export type UseDestinationAssetParams = {
  address: Address.Address
  destinationChainId: number
  destinationTokenAddress?: Address.Address
  enabled?: boolean
  refetchInterval?: number | false
}

export function useDestinationAsset(params: UseDestinationAssetParams) {
  const {
    address,
    destinationChainId,
    destinationTokenAddress,
    enabled = true,
    refetchInterval = false,
  } = params

  const { data: balance, refetch } = useQuery({
    enabled: enabled && Boolean(destinationTokenAddress),
    async queryFn() {
      if (!destinationTokenAddress) return 0n

      const hexChainId = `0x${destinationChainId.toString(16)}` as Hex.Hex
      const response = await porto.provider.request({
        method: 'wallet_getAssets',
        params: [
          {
            account: address,
            assetFilter: {
              [hexChainId]: [
                {
                  address: destinationTokenAddress,
                  type: 'erc20',
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
    queryKey: [
      'destination-asset-balance',
      destinationChainId,
      destinationTokenAddress,
      address,
    ],
    refetchInterval,
  })

  return {
    balance,
    refetch,
  }
}
