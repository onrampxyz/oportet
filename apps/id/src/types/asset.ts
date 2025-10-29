export type Asset = {
  address: `0x${string}` | 'native'
  balance: bigint
  chainId: number
  metadata: {
    decimals: number
    name: string
    symbol: string
  } | null
  type: 'native' | 'erc20' | 'erc721' | string
}

export type AssetsByChain = {
  [chainId: `0x${string}`]: Asset[]
}
