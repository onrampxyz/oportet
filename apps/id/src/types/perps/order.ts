import type { MarketId } from '~/constants/order'

export enum OrderSide {
  Long = 0,
  Short = 1,
}

export enum STPMode {
  ExpireMaker = 0,
  ExpireTaker = 1,
  ExpireBoth = 2,
  None = 3,
}

export enum OrderType {
  Market = 0,
  Limit = 1,
}

export enum OrderStatus {
  None = 0,
  Open = 1,
  Filled = 2,
  Cancelled = 3,
  Expired = 4,
}

export enum MarginMode {
  Cross = 0,
  Isolated = 1,
}

export enum TimeInForce {
  GoodTillCancelled = 0,
  GoodTillTime = 1,
  FillOrKill = 2,
  ImmediateOrCancel = 3,
}

export type MarketInfo = {
  name: string
  quote: string
  stepSize: string
  stepPrice: string
  maintenanceMargin: string
  maxLeverage: string
  minOrderSize: string
  id: string
  decimalQuote: number
  baseAssetSymbol: string
  quoteAssetSymbol: string
  baseIncrement: string
  quoteIncrement: string
  productId: string
}

export interface IOpenOrderData {
  id: bigint
  marketId: bigint
  maker: string
  size: bigint
  price: number
  feeBps: bigint
  filledSize: bigint
  side: OrderSide
  status: OrderStatus
  marketIdFormatted: MarketId
  sideFormatted: string
  sizeFormatted: string
  filledSizeFormatted: string
  feeBpsFormatted: string
  statusFormatted: string
  reduceOnly: boolean
  postOnly: boolean
  timeInForce: TimeInForce
  expiry: number
}

export interface IContractOrderData {
  size: bigint
  feeBps: bigint
  filledSize: bigint
  side: OrderSide
  status: OrderStatus
  user: string
  orderType: OrderType
  stpMode: STPMode
  tick: number
  postOnly: boolean
  reduceOnly: boolean
  timeInForce: TimeInForce
  expiry: number
}

export interface ICancelOrderParams {
  marketId: bigint
  orderId: bigint
}

export const OrderStatusString = [
  {
    label: 'OPEN',
    value: 'ORDER_STATUS_OPEN',
  },
  {
    label: 'CANCELLED',
    value: 'ORDER_STATUS_CANCELLED',
  },
  {
    label: 'FILLED',
    value: 'ORDER_STATUS_FILLED',
  },
  {
    label: 'EXPIRED',
    value: 'ORDER_STATUS_EXPIRED',
  },
]

export const OrderSideString = [
  {
    label: 'buy',
    value: 'ORDER_SIDE_BUY',
  },
  {
    label: 'sell',
    value: 'ORDER_SIDE_SELL',
  },
]

export const TimeInForceString = [
  {
    label: TimeInForce.GoodTillCancelled,
    value: 'GTC',
  },
  {
    label: TimeInForce.GoodTillTime,
    value: 'GTT',
  },
  {
    label: TimeInForce.FillOrKill,
    value: 'FOK',
  },
  {
    label: TimeInForce.ImmediateOrCancel,
    value: 'IOC',
  },
]

export interface WebSocketOrderData {
  sender: string
  avg_price: string
  block_number: string
  cancel_reason: string
  cancel_requested: boolean
  cancel_requested_at: string
  created_at: string
  expiry: number
  fee_bps: string
  filled_size: string
  id: string
  log_index: string
  market_id: string
  post_only: boolean
  price: string
  reduce_only: boolean
  side: string
  size: string
  status: string
  stp_mode: string
  time_in_force: string
  tx_hash: string
  type: string
}
