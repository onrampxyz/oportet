'use client'

import { cx } from 'cva'
import { useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/Chart'

export type PriceChartProps = {
  activeTimeframe: string
  onTimeframeChange: (timeframe: string) => void
}

// Generate mock price data based on timeframe
function generateMockData(timeframe: string) {
  const basePrice = 98245
  const dataPoints: { time: string; price: number }[] = []
  let intervals = 24
  let timeFormat = (index: number) => `${index}:00`

  switch (timeframe) {
    case '1H':
      intervals = 60
      timeFormat = (index: number) =>
        `${Math.floor(index / 60)}:${String(index % 60).padStart(2, '0')}`
      break
    case '4H':
      intervals = 24
      timeFormat = (index: number) => `${index * 4}h`
      break
    case '1D':
      intervals = 24
      timeFormat = (index: number) => `${index}:00`
      break
    case '1W':
      intervals = 7
      timeFormat = (index: number) =>
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] ?? ''
      break
  }

  for (let i = 0; i < intervals; i++) {
    const variance = (Math.random() - 0.5) * 2000
    const trend = (i / intervals) * 1500 // Slight upward trend
    dataPoints.push({
      price: basePrice + variance + trend,
      time: timeFormat(i),
    })
  }

  return dataPoints
}

export function PriceChart(props: Readonly<PriceChartProps>) {
  const { activeTimeframe, onTimeframeChange } = props

  const timeframes = ['1H', '4H', '1D', '1W']

  const chartData = useMemo(
    () => generateMockData(activeTimeframe),
    [activeTimeframe],
  )

  const chartConfig = {
    price: {
      color: 'hsl(var(--chart-1))',
      label: 'Price',
    },
  }

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

      <ChartContainer className="h-64 w-full" config={chartConfig}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillPrice" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-price)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-price)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="time"
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            domain={['dataMin - 500', 'dataMax + 500']}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            tickLine={false}
            tickMargin={8}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => `$${Number(value).toLocaleString()}`}
                indicator="line"
              />
            }
            cursor={false}
          />
          <Area
            dataKey="price"
            fill="url(#fillPrice)"
            fillOpacity={0.4}
            stroke="var(--color-price)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
