'use client'

import { cx } from 'cva'
import type {
  CandlestickData,
  IChartApi,
  ISeriesApi,
  Time,
} from 'lightweight-charts'
import { CandlestickSeries, ColorType, createChart } from 'lightweight-charts'
import { useEffect, useMemo, useRef } from 'react'

export type PriceChartProps = {
  activeTimeframe: string
  onTimeframeChange: (timeframe: string) => void
}

// Generate mock candlestick data based on timeframe
function generateMockData(timeframe: string): CandlestickData[] {
  const basePrice = 98245
  const dataPoints: CandlestickData[] = []
  let intervals = 24
  let baseTime = Math.floor(Date.now() / 1000)
  let timeInterval = 3600 // 1 hour in seconds

  switch (timeframe) {
    case '1H':
      intervals = 60
      timeInterval = 60 // 1 minute
      break
    case '4H':
      intervals = 24
      timeInterval = 3600 * 4 // 4 hours
      break
    case '1D':
      intervals = 24
      timeInterval = 3600 // 1 hour
      break
    case '1W':
      intervals = 7
      timeInterval = 86400 // 1 day
      break
  }

  // Start from intervals ago
  baseTime -= intervals * timeInterval

  let currentPrice = basePrice

  for (let i = 0; i < intervals; i++) {
    const time = (baseTime + i * timeInterval) as Time

    // Generate realistic OHLC data
    const open = currentPrice
    const variance = (Math.random() - 0.5) * 500
    const trend = (i / intervals) * 1500 // Slight upward trend
    const high = open + Math.abs(variance) + Math.random() * 200
    const low = open - Math.abs(variance) - Math.random() * 200
    const close = open + variance + trend / intervals

    dataPoints.push({
      close,
      high,
      low,
      open,
      time,
    })

    currentPrice = close
  }

  return dataPoints
}

export function PriceChart(props: Readonly<PriceChartProps>) {
  const { activeTimeframe, onTimeframeChange } = props

  const timeframes = ['1H', '4H', '1D', '1W']
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const chartData = useMemo(
    () => generateMockData(activeTimeframe),
    [activeTimeframe],
  )

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      crosshair: {
        horzLine: {
          color: '#9ca3af',
          labelBackgroundColor: '#6b7280',
          visible: true,
          width: 1,
        },
        mode: 1,
        vertLine: {
          color: '#9ca3af',
          labelBackgroundColor: '#6b7280',
          visible: true,
          width: 1,
        },
      },
      grid: {
        horzLines: {
          color: '#1f2227ff',
          visible: true,
        },
        vertLines: {
          color: '#1f2227ff',
          visible: true,
        },
      },
      layout: {
        background: {
          color: 'transparent',
          type: ColorType.Solid,
        },
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: 12,
        textColor: '#9ca3af',
      },
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
        borderVisible: true,
        visible: true,
      },
      timeScale: {
        borderColor: '#374151',
        borderVisible: true,
        timeVisible: true,
      },
    })

    // Add candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      downColor: '#ef4444',
      upColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    })

    chartRef.current = chart
    seriesRef.current = candlestickSeries

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          height: chartContainerRef.current.clientHeight,
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [])

  // Update chart data when it changes
  useEffect(() => {
    if (!seriesRef.current) return

    seriesRef.current.setData(chartData)

    // Fit content to show all data
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }
  }, [chartData])

  return (
    <div className="rounded-lg border border-gray5 bg-white p-4 dark:bg-gray1">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">Price Chart</h3>
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              className={cx(
                'rounded px-3 py-1 text-xs transition-colors',
                activeTimeframe === tf
                  ? 'bg-violet9 text-white'
                  : 'text-gray10 hover:bg-gray3',
              )}
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              type="button"
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full" ref={chartContainerRef} />
    </div>
  )
}
