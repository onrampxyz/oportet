import { cx } from 'cva'
import { ValueFormatter } from '~/utils'
import LucideSearch from '~icons/lucide/search'
import type { MarketsProps } from './Perps'

export function Markets(props: Readonly<MarketsProps>) {
  const { markets, onMarketSelect } = props

  return (
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      <div className="mb-4 flex flex-col gap-2">
        <h3 className="font-semibold">Markets</h3>
        <div className="relative mb-2">
          <LucideSearch className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-gray10" />
          <input
            className="w-full rounded-md border border-gray5 py-2 pr-3 pl-9 text-xs outline-none focus:border-violet9"
            placeholder="Search markets..."
            type="text"
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
            {markets.map((market) => (
              <tr
                className="cursor-pointer border-gray3 border-b last:border-0 hover:bg-gray2"
                key={market.productId}
                onClick={() => onMarketSelect(market)}
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-violet9">
                      <span className="font-semibold text-white text-xs">
                        {market.productId.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {market.productId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 font-medium text-sm">
                  ${ValueFormatter.formatDollar(market.mark_price)}
                </td>
                <td className="py-3">
                  <span
                    className={cx(
                      'font-medium text-sm',
                      Number(market?.change_24h) > 0
                        ? 'text-green-600'
                        : 'text-red-600',
                    )}
                  >
                    {market.change_24h}
                  </span>
                </td>
                <td className="py-3 text-sm">
                  ${ValueFormatter.formatDollar(market.quote_volume_24h)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
