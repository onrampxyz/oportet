// export type Asset = {
//   address: `0x${string}` | 'native'
//   balance: bigint
//   metadata: {
//     decimals: number
//     name: string
//     symbol: string
//   } | null
//   type: 'native' | 'erc20' | 'erc721' | string
// }

export type Asset = {
  address: `0x${string}`
  chainId: number
  balance: bigint
} & (
  | {
      metadata: null
      type: 'native'
      feeToken: boolean
    }
  | {
      type: 'erc20'
      metadata: {
        name?: string
        symbol?: string
        decimals: number
        logo?: string | undefined
      }
      feeToken: boolean
    }
)

export type AssetsByChain = {
  [chainId: `0x${string}`]: Asset[]
}
