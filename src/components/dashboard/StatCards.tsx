'use client'
import { useStats } from '@/hooks/useStats'
import { useGoal } from '@/hooks/useGoals'
import { useUnits } from '@/store/units'
import { displayWeight } from '@/lib/utils'
import { StatCard } from './StatCard'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'

const cardContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
}

interface StatCardsProps {
  from?: string
  to?: string
}

interface ActiveGoal {
  start_weight_kg: number
  goal_weight_kg: number
}

export function StatCards({ from, to }: StatCardsProps) {
  const { data: stats, isLoading } = useStats(from, to)
  const { data: goalsData } = useGoal()
  const { unit } = useUnits()

  const rawGoal = goalsData?.goal
  const activeGoal = (rawGoal && typeof (rawGoal as any).start_weight_kg === 'number')
    ? (rawGoal as ActiveGoal)
    : null

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

      <motion.div
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Current weight */}
        <motion.div variants={cardItemVariants} className="h-full">
          <StatCard
            title="Current Weight"
            value={currentWeight ?? '—'}
            unit={currentWeight !== null ? unit : ''}
            sparklineData={ma7Sparkline}
            sparklineColor="var(--primary)"
          />
        </motion.div>

        {/* Goal progress */}
        <motion.div variants={cardItemVariants} className="h-full">
          <StatCard
            title="Goal Progress"
            value={stats.weeklyDigest.percentOfGoal !== null ? stats.weeklyDigest.percentOfGoal : '—'}
            unit={stats.weeklyDigest.percentOfGoal !== null ? '%' : ''}
            subtitle={goalProjected ? `On track for ${goalProjected}` : 'No goal set'}
            progress={stats.weeklyDigest.percentOfGoal ?? undefined}
            progressLabels={activeGoal ? {
              start: `${displayWeight(activeGoal.start_weight_kg, unit)}${unit}`,
              end: `${displayWeight(activeGoal.goal_weight_kg, unit)}${unit}`,
            } : undefined}
          />
        </motion.div>

        {/* Rate of change */}
        <motion.div variants={cardItemVariants} className="h-full">
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
        </motion.div>

        {/* Streak */}
        <motion.div variants={cardItemVariants} className="h-full">
          <StatCard
            title="Streak"
            value={stats.streak.current}
            unit="days"
            subtitle={`Longest: ${stats.streak.longest} days`}
            sparklineColor="var(--primary)"
          />
        </motion.div>

        {/* Consistency */}
        <motion.div variants={cardItemVariants} className="h-full">
          <StatCard
            title="Consistency"
            value={stats.consistency.score}
            unit="%"
            subtitle="Days logged in period"
            progress={stats.consistency.score}
          />
        </motion.div>

        {/* BMI */}
        <motion.div variants={cardItemVariants} className="h-full">
          <StatCard
            title="BMI"
            value={stats.bmi.value ?? '—'}
            subtitle={stats.bmi.category ?? 'Set your height in Settings'}
            color={bmiColor}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
