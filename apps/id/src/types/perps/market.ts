import type { Address } from 'ox'

// Market Types

export type MarketConfig = {
  name: string
  quote: string // address
  step_size: string // big number (int as string)
  step_price: string // big number (int as string)
  maintenance_margin_factor: string // big number
  max_leverage: string // big number
  min_order_size: string // big number
  unlocked: boolean
  open_interest_limit: string // big number
}

export type Market = {
  market_id: string
  config: MarketConfig
  available: boolean
  base_asset_symbol: string
  quote_asset_symbol: string
  underlying: string
  display_name: string
  quote_volume_24h: string // decimal as string
  change_24h: string // decimal as string
  high_24h: string // decimal as string
  low_24h: string // decimal as string
  last_price: string // decimal as string
  mark_price: string // decimal as string
  index_price: string // decimal as string
  max_position_size: string // big number
  open_interest: string // decimal as string
  funding_interval: string // nanoseconds?
  next_funding_time: string // timestamp as string
  post_only: boolean
  last_cumulative_funding: string // decimal as string
  predicted_funding_rate: string // decimal as string
  visible: boolean
  display_base_asset_symbol: string
}

export type MarketResponse = {
  data: {
    markets: Market[]
  }
}

export type Trade = {
  id: string
  market_id: string
  price: string
  quantity: string
  side: 'buy' | 'sell'
  timestamp: string
  buyer: Address.Address
  seller: Address.Address
}

export type OrderbookLevel = {
  price: string
  quantity: string
  total: string
}

export type Orderbook = {
  market_id: string
  bids: OrderbookLevel[]
  asks: OrderbookLevel[]
  timestamp: string
}

// Order Types
export type OrderSide = 'buy' | 'sell'
export type OrderType = 'limit' | 'market'
export type OrderStatus = 'open' | 'filled' | 'partially_filled' | 'cancelled'

export type PlaceOrderRequest = {
  market_id: string
  side: OrderSide
  type: OrderType
  price?: string
  quantity: string
}

export type Order = {
  id: string
  price: string
  size: string
  market_id: string
  side: string // 'BUY' | 'SELL'
  type: string // 'LIMIT' | 'MARKET'
  time_in_force: string
  expiry: number
  post_only: boolean
  reduce_only: boolean
  cancel_reason: string
  block_number: string
  log_index: string
  stp_mode: string
  filled_size: string
  status: string // 'ORDER_STATUS_OPEN' | 'ORDER_STATUS_FILLED' | 'ORDER_STATUS_CANCELLED'
  sender: string
  fee_bps: string
  avg_price: string
  cancel_requested: boolean
  created_at: string
  tx_hash: string
  cancel_requested_at: string
  cancel_tx_hash: string
}

export type OrderHistoryResponse = {
  data: {
    has_next_page: boolean
    orders: Order[]
    page: number
    total_count: number
  }
  request_id: string
}

export type PlaceOrderResponse = {
  order: Order
}

export type CancelOrderRequest = {
  order_id: string
}

export type CancelOrderResponse = {
  success: boolean
  order_id: string
}

// Stats Types
export type Stats = {
  total_volume_24h: string
  total_trades_24h: number
  active_markets: number
  total_users: number
  market_stats: MarketStats[]
}

export type MarketStats = {
  market_id: string
  volume_24h: string
  price_change_24h: string
  high_24h: string
  low_24h: string
  last_price: string
  trades_24h: number
}

// Account Types
export type AccountBalance = {
  asset: string
  available: string
  locked: string
  total: string
}
