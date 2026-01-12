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
import { useTradingView } from '~/hooks/perps/useTradingView'

export type PriceChartProps = {
  activeTimeframe: string
  marketId?: string
  onTimeframeChange: (timeframe: string) => void
}

export function PriceChart(props: Readonly<PriceChartProps>) {
  const { activeTimeframe, marketId = '1', onTimeframeChange } = props

  const timeframes = ['1M', '1H', '1D', '1W']
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const { candleData, isLoading, isError, error } = useTradingView({
    market_id: marketId,
  })

  // Transform API data to candlestick format
  const chartData = useMemo<CandlestickData[]>(() => {
    if (!candleData || candleData.length === 0) {
      console.log('No candle data available')
      return []
    }

    console.log('Transforming candle data, length:', candleData.length)

    const transformed = candleData.map((candle) => {
      const time = Number.parseInt(candle.time, 10) / 1000000000

      return {
        close: Number.parseFloat(candle.close),
        high: Number.parseFloat(candle.high),
        low: Number.parseFloat(candle.low),
        open: Number.parseFloat(candle.open),
        // Convert nanoseconds to seconds for lightweight-charts
        time: time as Time,
      }
    })

    console.log('Transformed data sample:', transformed[0])
    return transformed
  }, [candleData])

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
    console.log('Data update effect triggered')
    console.log('seriesRef.current:', seriesRef.current)
    console.log('chartData.length:', chartData.length)

    if (!seriesRef.current) {
      console.log('Series ref not available')
      return
    }

    if (chartData.length === 0) {
      console.log('No chart data to display')
      return
    }

    console.log('Setting data to series:', chartData.length, 'candles')
    try {
      seriesRef.current.setData(chartData)
      console.log('Data set successfully')

      // Fit content to show all data
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
        console.log('Fit content applied')
      }
    } catch (err) {
      console.error('Error setting chart data:', err)
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

      {isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <span className="text-gray9">Loading chart...</span>
        </div>
      ) : isError ? (
        <div className="flex h-64 w-full flex-col items-center justify-center gap-2">
          <span className="text-red9">Error loading chart data</span>
          <span className="text-gray9 text-xs">
            {error?.message || 'Unknown error'}
          </span>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 w-full items-center justify-center">
          <span className="text-gray9">No chart data available</span>
        </div>
      ) : (
        <div className="h-64 w-full" ref={chartContainerRef} />
      )}
    </div>
  )
}
