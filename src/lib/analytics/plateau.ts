export interface MAPoint {
  date: string
  value: number
}

export interface PlateauResult {
  isPlateauing: boolean
  daysFlat: number
}

export function detectPlateau(
  ma7: MAPoint[],
  thresholdKg = 0.3,
  windowDays = 14
): PlateauResult {
  if (ma7.length < windowDays) {
    return { isPlateauing: false, daysFlat: 0 }
  }

  const recent = ma7.slice(-windowDays).map(p => p.value)
  const max = Math.max(...recent)
  const min = Math.min(...recent)
  const range = max - min

  return {
    isPlateauing: range <= thresholdKg,
    daysFlat: windowDays,
  }
}
