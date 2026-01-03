import { useEffect, useState } from 'react'
import { type FilteredMarket, useFilteredMarkets, useMarkets } from '~/hooks'
import { MarketSummary } from './MarketSummary'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { Positions } from './Positions'
import { PriceChart } from './PriceChart'
import { TradingForm } from './TradingForm'

export type MarketsProps = {
  markets: FilteredMarket[]
  onMarketSelect: (market: FilteredMarket) => void
}

export function Perps() {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [selectedMarket, setSelectedMarket] = useState<FilteredMarket | null>()

  const { data: markets } = useMarkets()

  const filteredMarkets = useFilteredMarkets(markets?.data.markets ?? [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Avoid unnecessary re-render
  useEffect(() => {
    if (markets && markets?.data.markets?.length !== 0) {
      setSelectedMarket(filteredMarkets[0])
    }
  }, [markets])

  return (
    <div className="space-y-4">
      {/* Market Summary */}
      {filteredMarkets && selectedMarket && (
        <MarketSummary
          markets={filteredMarkets}
          onMarketSelect={setSelectedMarket}
          selectedMarket={selectedMarket}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-4">
          <PriceChart
            activeTimeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
          />
          <Positions />
          {filteredMarkets && (
            <Markets
              markets={filteredMarkets}
              onMarketSelect={setSelectedMarket}
            />
          )}
        </div>

        {/* Right Column - Order Book & Trading Form */}
        <div className="space-y-4">
          <OrderBook selectedMarket={selectedMarket} />
          <TradingForm onOrderTypeChange={setOrderType} orderType={orderType} />
        </div>
      </div>
    </div>
  )
}
