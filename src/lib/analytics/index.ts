import { format } from 'date-fns'
import { movingAverage, type DataPoint } from './moving-averages'
import { computeProjection } from './projection'
import { detectPlateau } from './plateau'
import { computeStreaks, consistencyScore } from './streaks'

interface WeightEntry {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
  note: string | null
  body_fat_pct: number | null
  waist_cm: number | null
}

interface Goal {
  id: string
  goal_weight_kg: number
  start_weight_kg: number
  target_date: string | null
}

function computeBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  const value = Math.round(bmi * 10) / 10
  let category: string
  if (bmi < 18.5) category = 'Underweight'
  else if (bmi < 25) category = 'Normal'
  else if (bmi < 30) category = 'Overweight'
  else category = 'Obese'
  return { value, category }
}

function computeRateOfChange(ma7: { date: string; value: number }[]) {
  if (ma7.length < 2) return { perDay: 0, perWeek: 0, perMonth: 0 }
  const first = ma7[0].value
  const last = ma7[ma7.length - 1].value
  const days = ma7.length
  const perDay = (last - first) / days
  return {
    perDay: Math.round(perDay * 1000) / 1000,
    perWeek: Math.round(perDay * 7 * 1000) / 1000,
    perMonth: Math.round(perDay * 30 * 1000) / 1000,
  }
}

function computeWeeklyDigest(
  series: DataPoint[],
  goal: Goal | null
) {
  const totalChange = series.length >= 2
    ? Math.round((series[series.length - 1].weight_kg - series[0].weight_kg) * 100) / 100
    : 0

  const percentOfGoal = goal && goal.start_weight_kg !== goal.goal_weight_kg
    ? Math.round(
        ((series[0]?.weight_kg ?? goal.start_weight_kg) - (series[series.length - 1]?.weight_kg ?? goal.start_weight_kg))
        / (goal.start_weight_kg - goal.goal_weight_kg) * 100
      )
    : null

  // Group by ISO week (Monday-based)
  const weekMap = new Map<string, number[]>()
  for (const entry of series) {
    const d = new Date(entry.date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const weekKey = format(monday, 'yyyy-MM-dd')
    const existing = weekMap.get(weekKey) ?? []
    existing.push(entry.weight_kg)
    weekMap.set(weekKey, existing)
  }

  const weekChanges: { weekStart: string; change: number }[] = []
  for (const [weekStart, weights] of Array.from(weekMap.entries())) {
    if (weights.length >= 2) {
      weekChanges.push({
        weekStart,
        change: Math.round((weights[weights.length - 1] - weights[0]) * 100) / 100,
      })
    }
  }

  const bestWeek = weekChanges.length > 0
    ? weekChanges.reduce((a, b) => a.change < b.change ? a : b)
    : null
  const worstWeek = weekChanges.length > 0
    ? weekChanges.reduce((a, b) => a.change > b.change ? a : b)
    : null

  return { bestWeek, worstWeek, totalChange, percentOfGoal }
}

export function computeStats(
  entries: WeightEntry[],
  goal: Goal | null,
  heightCm: number | null,
  fromDate: Date,
  toDate: Date
) {
  const series: DataPoint[] = entries
    .map(e => ({ date: e.logged_at.slice(0, 10), weight_kg: e.weight_kg }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const ma7 = movingAverage(series, 7)
  const ma14 = movingAverage(series, 14)
  const ma30 = movingAverage(series, 30)

  const projection = goal && ma7.length >= 3
    ? computeProjection(ma7, goal.goal_weight_kg)
    : null

  const plateau = detectPlateau(ma7)
  const streak = computeStreaks(entries.map(e => ({ date: e.logged_at.slice(0, 10) })))
  const consistency = consistencyScore(
    entries.map(e => ({ date: e.logged_at.slice(0, 10), weight_kg: e.weight_kg })),
    fromDate,
    toDate
  )

  const latestWeight = series.length > 0 ? series[series.length - 1].weight_kg : null
  const bmi = heightCm && latestWeight
    ? computeBMI(latestWeight, heightCm)
    : { value: null, category: null }

  const rateOfChange = computeRateOfChange(ma7)
  const weeklyDigest = computeWeeklyDigest(series, goal)

  return {
    series,
    ma7,
    ma14,
    ma30,
    rateOfChange,
    projection,
    plateau,
    streak,
    consistency,
    bmi,
    weeklyDigest,
  }
}
