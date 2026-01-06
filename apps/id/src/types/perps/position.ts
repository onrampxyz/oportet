export type Position = {
  account: string
  market_id: string
  block_number: string
  log_index: string
  block_timestamp: string
  size: string
  quote_amount: string
  margin_mode: string
  side: string
  isolated_usdc_balance: string
  last_funding_payment: string
  leverage: string
  avg_entry_price: string
}

export type PositionsResponse = {
  positions: Position[]
  total_count: number
  page: number
  page_size: number
  has_next_page: boolean
}
