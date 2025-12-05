export type BalanceChange = {
  totalChange: string
  wallet: string
  protocols: string
  transactions: number
}

export type WalletBalance = {
  symbol: string
  name: string
  address: string
  balance: string
  usdValue: string
  logo?: string
}

export type ProtocolPosition = {
  protocol: string
  protocolIcon: string
  type: string
  value: string
  apy: string
  change24h: string
  pair: string
}

// Transform asset data into WalletBalance format (per chain)
export type BalanceByChain = {
  balances: WalletBalance[]
  chainId: string
  chainName: string
}
