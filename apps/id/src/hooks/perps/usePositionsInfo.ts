import { useMemo } from 'react'
import { formatEther, formatUnits } from 'viem'
import { ValueFormatter } from '~/utils'
import { useOpenPositions } from '../api/usePositions'
import type { MarketInfo } from './useMaketInfo'

export type PositionInfo = {
  entryPrice: string
  isPositive: boolean
  leverage: string
  market?: string
  marketId: string
  markPrice: string
  pnl: string
  pnlPercent: string
  quoteSymbol?: string
  rawSide: 'BUY' | 'SELL'
  side: 'LONG' | 'SHORT'
  size: string
}

export type UsePositionsInfoParams = {
  markets: MarketInfo[]
  enabled?: boolean
}

/**
 * Hook to fetch and process position information with PnL calculations
 *
 * @example
 * ```tsx
 * const { positions, isLoading, error } = usePositionsInfo({
 *   address: '0x123...',
 *   enabled: true
 * })
 * ```
 */
export function usePositionsInfo(params?: UsePositionsInfoParams) {
  const markets = params?.markets || []

  // const { address } = useAccount()
  // testdata
  // 0x6a691f9e1F3eFEcBa7D73B3b6b6adc58a5839247

  const { data } = useOpenPositions({
    address: '0x6a691f9e1F3eFEcBa7D73B3b6b6adc58a5839247',
  })

  const positionsData = data?.data?.positions || []

  const positions = useMemo(() => {
    if (!positionsData || positionsData.length === 0) return []

    return positionsData
      .filter((pos) => {
        return pos.size !== '0'
      })
      .map((pos) => {
        const sizeInEther = formatEther(BigInt(pos.size))

        const avgEntryPrice =
          pos.avg_entry_price === '0'
            ? '0.00'
            : formatUnits(BigInt(pos.avg_entry_price), 18)

        const market = markets.find((m) => m.market_id === pos.market_id)

        // Calculate PnL
        let pnl = '0.00'
        let pnlPercent = '0.00'
        let isPositive = false

        if (market?.mark_price && pos.avg_entry_price !== '0') {
          const markPrice = Number(market.mark_price)
          const entryPrice = Number(
            formatUnits(BigInt(pos.avg_entry_price), 18),
          )
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
          const pnlPercentValue =
            initialValue === 0 ? 0 : (pnlValue / initialValue) * 100

          pnl = Math.abs(pnlValue).toFixed(2)
          pnlPercent = Math.abs(pnlPercentValue).toFixed(2)
        }

        return {
          entryPrice: ValueFormatter.formatWithSuffix(avgEntryPrice) ?? '-',
          isPositive,
          leverage: pos.leverage === '0' ? '-' : pos.leverage,
          market: market?.product_id,
          marketId: pos.market_id,
          markPrice:
            ValueFormatter.formatWithSuffix(market?.mark_price) ?? '0.00',
          pnl: ValueFormatter.formatWithSuffix(pnl) ?? '-',
          pnlPercent,
          quoteSymbol: market?.base_asset,
          rawSide: pos.side,
          side: pos.side === 'BUY' ? 'LONG' : 'SHORT',
          size: sizeInEther,
        } as PositionInfo
      })
  }, [markets, positionsData])

  return {
    positions,
  }
}
