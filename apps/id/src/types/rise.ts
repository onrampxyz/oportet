import type { Address } from 'ox'

// Market Types
export type Market = {
  id: string
  name: string
  base_asset: string
  quote_asset: string
  status: 'active' | 'inactive'
  min_order_size: string
  max_order_size: string
  tick_size: string
  created_at: string
  updated_at: string
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
  market_id: string
  user: Address.Address
  side: OrderSide
  type: OrderType
  price: string
  quantity: string
  filled_quantity: string
  status: OrderStatus
  created_at: string
  updated_at: string
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
