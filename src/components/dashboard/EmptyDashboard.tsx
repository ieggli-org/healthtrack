'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EmptyDashboardProps {
  hasGoal?: boolean
}

export function EmptyDashboard({ hasGoal = false }: EmptyDashboardProps) {
  const router = useRouter()

  const svgIcon = (
    <div className="w-20 h-20 rounded-full bg-surface-2 border border-border flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-muted">
        <circle cx="20" cy="14" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="28" x2="20" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="14" y1="34" x2="26" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )

  if (!hasGoal) {
    // First-time user: no entries AND no goal
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        {svgIcon}
        <div className="space-y-2">
          <h2 className="font-fraunces text-2xl text-heading">Welcome to HealthTrack</h2>
          <p className="text-muted text-sm max-w-sm">
            Start by logging your first weight. Then set a goal to see your projection.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/log')}>Log your first weight →</Button>
          <Button variant="outline" onClick={() => router.push('/goals')}>Set a goal</Button>
        </div>
      </div>
    )
  }

  // Has goal but no entries yet
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      {svgIcon}
      <div className="space-y-2">
        <h2 className="font-fraunces text-2xl text-heading">Start your journey</h2>
        <p className="text-muted text-sm max-w-sm">
          Log your first weight to see your progress chart, moving averages, and insights.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => router.push('/log')}>Log your first weight →</Button>
      </div>
    </div>
  )
}
