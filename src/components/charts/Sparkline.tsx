'use client'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface SparklineProps {
  data: number[]
  color?: string
  height?: number
}

export function Sparkline({ data, color = 'var(--primary)', height = 32 }: SparklineProps) {
  if (data.length < 2) return <div style={{ height }} />
  const chartData = data.map(v => ({ v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} dot={false} strokeWidth={1.5} />
      </LineChart>
    </ResponsiveContainer>
  )
}
