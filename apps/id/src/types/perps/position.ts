import type { MarketId } from '@/constants/order'
import type { MarginMode, OrderSide } from '@/modules/order/types'

export interface WebSocketPosition {
  account: string
  avg_entry_price: string
  block_number: string
  isolated_usdc_balance: string
  last_funding_payment: string
  leverage: string
  log_index: string
  margin_mode: 'CROSS' | 'ISOLATED'
  market_id: string
  quote_amount: string
  side: 'BUY' | 'SELL'
  size: string
}

export interface ContractPosition {
  size: bigint
  quoteAmount: bigint
  lastFundingPayment: bigint
  marginMode: MarginMode
  side: OrderSide
  isolatedUsdcBalance: bigint
}

export interface IPositionData {
  marketId: MarketId
  productId: string
  size: bigint
  formattedSize: string
  quoteAmount: string
  lastFundingPayment: string
  marginMode: string
  side: string
  leverage: string
  markPrice: string
  estPnl: string
  entryPrice: string
  estLiqPrice: string
  marginRatio: string
  margin: string
  isolatedUsdcBalance: string
  estPnlPercentage: string
  initialMarginRequirement: string
  unsettledUsdc: string
  freeIsolatedMarginBalance: string
  withdralableAmount: string
}

export interface WebSocketPositionData {
  account: string
  avg_entry_price: string
  block_number: string
  isolated_usdc_balance: string
  last_funding_payment: string
  leverage: string
  log_index: string
  margin_mode: 'CROSS' | 'ISOLATED'
  market_id: string
  quote_amount: string
  side: 'BUY' | 'SELL'
  size: string
}
