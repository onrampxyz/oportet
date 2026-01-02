import { cx } from 'cva'
import { useMemo, useState } from 'react'
import { getChangePercent } from '~/lib/utils/perps'
import { ValueFormatter } from '~/utils'
import LucideSearch from '~icons/lucide/search'
import type { MarketsProps } from './Perps'

export function Markets(props: Readonly<MarketsProps>) {
  const { markets, onMarketSelect } = props
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
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      <div className="mb-4 flex flex-col gap-2">
        <h3 className="font-semibold">Markets</h3>
        <div className="relative mb-2">
          <LucideSearch className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray10" />
          <input
            className="w-full rounded-md border border-gray5 py-2 pr-3 pl-9 text-xs outline-none focus:border-violet9"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search markets..."
            type="text"
            value={searchQuery}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-gray5 border-b text-left">
              <th className="pb-2 font-normal text-xs">Market</th>
              <th className="pb-2 font-normal text-xs">Price</th>
              <th className="pb-2 font-normal text-xs">24h Change</th>
              <th className="pb-2 font-normal text-xs">24h Volume</th>
            </tr>
          </thead>
          <tbody>
            {filteredMarkets.length === 0 ? (
              <tr>
                <td
                  className="py-8 text-center text-gray10 text-sm"
                  colSpan={4}
                >
                  No markets found
                </td>
              </tr>
            ) : (
              filteredMarkets.map((market) => {
                const changePercent = getChangePercent(
                  market?.mark_price ?? '',
                  market?.change_24h ?? '',
                )

                return (
                  <tr
                    className="cursor-pointer border-gray3 border-b last:border-0 hover:bg-gray2"
                    key={market.product_id}
                    onClick={() => onMarketSelect(market)}
                  >
                    <td className="py-1">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-violet9">
                          <span className="font-semibold text-white text-xs">
                            {market?.product_id?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-xs">
                            {market.product_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-1 font-medium text-xs">
                      ${ValueFormatter.formatWithSuffix(market.mark_price)}
                    </td>
                    <td className="py-1">
                      <p
                        className={cx(
                          'flex items-center gap-2 font-medium text-xs',
                          Number(market?.change_24h) > 0
                            ? 'text-green-600'
                            : 'text-red-600',
                        )}
                      >
                        {Number(market.change_24h) > 0 ? '+' : ''}
                        {ValueFormatter.formatWithSuffix(market?.change_24h)}{' '}
                        <span className="text-[10px]">
                          ({ValueFormatter.formatWithSuffix(changePercent)}%)
                        </span>
                      </p>
                    </td>
                    <td className="py-1 text-xs">
                      $
                      {ValueFormatter.formatWithSuffix(market.quote_volume_24h)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
