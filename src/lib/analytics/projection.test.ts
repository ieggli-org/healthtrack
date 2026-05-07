import { describe, it, expect } from 'vitest'
import { addDays, format } from 'date-fns'
import { computeProjection } from './projection'

function makeSeries(count: number, startWeight: number, deltaPerDay: number, startDate = '2024-01-01') {
  return Array.from({ length: count }, (_, i) => ({
    date: format(addDays(new Date(startDate), i), 'yyyy-MM-dd'),
    value: startWeight + i * deltaPerDay,
  }))
}

describe('computeProjection', () => {
  it('returns null for fewer than 3 points', () => {
    expect(computeProjection([], 75)).toBeNull()
    expect(computeProjection([{ date: '2024-01-01', value: 80 }], 75)).toBeNull()
    expect(computeProjection(makeSeries(2, 80, -0.1), 75)).toBeNull()
  })

  it('projects a goal date for steady weight loss', () => {
    // -0.1 kg/day from 80kg, goal 75kg = 50 days
    // Use a start date in the recent past so goal date is in the future
    const series = makeSeries(30, 80, -0.1, '2026-04-07')
    const result = computeProjection(series, 75)
    expect(result).not.toBeNull()
    expect(result!.slope).toBeLessThan(0)
    expect(result!.daysUntilGoal).toBeGreaterThan(0)
    expect(result!.goalDate).toBeTruthy()
    expect(result!.r2).toBeGreaterThan(0.99)
  })

  it('returns null when trend is opposite to goal (gaining, goal is lower)', () => {
    const series = makeSeries(10, 75, 0.1, '2026-04-27')  // gaining weight
    expect(computeProjection(series, 70)).toBeNull()
  })

  it('returns null when trend is flat and goal is lower', () => {
    const series = makeSeries(14, 80, 0, '2026-04-23')  // no change
    expect(computeProjection(series, 75)).toBeNull()
  })

  it('confidence band has 181 points (0 to 180 inclusive)', () => {
    const series = makeSeries(30, 80, -0.1, '2026-04-07')
    const result = computeProjection(series, 75)
    expect(result!.band).toHaveLength(181)
  })

  it('confidence band lower <= predicted <= upper', () => {
    const series = makeSeries(30, 80, -0.1, '2026-04-07')
    const result = computeProjection(series, 75)!
    result.band.forEach(point => {
      expect(point.lower).toBeLessThanOrEqual(point.predicted)
      expect(point.predicted).toBeLessThanOrEqual(point.upper)
    })
  })

  it('returns sensible r² for noisy data', () => {
    // Add noise to a trend
    const series = makeSeries(30, 80, -0.1, '2026-04-07').map((p, i) => ({
      ...p,
      value: p.value + (i % 2 === 0 ? 0.3 : -0.3),
    }))
    const result = computeProjection(series, 75)
    expect(result).not.toBeNull()
    expect(result!.r2).toBeGreaterThan(0)
    expect(result!.r2).toBeLessThanOrEqual(1)
  })
})
