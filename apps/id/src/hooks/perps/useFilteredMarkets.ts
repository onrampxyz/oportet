import { useMemo } from 'react'
import { MARKETS_CONFIG } from '~/constants/order'
import type { Market } from '~/types/market'

export function useFilteredMarkets(markets: Market[]) {
  const supportedMarkets = Object.values(MARKETS_CONFIG)

  const filteredMarkets = useMemo(() => {
    return markets
      .filter((market) => {
        return supportedMarkets.some(
          (supported) => supported.name === market.display_name,
        )
      })
      .map((market) => {
        const supported = supportedMarkets.find(
          (supported) => supported.name === market.display_name,
        )

        return {
          ...market,
          base_asset: supported?.baseAssetSymbol,
          product_id: supported?.productId,
        }
      })
  }, [markets, supportedMarkets])

  return filteredMarkets
}

export type FilteredMarket = Market & {
  product_id?: string
  base_asset?: string
}
