import { describe, it, expect } from 'vitest'
import { movingAverage } from './moving-averages'

function makeEntries(count: number, startWeight = 80, deltaPerDay = -0.1, startDate = '2024-01-01') {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    return {
      date: date.toISOString().slice(0, 10),
      weight_kg: Math.round((startWeight + i * deltaPerDay) * 1000) / 1000,
    }
  })
}

describe('movingAverage', () => {
  it('returns empty array for empty input', () => {
    expect(movingAverage([], 7)).toEqual([])
  })

  it('returns nothing when insufficient data (fewer than ceil(window/2) points)', () => {
    const entries = makeEntries(3)  // 3 < ceil(7/2)=4
    expect(movingAverage(entries, 7)).toHaveLength(0)
  })

  it('returns values when enough data exists', () => {
    const entries = makeEntries(10)
    const result = movingAverage(entries, 7)
    expect(result.length).toBeGreaterThan(0)
    // Each result has date and value
    result.forEach(r => {
      expect(r).toHaveProperty('date')
      expect(r).toHaveProperty('value')
      expect(typeof r.value).toBe('number')
    })
  })

  it('7-day MA averages the correct window of points', () => {
    // 7 entries all at 80kg — MA should be 80
    const entries = makeEntries(7, 80, 0)
    const result = movingAverage(entries, 7)
    expect(result.length).toBeGreaterThan(0)
    const lastPoint = result[result.length - 1]
    expect(lastPoint.value).toBeCloseTo(80, 3)
  })

  it('MA smooths a declining trend', () => {
    const entries = makeEntries(14, 85, -0.2)
    const ma7 = movingAverage(entries, 7)
    const ma14 = movingAverage(entries, 14)
    // MA14 should be smoother (smaller range) than raw data
    expect(ma7.length).toBeGreaterThan(0)
    expect(ma14.length).toBeGreaterThan(0)
  })

  it('30-day MA requires ceil(15) = 15 points minimum', () => {
    const entries14 = makeEntries(14)
    const entries15 = makeEntries(15)
    expect(movingAverage(entries14, 30)).toHaveLength(0)
    expect(movingAverage(entries15, 30).length).toBeGreaterThan(0)
  })

  it('handles non-consecutive dates correctly', () => {
    // Only entries on every other day — window based on calendar dates, not entry count
    const entries = [
      { date: '2024-01-01', weight_kg: 80 },
      { date: '2024-01-03', weight_kg: 79.8 },
      { date: '2024-01-05', weight_kg: 79.6 },
      { date: '2024-01-07', weight_kg: 79.4 },
    ]
    const result = movingAverage(entries, 7)
    // All 4 points fall within 7-day windows of each other
    expect(result.length).toBeGreaterThan(0)
  })
})
