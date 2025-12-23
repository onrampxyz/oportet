import { cx } from 'cva'
import { useEffect, useRef, useState } from 'react'
import { MarketsData, OrderbookData } from '~/mock/perps'
import LucideChevronDown from '~icons/lucide/chevron-down'
import type { Market } from './Markets'
import { Markets } from './Markets'
import { OrderBook } from './OrderBook'
import { Positions } from './Positions'
import { PriceChart } from './PriceChart'
import { TradingForm } from './TradingForm'

export function Perps() {
  const [selectedMarket, setSelectedMarket] = useState(MarketsData[0])
  const [orderType, setOrderType] = useState<'long' | 'short'>('long')
  const [activeTimeframe, setActiveTimeframe] = useState('1D')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market)
    setIsDropdownOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Market Header */}
      <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
        <div className="flex flex-col flex-wrap items-start gap-4">
          {/* Market Selector */}
          <div className="relative flex items-center gap-2" ref={dropdownRef}>
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600">
              <span className="font-semibold text-sm text-white">
                {selectedMarket?.symbol.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">
                  {selectedMarket?.symbol}
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
                {selectedMarket?.name}
                <span
                  className={cx(
                    'ml-2',
                    selectedMarket?.isPositive
                      ? 'text-green-600'
                      : 'text-red-600',
                  )}
                >
                  {selectedMarket?.change}
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
                  {MarketsData.map((market) => (
                    <button
                      className={cx(
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray2',
                        selectedMarket?.symbol === market.symbol &&
                          'bg-gray3 dark:bg-gray4',
                      )}
                      key={market.symbol}
                      onClick={() => handleMarketSelect(market)}
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-violet9">
                          <span className="font-semibold text-white text-xs">
                            {market.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{market.symbol}</div>
                          <div className="text-gray10 text-xs">
                            {market.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${market.price}</div>
                        <div
                          className={cx(
                            'text-xs',
                            market.isPositive
                              ? 'text-green-600'
                              : 'text-red-600',
                          )}
                        >
                          {market.change}
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
              <p className="font-semibold text-lg">${selectedMarket?.price}</p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h Volume</p>
              <p className="font-semibold text-lg">${selectedMarket?.volume}</p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h High</p>
              <p className="font-semibold text-lg">${selectedMarket?.high}</p>
            </div>
            <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
              <p className="text-gray10 text-xs">24h Low</p>
              <p className="font-semibold text-lg">${selectedMarket?.low}</p>
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
          <Markets markets={MarketsData} onMarketSelect={setSelectedMarket} />
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
