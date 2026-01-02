import type { MarketInfo } from '~/types/perps/order'

export const ORDER_STATUS = {
  CANCELED: 'CANCELED',
  DONE: 'DONE',
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  RECEIVED: 'RECEIVED',
}

export enum MarketId {
  BTC = '1',
  ETH = '2',
  BNB = '3',
  SOL = '4',
  DOGE = '5',
  kPEPE = '6',
}

export const MARKETS_CONFIG: Record<MarketId, MarketInfo> = {
  [MarketId.BTC]: {
    baseAssetSymbol: 'BTC',
    baseIncrement: '0.000001',
    decimalQuote: 1,
    id: MarketId.BTC,
    maintenanceMargin: '75', // 75%
    maxLeverage: '50',
    minOrderSize: '0.000001',
    name: 'BTC/USDC',
    productId: 'BTC-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.1',
    stepPrice: '0.1',
    stepSize: '0.000001',
  },
  [MarketId.ETH]: {
    baseAssetSymbol: 'ETH',
    baseIncrement: '0.001',
    decimalQuote: 2,
    id: MarketId.ETH,
    maintenanceMargin: '75',
    maxLeverage: '50',
    minOrderSize: '0.001',
    name: 'ETH/USDC',
    productId: 'ETH-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.01',
    stepPrice: '0.01',
    stepSize: '0.001',
  },
  [MarketId.BNB]: {
    baseAssetSymbol: 'BNB',
    baseIncrement: '0.001',
    decimalQuote: 2,
    id: MarketId.BNB,
    maintenanceMargin: '75', // rate = 0.01(3)
    maxLeverage: '50', // x50
    minOrderSize: '0.001',
    name: 'BNB/USDC',
    productId: 'BNB-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.01',
    stepPrice: '0.01',
    stepSize: '0.001',
  },
  [MarketId.SOL]: {
    baseAssetSymbol: 'SOL',
    baseIncrement: '0.001',
    decimalQuote: 2,
    id: MarketId.SOL,
    maintenanceMargin: '75', // rate = 0.01(3)
    maxLeverage: '50', // x50
    minOrderSize: '0.001',
    name: 'SOL/USDC',
    productId: 'SOL-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.01',
    stepPrice: '0.01',
    stepSize: '0.001',
  },
  [MarketId.DOGE]: {
    baseAssetSymbol: 'DOGE',
    baseIncrement: '1',
    decimalQuote: 5,
    id: MarketId.DOGE,
    maintenanceMargin: '75', // rate = 0.01(3)
    maxLeverage: '50', // x50
    minOrderSize: '10',
    name: 'SOL/USDC',
    productId: 'DOGE-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.00001',
    stepPrice: '0.00001',
    stepSize: '1',
  },
  [MarketId.kPEPE]: {
    baseAssetSymbol: 'kPEPE',
    baseIncrement: '1',
    decimalQuote: 6,
    id: MarketId.kPEPE,
    maintenanceMargin: '75', // rate = 0.01(3)
    maxLeverage: '50', // x50
    minOrderSize: '10',
    name: 'kPEPE/USDC',
    productId: 'kPEPE-PERP',
    quote: '0x774E23c66BA53cFBE1b8C7a5e4dBc01766AE9393',
    quoteAssetSymbol: 'USDC',
    quoteIncrement: '0.000001',
    stepPrice: '0.000001',
    stepSize: '1',
  },
}
