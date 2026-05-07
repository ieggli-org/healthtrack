'use client'
import { differenceInDays, parseISO, format } from 'date-fns'
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useUnits } from '@/store/units'
import { displayWeight } from '@/lib/utils'

interface BandPoint {
  date: string
  lower: number
  upper: number
  predicted: number
}

interface Ma7Point {
  date: string
  value: number
}

interface ProjectionViewProps {
  stats: {
    projection: {
      goalDate: string | null
      daysUntilGoal: number | null
      r2: number
      band: BandPoint[]
    } | null
    ma7: Ma7Point[]
    weeklyDigest: { percentOfGoal: number | null }
    rateOfChange: { perWeek: number }
  }
  goal: {
    goal_weight_kg: number
    start_weight_kg: number
    target_date: string | null
  }
}

interface ChartPoint {
  date: string
  actual?: number
  band_lower?: number
  band_upper?: number
}

export function ProjectionView({ stats, goal }: ProjectionViewProps) {
  const { unit } = useUnits()
  const { projection, ma7, weeklyDigest } = stats

  // Build chart data: last 30 ma7 points + first 60 band points
  const ma7Data: ChartPoint[] = ma7.slice(-30).map((p) => ({
    date: p.date,
    actual: displayWeight(p.value, unit),
    band_lower: undefined,
    band_upper: undefined,
  }))

  const bandData: ChartPoint[] = (projection?.band.slice(0, 60) ?? []).map((p) => ({
    date: p.date,
    actual: undefined,
    band_lower: displayWeight(p.lower, unit),
    band_upper: displayWeight(p.upper, unit),
  }))

  const chartData: ChartPoint[] = [...ma7Data, ...bandData]

  // Required pace calculation
  let requiredPace: string | null = null
  if (goal.target_date && ma7.length > 0) {
    const currentWeight = ma7[ma7.length - 1].value
    const weeksRemaining = differenceInDays(parseISO(goal.target_date), new Date()) / 7
    if (weeksRemaining > 0) {
      const kgPerWeek = (currentWeight - goal.goal_weight_kg) / weeksRemaining
      const displayKgPerWeek = displayWeight(Math.abs(kgPerWeek), unit)
      requiredPace = `${displayKgPerWeek} ${unit}/week`
    }
  }

  const percent = weeklyDigest.percentOfGoal

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">At current pace</p>
          <p className="font-fraunces text-xl text-heading">
            {projection?.goalDate ? format(parseISO(projection.goalDate), 'MMM d, yyyy') : '—'}
          </p>
          {projection?.daysUntilGoal != null && (
            <p className="text-xs text-muted mt-1">{projection.daysUntilGoal} days away</p>
          )}
          {!projection?.goalDate && (
            <p className="text-xs text-muted mt-1">not enough data</p>
          )}
        </div>

        {requiredPace && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Required pace</p>
            <p className="font-fraunces text-xl text-heading">{requiredPace}</p>
            <p className="text-xs text-muted mt-1">to hit target date</p>
          </div>
        )}

        {percent !== null && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Progress</p>
            <p className="font-fraunces text-xl text-heading">{percent}%</p>
            <p className="text-xs text-muted mt-1">of the way there</p>
          </div>
        )}
      </div>

      {/* Mini projection chart */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--muted-text)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickFormatter={(d: string) => format(parseISO(d), 'MMM d')}
            />
            <YAxis
              tick={{ fill: 'var(--muted-text)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            />
            <Area dataKey="band_upper" fill="var(--primary)" fillOpacity={0.1} stroke="none" />
            <Area dataKey="band_lower" fill="var(--bg)" stroke="none" />
            <Line dataKey="actual" stroke="var(--primary)" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
