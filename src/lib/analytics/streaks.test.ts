import { describe, it, expect } from 'vitest'
import { computeStreaks, consistencyScore } from './streaks'

describe('computeStreaks', () => {
  it('returns zeros for empty entries', () => {
    expect(computeStreaks([])).toEqual({ current: 0, longest: 0 })
  })

  it('returns 1/1 for single entry', () => {
    const result = computeStreaks([{ date: '2024-01-01' }])
    expect(result.longest).toBe(1)
  })

  it('correctly counts longest streak', () => {
    const entries = [
      { date: '2024-01-01' },
      { date: '2024-01-02' },
      { date: '2024-01-03' },
      { date: '2024-01-05' },  // gap
      { date: '2024-01-06' },
    ]
    const result = computeStreaks(entries)
    expect(result.longest).toBe(3)
  })

  it('handles duplicate dates (only counts unique days)', () => {
    const entries = [
      { date: '2024-01-01' },
      { date: '2024-01-01' },  // duplicate
      { date: '2024-01-02' },
    ]
    const result = computeStreaks(entries)
    expect(result.longest).toBe(2)
  })

  it('current streak is active when last entry was yesterday', () => {
    const { format, subDays } = require('date-fns')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const dayBefore = format(subDays(new Date(), 2), 'yyyy-MM-dd')
    const result = computeStreaks([{ date: dayBefore }, { date: yesterday }])
    expect(result.current).toBe(2)
  })

  it('current streak is 0 when last entry was 2 days ago', () => {
    const { format, subDays } = require('date-fns')
    const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd')
    const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd')
    const result = computeStreaks([{ date: threeDaysAgo }, { date: twoDaysAgo }])
    expect(result.current).toBe(0)
  })
})

describe('consistencyScore', () => {
  it('returns 100 for entries on every day in range', () => {
    const from = new Date('2024-01-01')
    const to = new Date('2024-01-07')
    const entries = Array.from({ length: 7 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      weight_kg: 80,
    }))
    const result = consistencyScore(entries, from, to)
    expect(result.score).toBe(100)
  })

  it('returns ~50 for entries on half the days', () => {
    const from = new Date('2024-01-01')
    const to = new Date('2024-01-10')
    const entries = [1, 3, 5, 7, 9].map(d => ({
      date: `2024-01-0${d}`,
      weight_kg: 80,
    }))
    const result = consistencyScore(entries, from, to)
    expect(result.score).toBe(50)
  })

  it('returns variance 0 for single entry', () => {
    const from = new Date('2024-01-01')
    const to = new Date('2024-01-01')
    const result = consistencyScore([{ date: '2024-01-01', weight_kg: 80 }], from, to)
    expect(result.variance).toBe(0)
  })

  it('computes non-zero variance for varying weights', () => {
    const from = new Date('2024-01-01')
    const to = new Date('2024-01-05')
    const entries = [80, 81, 79, 82, 80].map((w, i) => ({
      date: `2024-01-0${i + 1}`,
      weight_kg: w,
    }))
    const result = consistencyScore(entries, from, to)
    expect(result.variance).toBeGreaterThan(0)
  })
})
