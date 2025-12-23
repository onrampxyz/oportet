import type { Market } from '~/routes/-v2/Tabs/Perps/Markets'
import type { Order } from '~/routes/-v2/Tabs/Perps/OrderBook'
import type { Position } from '~/routes/-v2/Tabs/Perps/Positions'

export const MarketsData: Market[] = [
  {
    change: '+2.45%',
    high: '99,123.00',
    isPositive: true,
    low: '95,890.00',
    name: 'Bitcoin',
    price: '98,245.5',
    symbol: 'BTC-PERP',
    volume: '1.23B',
  },
  {
    change: '-1.23%',
    high: '',
    isPositive: false,
    low: '',
    name: 'Ethereum',
    price: '3,598.23',
    symbol: 'ETH-PERP',
    volume: '$567.89M',
  },
]

export const PositionsData: Position[] = [
  {
    entry: '$96,500',
    isPositive: true,
    leverage: '10x',
    mark: '$98,245.5',
    market: 'BTC-PERP',
    name: 'Bitcoin Perpetual',
    pnl: '+$872.75',
    pnlPercent: '+9.04',
    side: 'LONG',
    size: '0.5',
  },
  {
    entry: '$3,650',
    isPositive: false,
    leverage: '5x',
    mark: '$3,598',
    market: 'ETH-PERP',
    name: 'Etherreum Perpetual',
    pnl: '-$166.40',
    pnlPercent: '-4.88',
    side: 'SHORT',
    size: '3.2',
  },
]

export const OrderbookData: Order[] = [
  { price: '$99,123.00', size: '2.45', total: '242734' },
  { price: '$99,099.50', size: '1.23', total: '121968' },
  { price: '$98,648.30', size: '3.67', total: '362090' },
  { price: '$98,540.00', size: '0.98', total: '97149' },
  { isMid: true, price: '$98,244.50', size: '1.56', total: '153262' },
  { price: '$98,210.00', size: '2.34', total: '229890' },
  { price: '$98,045.50', size: '4.12', total: '404751' },
  { price: '$98,091.00', size: '1.76', total: '172640' },
]
