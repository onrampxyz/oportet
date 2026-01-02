import { useMemo } from 'react'
import { MARKETS_CONFIG } from '~/constants/order'
import type { Market } from '~/types/market'

export function useFilteredMarkets(markets: Market[]) {
  const supportedMarkets = Object.values(MARKETS_CONFIG)

  console.log('supportedMarkets:: ', supportedMarkets)

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
          productId: supported?.productId ?? '',
        }
      })
  }, [markets, supportedMarkets])

  console.log('filteredMarkets:: ', filteredMarkets)

  return filteredMarkets
}

export type FilteredMarket = Market & {
  productId: string
}
