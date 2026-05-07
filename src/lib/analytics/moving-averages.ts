import { parseISO, subDays, isAfter, isBefore } from 'date-fns'

export interface DataPoint {
  date: string   // ISO date string 'YYYY-MM-DD'
  weight_kg: number
}

export interface MAPoint {
  date: string
  value: number
}

export function movingAverage(entries: DataPoint[], windowDays: number): MAPoint[] {
  if (entries.length === 0) return []

  const minRequired = Math.ceil(windowDays / 2)
  const result: MAPoint[] = []

  for (const entry of entries) {
    const entryDate = parseISO(entry.date)
    const windowStart = subDays(entryDate, windowDays - 1)

    const inWindow = entries.filter(e => {
      const d = parseISO(e.date)
      return !isBefore(d, windowStart) && !isAfter(d, entryDate)
    })

    if (inWindow.length < minRequired) continue

    const avg = inWindow.reduce((sum, e) => sum + e.weight_kg, 0) / inWindow.length
    result.push({ date: entry.date, value: Math.round(avg * 1000) / 1000 })
  }

  return result
}
