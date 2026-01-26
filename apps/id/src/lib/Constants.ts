import type { PortoConfig } from '@porto/apps'
import type { Address } from 'ox'
import { riseTestnet } from 'viem/chains'

export const CORS_DESTROYER_URL = 'https://cors.porto.workers.dev'

export function urlWithCorsBypass(url: string) {
  return `${CORS_DESTROYER_URL}?url=${url}`
}

export const ethAsset = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  logo: '/icons/eth.svg',
  name: 'Ethereum',
  symbol: 'ETH',
} as const

export type ChainId = PortoConfig.ChainId

// TODO: extract from `wallet_getCapabilities` instead of hardcoding.
export const defaultAssets: Record<
  PortoConfig.ChainId,
  ReadonlyArray<{
    name: string
    logo: string
    symbol: string
    decimals: number
    address: Address.Address
    price?: number
    coingeckoId?: string
  }>
> = {
  [riseTestnet.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  ],
  [Chains.sepolia.id]: [
    {
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logo: '/icons/eth.svg',
      name: 'Ethereum',
      symbol: 'ETH',
    },
  ],
}
