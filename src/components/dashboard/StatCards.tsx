'use client'
import { useStats } from '@/hooks/useStats'
import { useUnits } from '@/store/units'
import { displayWeight } from '@/lib/utils'
import { StatCard } from './StatCard'
import { format, parseISO } from 'date-fns'

interface StatCardsProps {
  from?: string
  to?: string
}

export function StatCards({ from, to }: StatCardsProps) {
  const { data: stats, isLoading } = useStats(from, to)
  const { unit } = useUnits()

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-5 h-36 animate-pulse" />
        ))}
      </div>
    )
  }

  const currentWeight = stats.ma7.length > 0
    ? displayWeight(stats.ma7[stats.ma7.length - 1].value, unit)
    : null

  const ma7Sparkline = stats.ma7.slice(-14).map((p: { date: string; value: number }) => displayWeight(p.value, unit))

  const weeklyChange = displayWeight(Math.abs(stats.rateOfChange.perWeek), unit)
  const weeklyDirection = stats.rateOfChange.perWeek

  const bmiCategory = stats.bmi.category
  const bmiColor: 'success' | 'warning' | 'muted' =
    bmiCategory === 'Normal' ? 'success'
    : bmiCategory === 'Overweight' || bmiCategory === 'Obese' ? 'warning'
    : 'muted'

  const goalProjected = stats.projection?.goalDate
    ? format(parseISO(stats.projection.goalDate), 'MMM d, yyyy')
    : null

  return (
    <div className="space-y-4">
      {/* Plateau warning */}
      {stats.plateau.isPlateauing && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3 text-sm text-warning">
          Plateau detected — weight has been stable for 14+ days. Consider adjusting your approach.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current weight */}
        <StatCard
          title="Current Weight"
          value={currentWeight ?? '—'}
          unit={currentWeight !== null ? unit : ''}
          sparklineData={ma7Sparkline}
          sparklineColor="var(--primary)"
        />

        {/* Goal progress */}
        <StatCard
          title="Goal Progress"
          value={stats.weeklyDigest.percentOfGoal !== null ? stats.weeklyDigest.percentOfGoal : '—'}
          unit={stats.weeklyDigest.percentOfGoal !== null ? '%' : ''}
          subtitle={goalProjected ? `On track for ${goalProjected}` : 'No goal set'}
          progress={stats.weeklyDigest.percentOfGoal ?? undefined}
        />

        {/* Rate of change */}
        <StatCard
          title="Rate of Change"
          value={weeklyChange}
          unit={unit}
          change={Math.round(weeklyDirection * 10) / 10}
          changeUnit={unit}
          sparklineData={stats.ma7.slice(-8).map((p: { date: string; value: number }) => displayWeight(p.value, unit))}
          sparklineColor={weeklyDirection <= 0 ? 'var(--success)' : 'var(--warning)'}
          color={weeklyDirection <= 0 ? 'success' : 'warning'}
        />

        {/* Streak */}
        <StatCard
          title="Streak"
          value={stats.streak.current}
          unit="days"
          subtitle={`Longest: ${stats.streak.longest} days`}
          sparklineColor="var(--primary)"
        />

        {/* Consistency */}
        <StatCard
          title="Consistency"
          value={stats.consistency.score}
          unit="%"
          subtitle="Days logged in period"
          progress={stats.consistency.score}
        />

        {/* BMI */}
        <StatCard
          title="BMI"
          value={stats.bmi.value ?? '—'}
          subtitle={stats.bmi.category ?? 'Set your height in Settings'}
          color={bmiColor}
        />
      </div>
    </div>
  )
}
