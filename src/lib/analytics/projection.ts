import { parseISO, differenceInDays, addDays, format } from 'date-fns'

export interface SeriesPoint {
  date: string   // 'YYYY-MM-DD'
  value: number  // weight_kg (use MA7 series as input, not raw)
}

export interface ConfidenceBandPoint {
  date: string
  lower: number
  upper: number
  predicted: number
}

export interface ProjectionResult {
  goalDate: string | null          // 'YYYY-MM-DD', null if beyond 2 years
  daysUntilGoal: number | null
  slope: number                    // kg/day (negative = losing weight)
  intercept: number
  r2: number
  band: ConfidenceBandPoint[]      // 180 days forward
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

function mean(arr: number[]): number {
  return sum(arr) / arr.length
}

export function computeProjection(
  series: SeriesPoint[],
  goalWeightKg: number
): ProjectionResult | null {
  if (series.length < 3) return null

  const t0 = parseISO(series[0].date)
  const xs = series.map(p => differenceInDays(parseISO(p.date), t0))
  const ys = series.map(p => p.value)
  const n = xs.length

  const xMean = mean(xs)
  const yMean = mean(ys)

  const ssXX = sum(xs.map(x => (x - xMean) ** 2))
  const ssXY = sum(xs.map((x, i) => (x - xMean) * (ys[i] - yMean)))
  const ssYY = sum(ys.map(y => (y - yMean) ** 2))

  if (ssXX === 0) return null  // all same date — degenerate

  const slope = ssXY / ssXX
  const intercept = yMean - slope * xMean
  const r2 = ssYY === 0 ? 1 : (ssXY ** 2) / (ssXX * ssYY)

  // Residual standard error
  const fitted = xs.map(x => slope * x + intercept)
  const sse = sum(ys.map((y, i) => (y - fitted[i]) ** 2))
  const se = n > 2 ? Math.sqrt(sse / (n - 2)) : 0

  // Can we project to goal?
  const currentWeight = ys[ys.length - 1]
  const losingWeight = slope < 0
  const goalIsLower = goalWeightKg < currentWeight
  const goalIsHigher = goalWeightKg > currentWeight

  if ((goalIsLower && !losingWeight) || (goalIsHigher && losingWeight)) {
    // Trend goes wrong direction for goal
    return null
  }

  // Days until goal
  let goalDate: string | null = null
  let daysUntilGoal: number | null = null

  if (slope !== 0) {
    const xGoal = (goalWeightKg - intercept) / slope
    const daysFromStart = Math.round(xGoal)
    const projectedDate = addDays(t0, daysFromStart)
    const daysFromNow = differenceInDays(projectedDate, new Date())

    if (daysFromNow > 0 && daysFromNow < 730) {  // within 2 years
      goalDate = format(projectedDate, 'yyyy-MM-dd')
      daysUntilGoal = daysFromNow
    }
  }

  // Confidence band: 180 days forward from last data point
  const xLast = xs[xs.length - 1]
  const tCrit = 1.96  // ~95% CI
  const band: ConfidenceBandPoint[] = []

  for (let i = 0; i <= 180; i++) {
    const xp = xLast + i
    const predicted = slope * xp + intercept
    const margin = ssXX > 0
      ? tCrit * se * Math.sqrt(1 / n + (xp - xMean) ** 2 / ssXX)
      : 0

    band.push({
      date: format(addDays(t0, xp), 'yyyy-MM-dd'),
      predicted: Math.round(predicted * 1000) / 1000,
      lower: Math.round((predicted - margin) * 1000) / 1000,
      upper: Math.round((predicted + margin) * 1000) / 1000,
    })
  }

  return {
    goalDate,
    daysUntilGoal,
    slope: Math.round(slope * 100000) / 100000,
    intercept: Math.round(intercept * 1000) / 1000,
    r2: Math.round(r2 * 10000) / 10000,
    band,
  }
}
