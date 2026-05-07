import { describe, it, expect } from 'vitest'
import { detectPlateau } from './plateau'

function makeMA(count: number, baseValue: number, delta = 0): { date: string; value: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    value: baseValue + i * delta,
  }))
}

describe('detectPlateau', () => {
  it('returns false when fewer than windowDays points', () => {
    const result = detectPlateau(makeMA(13, 80), 0.3, 14)
    expect(result.isPlateauing).toBe(false)
    expect(result.daysFlat).toBe(0)
  })

  it('detects plateau when MA is flat within threshold', () => {
    // All values within 0.2kg range — well within 0.3kg threshold
    const ma7 = makeMA(14, 80, 0.01)  // range = 14 * 0.01 = 0.14kg
    expect(detectPlateau(ma7).isPlateauing).toBe(true)
  })

  it('does not detect plateau when MA trends strongly', () => {
    const ma7 = makeMA(14, 80, -0.15)  // range = 14 * 0.15 = 2.1kg
    expect(detectPlateau(ma7).isPlateauing).toBe(false)
  })

  it('detects plateau at threshold boundary', () => {
    // Range exactly 0.3 — should detect
    const ma7 = makeMA(14, 80, 0.3 / 13)
    expect(detectPlateau(ma7, 0.3).isPlateauing).toBe(true)
  })

  it('uses only the last windowDays points', () => {
    // First 14 days trending, last 14 days flat
    const trending = makeMA(14, 80, -0.5)
    const flat = makeMA(14, 71, 0.01)
    const combined = [...trending, ...flat]
    expect(detectPlateau(combined).isPlateauing).toBe(true)
  })

  it('returns isPlateauing: false for empty input', () => {
    expect(detectPlateau([]).isPlateauing).toBe(false)
  })
})
