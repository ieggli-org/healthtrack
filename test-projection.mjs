import { addDays, format, parseISO, differenceInDays } from 'date-fns'

function makeSeries(count, startWeight, deltaPerDay, startDate = '2024-01-01') {
  return Array.from({ length: count }, (_, i) => ({
    date: format(addDays(new Date(startDate), i), 'yyyy-MM-dd'),
    value: startWeight + i * deltaPerDay,
  }))
}

const series = makeSeries(30, 80, -0.1)
console.log('First date:', series[0].date)
console.log('Last date:', series[series.length - 1].date)
console.log('Current date:', new Date().toISOString())

const t0 = parseISO(series[0].date)
const xs = series.map(p => differenceInDays(parseISO(p.date), t0))
const ys = series.map(p => p.value)

console.log('t0:', t0)
console.log('xs:', xs)
console.log('ys:', ys)
