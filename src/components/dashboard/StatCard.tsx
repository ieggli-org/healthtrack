'use client'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/charts/Sparkline'
import { Progress } from '@/components/ui/progress'

interface StatCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  change?: number
  changeUnit?: string
  sparklineData?: number[]
  sparklineColor?: string
  progress?: number  // 0-100 for progress bar
  color?: 'default' | 'success' | 'warning' | 'muted'
  banner?: string   // plateau warning text
}

export function StatCard({
  title, value, unit, subtitle, change, changeUnit,
  sparklineData, sparklineColor, progress, color = 'default',
}: StatCardProps) {
  const valueColor = color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning' : 'text-heading'

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
      <p className="text-xs uppercase tracking-wider text-muted">{title}</p>

      <div className="flex items-end gap-1">
        <span className={cn('font-fraunces text-3xl font-light leading-none', valueColor)}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted mb-0.5">{unit}</span>}
      </div>

      {subtitle && <p className="text-xs text-muted">{subtitle}</p>}

      {change !== undefined && (
        <p className={cn('text-xs font-medium', change <= 0 ? 'text-success' : 'text-warning')}>
          {change > 0 ? '+' : ''}{change} {changeUnit ?? ''}/wk
        </p>
      )}

      {progress !== undefined && (
        <Progress value={progress} className="h-1.5 bg-surface-2" />
      )}

      {sparklineData && sparklineData.length >= 2 && (
        <div className="mt-auto">
          <Sparkline data={sparklineData} color={sparklineColor ?? 'var(--primary)'} />
        </div>
      )}
    </div>
  )
}
