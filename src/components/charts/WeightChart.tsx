'use client'

import {
  ComposedChart,
  Line,
  Scatter,
  Area,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
} from 'recharts'
import { useState, useMemo } from 'react'
import { useUnits } from '@/store/units'
import { displayWeight } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface StatsData {
  series: { date: string; weight_kg: number }[]
  ma7: { date: string; value: number }[]
  ma14: { date: string; value: number }[]
  ma30: { date: string; value: number }[]
  projection: {
    goalDate: string | null
    band: { date: string; lower: number; upper: number; predicted: number }[]
  } | null
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number; name: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const raw = payload.find((p) => p.dataKey === 'raw')
  const ma7 = payload.find((p) => p.dataKey === 'ma7')
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        border: '1px solid #27272A',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
      }}
    >
      <p style={{ color: 'var(--muted-text)', marginBottom: '4px' }}>{label}</p>
      {raw?.value !== undefined && (
        <p style={{ color: 'var(--heading)' }}>
          Weight: {raw.value}
        </p>
      )}
      {ma7?.value !== undefined && (
        <p style={{ color: '#6366F1' }}>MA7: {ma7.value}</p>
      )}
    </div>
  )
}

const LEGEND_ITEMS = [
  { label: 'Raw entries', key: 'raw', color: '#71717A', toggleable: false },
  { label: 'MA7', key: 'ma7', color: '#6366F1', toggleable: false },
  { label: 'MA14', key: 'ma14', color: '#9CA3AF', toggleable: true },
  { label: 'MA30', key: 'ma30', color: '#4B5563', toggleable: true },
]

interface CustomLegendProps {
  hiddenLines: Set<string>
  toggleLine: (key: string) => void
}

function CustomLegend({ hiddenLines, toggleLine }: CustomLegendProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        fontSize: '12px',
        paddingTop: '8px',
        justifyContent: 'center',
      }}
    >
      {LEGEND_ITEMS.map((item) => {
        const isHidden = hiddenLines.has(item.key)
        return (
          <button
            key={item.key}
            onClick={() => item.toggleable && toggleLine(item.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: item.toggleable ? 'pointer' : 'default',
              color: isHidden ? '#71717A' : 'var(--body)',
              textDecoration: isHidden ? 'line-through' : 'none',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '3px',
                borderRadius: '2px',
                background: item.color,
                opacity: isHidden ? 0.4 : 1,
              }}
            />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

interface WeightChartProps {
  stats: StatsData
  goalWeight?: number
}

export function WeightChart({ stats, goalWeight }: WeightChartProps) {
  const { unit } = useUnits()
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(
    new Set(['ma14', 'ma30'])
  )

  // Merge all dates into a unified dataset for the chart
  // Only include up to 60 projection band days to avoid overwhelming the chart
  const chartData = useMemo(() => {
    const projectionBand = stats.projection?.band.slice(0, 60) ?? []

    const allDates = new Set([
      ...stats.series.map((p) => p.date),
      ...stats.ma7.map((p) => p.date),
      ...projectionBand.map((p) => p.date),
    ])

    return Array.from(allDates)
      .sort()
      .map((date) => {
        const rawEntry = stats.series.find((p) => p.date === date)
        const ma7Entry = stats.ma7.find((p) => p.date === date)
        const ma14Entry = stats.ma14?.find((p) => p.date === date)
        const ma30Entry = stats.ma30?.find((p) => p.date === date)
        const bandEntry = projectionBand.find((p) => p.date === date)
        return {
          date,
          raw: rawEntry ? displayWeight(rawEntry.weight_kg, unit) : undefined,
          ma7: ma7Entry ? displayWeight(ma7Entry.value, unit) : undefined,
          ma14: ma14Entry ? displayWeight(ma14Entry.value, unit) : undefined,
          ma30: ma30Entry ? displayWeight(ma30Entry.value, unit) : undefined,
          bandLower: bandEntry ? displayWeight(bandEntry.lower, unit) : undefined,
          bandUpper: bandEntry ? displayWeight(bandEntry.upper, unit) : undefined,
        }
      })
  }, [stats, unit])

  const toggleLine = (key: string) => {
    setHiddenLines((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <div className="overflow-x-auto">
    <ResponsiveContainer width="100%" minWidth={500} height={320}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid
          stroke="#27272A"
          strokeDasharray="3 3"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: '#71717A', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(d: string) => {
            try {
              return format(parseISO(d), 'MMM d')
            } catch {
              return d
            }
          }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#71717A', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
          width={48}
          unit={` ${unit}`}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Projection confidence band */}
        {stats.projection && (
          <>
            <Area
              dataKey="bandUpper"
              fill="#6366F1"
              fillOpacity={0.08}
              stroke="none"
              name="Projection upper"
              legendType="none"
            />
            <Area
              dataKey="bandLower"
              fill="#0A0A0B"
              stroke="none"
              name="Projection lower"
              legendType="none"
            />
          </>
        )}

        {/* MA30 — toggleable */}
        {!hiddenLines.has('ma30') && (
          <Line
            dataKey="ma30"
            stroke="#4B5563"
            dot={false}
            strokeWidth={1.5}
            strokeDasharray="4 2"
            name="MA30"
            legendType="line"
          />
        )}

        {/* MA14 — toggleable */}
        {!hiddenLines.has('ma14') && (
          <Line
            dataKey="ma14"
            stroke="#9CA3AF"
            dot={false}
            strokeWidth={1.5}
            name="MA14"
            legendType="line"
          />
        )}

        {/* MA7 — always visible */}
        <Line
          dataKey="ma7"
          stroke="#6366F1"
          dot={false}
          strokeWidth={2}
          name="MA7"
          legendType="line"
        />

        {/* Goal weight reference line */}
        {goalWeight !== undefined && (
          <ReferenceLine
            y={goalWeight}
            stroke="var(--success)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: 'Goal', fill: 'var(--success)', fontSize: 11, position: 'insideTopRight' }}
          />
        )}

        {/* Raw weight scatter */}
        <Scatter
          dataKey="raw"
          fill="#71717A"
          opacity={0.5}
          name="Raw entries"
          legendType="circle"
        />

        <Brush
          dataKey="date"
          height={20}
          stroke="#27272A"
          fill="#18181B"
          travellerWidth={6}
          tickFormatter={(d: string) => {
            try {
              return format(parseISO(d), 'MMM d')
            } catch {
              return d
            }
          }}
        />

        <Legend content={<CustomLegend hiddenLines={hiddenLines} toggleLine={toggleLine} />} />
      </ComposedChart>
    </ResponsiveContainer>
    </div>
  )
}
