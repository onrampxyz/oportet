import { cx } from 'cva'
import { PositionsData } from '~/mock/perps'
import LucideX from '~icons/lucide/x'

export type Position = {
  market: string
  side: 'LONG' | 'SHORT'
  size: string
  entry: string
  mark: string
  leverage: string
  pnl: string
  pnlPercent: string
  isPositive: boolean
  name: string
}

export function Positions() {
  return (
    <div className="rounded-lg border border-gray5 bg-white p-5 dark:bg-gray1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Positions</h3>
        <button className="text-gray10 text-xs hover:text-gray12" type="button">
          Close All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-gray5 border-b text-left">
              <th className="pb-2 font-normal text-xs">Market</th>
              <th className="pb-2 font-normal text-xs">Side</th>
              <th className="pb-2 font-normal text-xs">Size</th>
              <th className="pb-2 font-normal text-xs">Entry</th>
              <th className="pb-2 font-normal text-xs">Mark</th>
              <th className="pb-2 font-normal text-xs">Leverage</th>
              <th className="pb-2 font-normal text-xs">PnL</th>
              <th className="pb-2 text-right text-xs" />
            </tr>
          </thead>
          <tbody>
            {PositionsData.map((position) => (
              <tr
                className="border-gray3 border-b last:border-0"
                key={position.market}
              >
                <td className="py-3 text-sm">{position.market}</td>
                <td className="py-3">
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
                <td className="py-3 text-sm">{position.size}</td>
                <td className="py-3 text-sm">{position.entry}</td>
                <td className="py-3 text-sm">{position.mark}</td>
                <td className="py-3 text-sm">{position.leverage}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center gap-2">
                    <span
                      className={cx(
                        'font-medium text-sm',
                        position.isPositive ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      {position.pnl}
                    </span>
                    <span
                      className={cx(
                        'pb-0.5 text-xs',
                        position.isPositive ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      ({position.pnlPercent}%)
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button
                    className="text-gray10 hover:text-gray12"
                    type="button"
                  >
                    <LucideX className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
