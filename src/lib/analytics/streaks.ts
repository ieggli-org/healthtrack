import { differenceInDays, parseISO, format, subDays } from 'date-fns'

export interface EntryDate {
  date: string  // ISO date 'YYYY-MM-DD' or full timestamp (will be sliced to 10 chars)
  weight_kg?: number
}

export interface StreakResult {
  current: number
  longest: number
}

export interface ConsistencyResult {
  score: number    // 0–100 (percentage of days logged in range)
  variance: number // weight variance across entries
}

export function computeStreaks(entries: EntryDate[]): StreakResult {
  if (entries.length === 0) return { current: 0, longest: 0 }

  // Deduplicate and sort unique dates ascending
  const dates = Array.from(new Set(entries.map(e => e.date.slice(0, 10)))).sort()

  // Longest streak
  let longest = 1
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const gap = differenceInDays(parseISO(dates[i]), parseISO(dates[i - 1]))
    if (gap === 1) {
      streak++
      if (streak > longest) longest = streak
    } else {
      streak = 1
    }
  }

  // Current streak: count back from today
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  let current = 0
  const lastDate = dates[dates.length - 1]
  if (lastDate === today || lastDate === yesterday) {
    let expected = lastDate
    for (let i = dates.length - 1; i >= 0; i--) {
      if (dates[i] === expected) {
        current++
        expected = format(subDays(parseISO(expected), 1), 'yyyy-MM-dd')
      } else {
        break
      }
    }
  }

  return { current, longest }
}

export function consistencyScore(
  entries: (EntryDate & { weight_kg: number })[],
  fromDate: Date,
  toDate: Date
): ConsistencyResult {
  const totalDays = differenceInDays(toDate, fromDate) + 1
  const loggedDays = new Set(entries.map(e => e.date.slice(0, 10))).size
  const score = Math.min(100, Math.round((loggedDays / totalDays) * 100))

  const weights = entries.map(e => e.weight_kg)
  let variance = 0
  if (weights.length > 1) {
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length
    variance = weights.reduce((sum, w) => sum + (w - avg) ** 2, 0) / (weights.length - 1)
    variance = Math.round(variance * 1000) / 1000
  }

  return { score, variance }
}
