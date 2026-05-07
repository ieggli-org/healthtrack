'use client'

import { useState } from 'react'
import { subDays, subMonths, subYears, format } from 'date-fns'
import { useStats } from '@/hooks/useStats'
import { useGoal } from '@/hooks/useGoals'
import { useUnits } from '@/store/units'
import { displayWeight } from '@/lib/utils'
import { WeightChart } from '@/components/charts/WeightChart'
import { WeeklyBarChart } from '@/components/charts/WeeklyBarChart'
import { ConsistencyHeatmap } from '@/components/charts/ConsistencyHeatmap'
import { StatCards } from './StatCards'
import { EmptyDashboard } from './EmptyDashboard'

const PRESETS = [
  {
    label: '7d',
    getDates: () => ({
      from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '30d',
    getDates: () => ({
      from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '90d',
    getDates: () => ({
      from: format(subDays(new Date(), 90), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '6m',
    getDates: () => ({
      from: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: '1y',
    getDates: () => ({
      from: format(subYears(new Date(), 1), 'yyyy-MM-dd'),
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
  {
    label: 'All',
    getDates: () => ({
      from: '2020-01-01',
      to: format(new Date(), 'yyyy-MM-dd'),
    }),
  },
] as const

type PresetLabel = (typeof PRESETS)[number]['label']

export function DashboardPageClient() {
  const [activePreset, setActivePreset] = useState<PresetLabel>('90d')
  const [dateRange, setDateRange] = useState(PRESETS[2].getDates())

  const { data: stats, isLoading } = useStats(dateRange.from, dateRange.to)
  const { data: goalData, isLoading: goalsIsLoading } = useGoal()
  const { unit } = useUnits()

  const goalWeightKg = (goalData?.goal as { goal_weight_kg?: number } | null)?.goal_weight_kg
  const goalWeight = goalWeightKg !== undefined ? displayWeight(goalWeightKg, unit) : undefined

  const selectPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.label)
    setDateRange(preset.getDates())
  }

  const hasGoal = !!(goalData?.goal)

  if (!isLoading && !goalsIsLoading && (!stats || (stats.series as unknown[]).length === 0)) {
    return <EmptyDashboard hasGoal={hasGoal} />
  }

  return (
    <div className="space-y-6">
      {/* Date range presets */}
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => selectPreset(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activePreset === p.label
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:text-body border border-border'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <StatCards from={dateRange.from} to={dateRange.to} />

      {/* Main weight chart */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h3 className="text-sm font-medium text-heading mb-4">Weight Over Time</h3>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-muted text-sm">
            Loading…
          </div>
        ) : stats ? (
          <WeightChart stats={stats} goalWeight={goalWeight} />
        ) : null}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h3 className="text-sm font-medium text-heading mb-4">Weekly Change</h3>
        {stats ? <WeeklyBarChart series={stats.series} /> : null}
      </div>

      {/* Consistency heatmap */}
      <div className="bg-surface border border-border rounded-2xl p-4">
        <h3 className="text-sm font-medium text-heading mb-4">Logging Consistency</h3>
        {stats ? <ConsistencyHeatmap series={stats.series} /> : null}
      </div>
    </div>
  )
}
