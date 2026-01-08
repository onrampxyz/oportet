import { cx } from 'cva'
import { type MarketInfo, usePositionsInfo } from '~/hooks'
import LucideX from '~icons/lucide/x'

export type PositionsTableProps = {
  markets: MarketInfo[]
}

export function PositionsTable({ markets }: Readonly<PositionsTableProps>) {
  const { positions } = usePositionsInfo({
    markets,
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-gray5 border-b text-left">
            <th className="pb-2 font-normal text-xs">Market</th>
            <th className="pb-2 font-normal text-xs">Side</th>
            <th className="pb-2 font-normal text-xs">Size</th>
            <th className="pb-2 font-normal text-xs">Avg. Entry Price</th>
            <th className="pb-2 font-normal text-xs">Mark Price</th>
            <th className="pb-2 font-normal text-xs">Leverage</th>
            <th className="pb-2 font-normal text-xs">Est. PnL</th>
            <th className="pb-2 text-right text-xs" />
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td className="pt-4 text-center text-gray10 text-xs" colSpan={8}>
                No open positions
              </td>
            </tr>
          ) : (
            positions.map((position, index) => (
              <tr
                className="border-gray3 border-b"
                key={`${position.market}-${index}`}
              >
                <td className="py-1 text-xs">{position.market}</td>
                <td className="py-1">
                  <span
                    className={cx(
                      'rounded px-2 py-0.5 text-xs',
                      position.side === 'LONG'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}
                  >
                    {position.side}
                  </span>
                </td>
                <td className="py-1 text-xs">
                  {position.size} {position.quoteSymbol}
                </td>
                <td className="py-1 text-xs">
                  {position.entryPrice === '0.00'
                    ? '-'
                    : `$${position.entryPrice}`}
                </td>
                <td className="py-1 text-xs">${position.markPrice}</td>
                <td className="py-1 text-xs">{position.leverage}</td>
                <td className="py-1 text-right">
                  <div className="flex flex-col items-start gap-1">
                    <span
                      className={cx(
                        'font-medium text-xs',
                        position.isPositive ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      ${position.pnl}
                    </span>
                    <span
                      className={cx(
                        'pb-0.5 text-[10px]',
                        position.isPositive ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      ({position.pnlPercent}%)
                    </span>
                  </div>
                </td>
                <td className="py-1 text-right">
                  <button
                    className="text-gray10 hover:text-gray12"
                    type="button"
                  >
                    <LucideX className="size-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
