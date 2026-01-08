import { useEffect, useState } from 'react'
import { type MarketInfo, useMarkets, useMarketsInfo } from '~/hooks'
import { MarketSummary } from './MarketSummary'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { PriceChart } from './PriceChart'
import { TradeDisplay } from './TradeDisplay'
import { TradingForm } from './TradingForm'

export type MarketsProps = {
  markets: MarketInfo[]
  onMarketSelect: (market: MarketInfo) => void
}

export function Perps() {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo | null>()

  const { data: marketsData } = useMarkets()

  const markets = useMarketsInfo(marketsData?.data.markets ?? [])

  console.log('markets:: ', markets)

  // biome-ignore lint/correctness/useExhaustiveDependencies: avoid unnecesasry re-renders
  useEffect(() => {
    if (marketsData && marketsData.data.markets.length > 0) {
      setSelectedMarket(markets[0])
    }
  }, [marketsData])

  return (
    <div className="space-y-4">
      {/* Market Summary */}
      {markets && selectedMarket && (
        <MarketSummary
          markets={markets}
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

          {markets && (
            <>
              <TradeDisplay markets={markets} />
              <Markets markets={markets} onMarketSelect={setSelectedMarket} />
            </>
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
