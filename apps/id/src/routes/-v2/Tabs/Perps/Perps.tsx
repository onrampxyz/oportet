import { cx } from 'cva'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useClickOutside, useMarkets } from '~/hooks'
import { OrderbookData } from '~/mock/perps'
import type { Market } from '~/types/rise'
import LucideChevronDown from '~icons/lucide/chevron-down'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { Positions } from './Positions'
import { PriceChart } from './PriceChart'
import { TradingForm } from './TradingForm'

export function Perps() {
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside([dropdownRef], () => {
    setIsDropdownOpen(false)
  })

  const { data: markets } = useMarkets()

  const marketList = useMemo(() => {
    return markets?.data.markets
  }, [markets])
  console.log('marketList:: ', marketList)

  const [selectedMarket, setSelectedMarket] = useState<Market | null>()

  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market)
    setIsDropdownOpen(false)
  }

  useEffect(() => {
    if (marketList && marketList?.length !== 0) {
      setSelectedMarket(marketList[0])
    }
  }, [marketList])


  return (
    <div className="space-y-4">
      {/* Market Header */}
      <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
        <div className="flex flex-col flex-wrap items-start gap-4">
          {/* Market Selector */}
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="font-semibold text-sm text-white">
                {selectedMarket?.base_asset_symbol.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">
                  {selectedMarket?.base_asset_symbol}
                </h2>
                <button
                  className="text-gray10 hover:text-gray12"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  type="button"
                >
                  <LucideChevronDown
                    className={cx(
                      'size-4 transition-transform',
                      isDropdownOpen && 'rotate-180',
                    )}
                  />
                </button>
              </div>
              <p className="text-gray10 text-xs">
                {selectedMarket?.base_asset_symbol}
                <span
                  className={cx(
                    'ml-2',
                    Number(selectedMarket?.change_24h) > 0
                      ? 'text-green-600'
                      : 'text-red-600',
                  )}
                >
                  {selectedMarket?.change_24h}
                </span>
              </p>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 z-10 mt-2 w-64 rounded-lg border border-gray5 bg-white shadow-lg dark:bg-gray1">
                <div className="p-2">
                  <div className="mb-2 px-2 font-medium text-gray10 text-xs">
                    Select Market
                  </div>
                  {marketList?.map((market) => (
                    <button
                      className={cx(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray2',
                        selectedMarket?.base_asset_symbol ===
                        market.base_asset_symbol && 'bg-gray3 dark:bg-gray4',
                      )}
                      key={market.base_asset_symbol}
                      onClick={() => handleMarketSelect(market)}
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-violet9">
                          <span className="font-semibold text-white text-xs">
                            {market.base_asset_symbol.charAt(0)}
                          </span>
                        </div>
                        <div className="font-medium">
                          {market.base_asset_symbol}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${Number(market.mark_price).toFixed(4)}
                        </div>
                        <div
                          className={cx(
                            'text-xs',
                            Number(market.change_24h) > 0
                              ? 'text-green-600'
                              : 'text-red-600',
                          )}
                        >
                          ${market.change_24h}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Market Stats */}
          <div className="flex w-full flex-wrap gap-2">
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">Mark Price</p>
              <p className="font-semibold text-lg">
                ${selectedMarket?.mark_price}
              </p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h Volume</p>
              <p className="font-semibold text-lg">
                ${selectedMarket?.quote_volume_24h}
              </p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h High</p>
              <p className="font-semibold text-lg">
                ${selectedMarket?.high_24h}
              </p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h Low</p>
              <p className="font-semibold text-lg">
                ${selectedMarket?.low_24h}
              </p>
            </div>
          </div>
        </div>
      </div>

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
