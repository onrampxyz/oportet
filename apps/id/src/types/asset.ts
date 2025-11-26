export type Asset = {
  address: `0x${string}` | 'native'
  balance: bigint
  metadata: {
    decimals: number
    name: string
    symbol: string
  } | null
  type: 'native' | 'erc20' | 'erc721' | string
  chainId?: number
  feeToken?: boolean
}

export type AssetsByChain = {
  [chainId: `0x${string}`]: Asset[]
}
