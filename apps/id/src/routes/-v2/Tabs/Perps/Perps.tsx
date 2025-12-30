import { useEffect, useMemo, useState } from 'react'
import { useMarkets } from '~/hooks'
import { OrderbookData } from '~/mock/perps'
import type { Market } from '~/types/api/trade'
import { MarketSummary } from './MarketSummary'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { Positions } from './Positions'
import { PriceChart } from './PriceChart'
import { TradingForm } from './TradingForm'

export function Perps() {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')

  const { data: markets } = useMarkets()

  const marketList = useMemo(() => {
    return markets?.data.markets
  }, [markets])
  console.log('marketList:: ', marketList)

  const [selectedMarket, setSelectedMarket] = useState<Market | null>()

  useEffect(() => {
    if (marketList && marketList?.length !== 0) {
      setSelectedMarket(marketList[0])
    }
  }, [marketList])

  return (
    <div className="space-y-4">
      {/* Market Summary */}
      {marketList && selectedMarket && (
        <MarketSummary
          markets={marketList}
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
          {marketList && (
            <Markets markets={marketList} onMarketSelect={setSelectedMarket} />
          )}
        </div>

        {/* Right Column - Order Book & Trading Form */}
        <div className="space-y-4">
          <OrderBook orders={OrderbookData} />
          <TradingForm onOrderTypeChange={setOrderType} orderType={orderType} />
        </div>
      </div>
    </div>
  )
}
