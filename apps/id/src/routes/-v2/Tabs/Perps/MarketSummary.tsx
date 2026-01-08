import { Separator } from '@ariakit/react'
import { cx } from 'cva'
import { useMemo, useState } from 'react'
import { useModal } from '~/contexts/ModalContext'
import type { MarketInfo } from '~/hooks/perps/useMaketInfo'
import { getChangePercent } from '~/lib/utils/perps'
import { ValueFormatter } from '~/utils'
import LucideChevronDown from '~icons/lucide/chevron-down'
import LucideSearch from '~icons/lucide/search'
import type { MarketsProps } from './Perps'

export type MarketSummaryProps = MarketsProps & {
  selectedMarket?: MarketInfo
}

function MarketSelector({
  markets,
  selectedMarket,
  onMarketSelect,
}: Readonly<{
  markets: MarketInfo[]
  selectedMarket?: MarketInfo
  onMarketSelect: (market: MarketInfo) => void
}>) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMarkets = useMemo(() => {
    if (!searchQuery.trim()) return markets

    const query = searchQuery.toLowerCase()
    return markets.filter(
      (market) =>
        market.product_id?.toLowerCase().includes(query) ||
        market.base_asset_symbol.toLowerCase().includes(query) ||
        market.display_name.toLowerCase().includes(query),
    )
  }, [markets, searchQuery])

  return (
    <div className="space-y-3">
      {/* Search Field */}
      <div className="relative">
        <LucideSearch className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray10" />
        <input
          className="w-full rounded-lg border border-gray5 bg-white py-2 pr-4 pl-10 text-sm outline-none transition-colors focus:border-gray8 dark:bg-gray2"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search markets..."
          type="text"
          value={searchQuery}
        />
      </div>

      <div className="my-2 flex items-center justify-between gap-2">
        <p className="ml-2 text-sm">Market</p>
        <p className="mr-6 text-sm">Price</p>
      </div>
      <Separator className="border-gray5" />

      {/* Markets List */}
      <div className="max-h-96 space-y-1 overflow-y-auto">
        {filteredMarkets.length === 0 ? (
          <div className="py-8 text-center text-gray10 text-sm">
            No markets found
          </div>
        ) : (
          filteredMarkets.map((market) => {
            const changePercent = getChangePercent(
              market.mark_price,
              market.change_24h,
            )

            return (
              <button
                className={cx(
                  'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray2',
                  selectedMarket?.product_id === market.product_id &&
                    'bg-gray3 dark:bg-gray4',
                )}
                key={market.product_id}
                onClick={() => onMarketSelect(market)}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <img
                    alt="coin"
                    className="size-6"
                    src={`/icons/crypto/${market.base_asset?.toLowerCase()}.svg`}
                  />
                  <div className="font-medium">{market.product_id}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    ${ValueFormatter.formatWithSuffix(market.mark_price)}
                  </div>
                  <div
                    className={cx(
                      'text-xs',
                      Number(market.change_24h) > 0
                        ? 'text-green-600'
                        : 'text-red-600',
                    )}
                  >
                    {Number(market.change_24h) > 0 ? '+' : ''}
                    {ValueFormatter.formatWithSuffix(changePercent)}%
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export function MarketSummary(props: Readonly<MarketSummaryProps>) {
  const { markets, onMarketSelect, selectedMarket } = props
  const { openModal, closeAllModals } = useModal()

  const changePercent = getChangePercent(
    selectedMarket?.mark_price ?? '',
    selectedMarket?.change_24h ?? '',
  )

  const handleOpenMarketSelector = () => {
    openModal({
      className: 'max-w-lg',
      content: (
        <MarketSelector
          markets={markets}
          onMarketSelect={(market) => {
            onMarketSelect(market)
            closeAllModals()
          }}
          selectedMarket={selectedMarket}
        />
      ),
      description: 'Search and select a market to trade',
      title: 'Select Market',
    })
  }

  return (
    <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
      <div className="flex flex-col flex-wrap items-start gap-4">
        {/* Market Selector */}
        <button
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          onClick={handleOpenMarketSelector}
          type="button"
        >
          <img
            alt="coin"
            className="size-8"
            src={`/icons/crypto/${selectedMarket?.base_asset?.toLowerCase()}.svg`}
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">
                {selectedMarket?.product_id}
              </h2>
              <LucideChevronDown className="size-4 text-gray10" />
            </div>
            <p className="text-gray10 text-xs">
              {selectedMarket?.base_asset}
              <span
                className={cx(
                  'ml-2',
                  Number(selectedMarket?.change_24h) > 0
                    ? 'text-green-600'
                    : 'text-red-600',
                )}
              >
                {ValueFormatter.formatWithSuffix(selectedMarket?.change_24h)} (
                {ValueFormatter.formatWithSuffix(changePercent)}%)
              </span>
            </p>
          </div>
        </button>

        {/* Market Stats */}
        <div className="flex w-full flex-wrap gap-2">
          <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
            <p className="text-gray10 text-xs">Mark Price</p>
            <p className="font-semibold text-lg">
              ${ValueFormatter.formatWithSuffix(selectedMarket?.mark_price)}
            </p>
          </div>
          <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
            <p className="text-gray10 text-xs">24h Volume</p>
            <p className="font-semibold text-lg">
              $
              {ValueFormatter.formatWithSuffix(
                selectedMarket?.quote_volume_24h,
              )}
            </p>
          </div>
          <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
            <p className="text-gray10 text-xs">24h High</p>
            <p className="font-semibold text-lg">
              ${ValueFormatter.formatWithSuffix(selectedMarket?.high_24h)}
            </p>
          </div>
          <div className="flex-1 rounded-md border border-gray5 p-3 text-center">
            <p className="text-gray10 text-xs">24h Low</p>
            <p className="font-semibold text-lg">
              ${ValueFormatter.formatWithSuffix(selectedMarket?.low_24h)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
