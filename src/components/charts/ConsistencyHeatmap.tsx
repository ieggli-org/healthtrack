'use client'

import { parseISO, eachDayOfInterval, subYears, format } from 'date-fns'

interface Props {
  series: { date: string; weight_kg: number }[]
}

export function ConsistencyHeatmap({ series }: Props) {
  const loggedDates = new Set(series.map((e) => e.date))
  const today = new Date()
  const startDate = subYears(today, 1)
  const days = eachDayOfInterval({ start: startDate, end: today })

  // Pad to start on a Monday (0=Mon … 6=Sun)
  const startDayOfWeek = (days[0].getDay() + 6) % 7
  const paddedDays: (Date | null)[] = Array(startDayOfWeek)
    .fill(null)
    .concat(days as (Date | null)[])

  // Split into columns of 7 (each column = one week)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="flex gap-[3px]"
        style={{ minWidth: 'fit-content' }}
        role="grid"
        aria-label="Logging consistency heatmap"
      >
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => {
              if (!day) {
                return <div key={di} className="w-3 h-3" aria-hidden="true" />
              }
              const dateStr = format(day, 'yyyy-MM-dd')
              const logged = loggedDates.has(dateStr)
              return (
                <div
                  key={di}
                  role="gridcell"
                  title={`${dateStr}${logged ? ' — logged' : ''}`}
                  aria-label={`${dateStr}${logged ? ', logged' : ', not logged'}`}
                  className={`w-3 h-3 rounded-sm ${
                    logged ? 'bg-primary' : 'bg-surface-2'
                  }`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted">
        <div className="w-3 h-3 rounded-sm bg-surface-2" aria-hidden="true" />
        <span>Not logged</span>
        <div className="w-3 h-3 rounded-sm bg-primary ml-2" aria-hidden="true" />
        <span>Logged</span>
      </div>
    </div>
  )
}
