'use client'
import { useGoal, useCreateGoal, useUpdateGoal } from '@/hooks/useGoals'
import { useStats } from '@/hooks/useStats'
import { GoalForm } from './GoalForm'
import { ProjectionView } from './ProjectionView'
import { format, subDays } from 'date-fns'

interface GoalData {
  id: string
  start_weight_kg: number
  goal_weight_kg: number
  target_date: string | null
}

interface GoalSubmitData {
  start_weight_kg: number
  goal_weight_kg: number
  target_date?: string
}

export function GoalsPageClient() {
  const { data: goalData } = useGoal()
  const { data: stats } = useStats(
    format(subDays(new Date(), 90), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  )
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()

  const goal = goalData?.goal as GoalData | null | undefined
  const firstEntryWeight = (stats?.series as Array<{ weight_kg: number }> | undefined)?.[0]?.weight_kg

  const handleSubmit = async (data: GoalSubmitData) => {
    if (goal) {
      await updateGoal.mutateAsync({ id: goal.id, data })
    } else {
      await createGoal.mutateAsync(data)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-medium text-heading">Goal</h2>
        <p className="text-sm text-muted mt-1">Set your target weight and see your projection.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium text-heading mb-4">
          {goal ? 'Update your goal' : 'Set a goal'}
        </h3>
        <GoalForm
          initialStartWeight={goal?.start_weight_kg ?? firstEntryWeight}
          initialGoalWeight={goal?.goal_weight_kg}
          initialTargetDate={goal?.target_date ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createGoal.isPending || updateGoal.isPending}
        />
      </div>

      {goal && stats && (stats.ma7 as unknown[]).length >= 3 && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-sm font-medium text-heading mb-4">Projection</h3>
          <ProjectionView stats={stats} goal={goal} />
        </div>
      )}
    </div>
  )
}
