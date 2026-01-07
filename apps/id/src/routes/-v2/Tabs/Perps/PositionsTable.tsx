import { cx } from 'cva'
import { useMemo } from 'react'
import { formatEther, formatUnits } from 'viem'
import { useAccount } from 'wagmi'
import { type FilteredMarket, useOpenPositions } from '~/hooks'
import { ValueFormatter } from '~/utils'
import LucideX from '~icons/lucide/x'

export type Position = {
  market: string
  side: 'LONG' | 'SHORT'
  size: string
  entryPrice: string
  markPrice: string
  leverage: string
  pnl: string
  pnlPercent: string
  isPositive: boolean
  quoteSymbol?: string
}

export type PositionsTableProps = {
  markets: FilteredMarket[]
}

export function PositionsTable(props: Readonly<PositionsTableProps>) {
  const { markets } = props
  const { address } = useAccount()

  // testdata
  // 0x6a691f9e1F3eFEcBa7D73B3b6b6adc58a5839247

  const { data } = useOpenPositions({
    address,
  })

  console.log('data:: ', data)
  console.log('markets:: ', markets)

  const positions = useMemo(() => {
    const positions = data?.data.positions
    if (!positions || positions.length === 0) return []

    return positions.map((pos) => {
      const sizeInEther = formatEther(BigInt(pos.size))

      const avgEntryPrice =
        pos.avg_entry_price === '0'
          ? '0.00'
          : formatUnits(BigInt(pos.avg_entry_price), 6)

      const market = markets.find((m) => m.market_id === pos.market_id)
      console.log('marketConfig:: ', market)

      // Calculate PnL
      let pnl = '0.00'
      let pnlPercent = '0.00'
      let isPositive = false

      if (market?.mark_price && pos.avg_entry_price !== '0') {
        const markPrice = Number(market.mark_price)
        const entryPrice = Number(formatUnits(BigInt(pos.avg_entry_price), 6))
        const positionSize = Number(sizeInEther)

        // PnL calculation:
        // For LONG: (Mark Price - Entry Price) * Size
        // For SHORT: (Entry Price - Mark Price) * Size
        let pnlValue: number
        if (pos.side === 'BUY') {
          pnlValue = (markPrice - entryPrice) * positionSize
        } else {
          pnlValue = (entryPrice - markPrice) * positionSize
        }

        isPositive = pnlValue > 0

        // Calculate PnL percentage: (PnL / Initial Position Value) * 100
        const initialValue = entryPrice * positionSize
        const pnlPercentValue = initialValue === 0 ? 0 : (pnlValue / initialValue) * 100

        pnl = Math.abs(pnlValue).toFixed(2)
        pnlPercent = Math.abs(pnlPercentValue).toFixed(2)
      }

      return {
        entryPrice: avgEntryPrice,
        isPositive,
        leverage: pos.leverage === '0' ? '-' : pos.leverage,
        market: market?.product_id,
        markPrice: ValueFormatter.formatWithSuffix(market?.mark_price) ?? '0.00',
        pnl,
        pnlPercent,
        quoteSymbol: market?.base_asset,
        side: pos.side === 'BUY' ? 'LONG' : 'SHORT',
        size: sizeInEther,
      } as Position
    })
  }, [data, markets])

  console.log('positions:: ', positions)

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
              <td className="py-8 text-center text-gray10 text-xs" colSpan={8}>
                No open positions
              </td>
            </tr>
          ) : (
            positions.map((position, index) => (
              <tr
                className="border-gray3 border-b last:border-0"
                key={`${position.market}-${index}`}
              >
                <td className="py-3 text-xs">{position.market}</td>
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
                <td className="py-3 text-xs">
                  {position.size} {position.quoteSymbol}
                </td>
                <td className="py-3 text-xs">
                  {position.entryPrice === '0.00' ? '-' : `$${position.entryPrice}`}
                </td>
                <td className="py-3 text-xs">${position.markPrice}</td>
                <td className="py-3 text-xs">{position.leverage}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center gap-2">
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
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
