'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { format, parseISO, startOfWeek } from 'date-fns'
import { useUnits } from '@/store/units'

interface Props {
  series: { date: string; weight_kg: number }[]
}

export function WeeklyBarChart({ series }: Props) {
  const { unit } = useUnits()
  const multiplier = unit === 'lb' ? 2.20462 : 1

  // Group into ISO weeks (Monday start), compute net change per week
  const weekMap = new Map<string, number[]>()
  for (const e of series) {
    const monday = format(
      startOfWeek(parseISO(e.date), { weekStartsOn: 1 }),
      'yyyy-MM-dd'
    )
    const w = weekMap.get(monday) ?? []
    w.push(e.weight_kg)
    weekMap.set(monday, w)
  }

  const weekData = Array.from(weekMap.entries())
    .filter(([, ws]) => ws.length >= 2)
    .map(([week, ws]) => ({
      week: format(parseISO(week), 'MMM d'),
      change:
        Math.round((ws[ws.length - 1] - ws[0]) * multiplier * 100) / 100,
    }))
    .slice(-12) // last 12 weeks

  if (weekData.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted text-sm">
        Not enough data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={weekData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <XAxis
          dataKey="week"
          tick={{ fill: '#71717A', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: '#71717A', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}`}
        />
        <Tooltip
          contentStyle={{
            background: '#18181B',
            border: '1px solid #27272A',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#FAFAFA',
          }}
          formatter={(v) => {
            const num = typeof v === 'number' ? v : 0
            return [`${num > 0 ? '+' : ''}${num} ${unit}`, 'Change'] as [string, string]
          }}
        />
        <Bar dataKey="change" radius={[4, 4, 0, 0]}>
          {weekData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.change <= 0 ? '#10B981' : '#F59E0B'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
