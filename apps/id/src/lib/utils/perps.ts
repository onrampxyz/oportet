import { MarketId } from '~/constants/order'
import { ValueFormatter } from '~/utils'

export const convertProductIdToMarketId = (productId: string): MarketId => {
  switch (productId) {
    case 'BTC-PERP':
      return MarketId.BTC
    case 'ETH-PERP':
      return MarketId.ETH
    case 'BNB-PERP':
      return MarketId.BNB
    case 'SOL-PERP':
      return MarketId.SOL
    case 'DOGE-PERP':
      return MarketId.DOGE
    case 'kPEPE-PERP':
      return MarketId.kPEPE
    case 'KPEPE-PERP':
      return MarketId.kPEPE
    case 'SPY-PERP':
      return MarketId.SPY
    case 'TSLA-PERP':
      return MarketId.TSLA
    case 'COIN-PERP':
      return MarketId.COIN
    case 'HOOD-PERP':
      return MarketId.HOOD
    case 'NVDA-PERP':
      return MarketId.NVDA
    case 'LIT-PERP':
      return MarketId.LIT
    default:
      return MarketId.BTC
  }
}

export const convertMarketIdToProductId = (marketId: MarketId): string => {
  switch (marketId) {
    case MarketId.BTC:
      return 'BTC-PERP'
    case MarketId.ETH:
      return 'ETH-PERP'
    case MarketId.BNB:
      return 'BNB-PERP'
    case MarketId.SOL:
      return 'SOL-PERP'
    case MarketId.DOGE:
      return 'DOGE-PERP'
    case MarketId.kPEPE:
      return 'kPEPE-PERP'
    case MarketId.SPY:
      return 'SPY-PERP'
    case MarketId.TSLA:
      return 'TSLA-PERP'
    case MarketId.COIN:
      return 'COIN-PERP'
    case MarketId.HOOD:
      return 'HOOD-PERP'
    case MarketId.NVDA:
      return 'NVDA-PERP'
    case MarketId.LIT:
      return 'LIT-PERP'
    default:
      return 'BTC-PERP'
  }
}

export const getChangePercent = (markPrice: string, change24h: string) => {
  return (
    (ValueFormatter.anyToFloat(markPrice) /
      (ValueFormatter.anyToFloat(markPrice) -
        ValueFormatter.anyToFloat(change24h)) -
      1) *
    100
  )
}
