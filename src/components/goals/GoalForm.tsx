'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUnits } from '@/store/units'
import { lbToKg, kgToLb } from '@/lib/utils'
import { toast } from 'sonner'

// Input schema (string fields as typed in the form)
const GoalFormInputSchema = z.object({
  startWeight: z.string().min(1, 'Required'),
  goalWeight: z.string().min(1, 'Required'),
  targetDate: z.string().optional(),
})

// Output schema with numeric validation after parsing
const GoalFormSchema = GoalFormInputSchema.superRefine((data, ctx) => {
  const sw = Number(data.startWeight)
  const gw = Number(data.goalWeight)
  if (isNaN(sw) || sw <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a positive number', path: ['startWeight'] })
  }
  if (isNaN(gw) || gw <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Must be a positive number', path: ['goalWeight'] })
  }
})

type GoalFormValues = z.infer<typeof GoalFormInputSchema>

interface GoalFormProps {
  initialStartWeight?: number  // kg
  initialGoalWeight?: number   // kg
  initialTargetDate?: string
  onSubmit: (data: { start_weight_kg: number; goal_weight_kg: number; target_date?: string }) => Promise<void>
  isSubmitting?: boolean
}

export function GoalForm({ initialStartWeight, initialGoalWeight, initialTargetDate, onSubmit, isSubmitting }: GoalFormProps) {
  const { unit } = useUnits()
  const { register, handleSubmit, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(GoalFormSchema),
    defaultValues: {
      startWeight: initialStartWeight ? String(unit === 'lb' ? kgToLb(initialStartWeight) : initialStartWeight) : '',
      goalWeight: initialGoalWeight ? String(unit === 'lb' ? kgToLb(initialGoalWeight) : initialGoalWeight) : '',
      targetDate: initialTargetDate ?? '',
    },
  })

  const handleFormSubmit = async (data: GoalFormValues) => {
    const toKg = (v: number) => unit === 'lb' ? lbToKg(v) : v
    try {
      await onSubmit({
        start_weight_kg: toKg(Number(data.startWeight)),
        goal_weight_kg: toKg(Number(data.goalWeight)),
        target_date: data.targetDate || undefined,
      })
      toast.success('Goal saved')
    } catch {
      toast.error('Failed to save goal')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="startWeight" className="text-body text-sm">Starting weight ({unit})</Label>
          <Input id="startWeight" type="number" step="0.1" {...register('startWeight')} className="bg-surface-2 border-border text-heading" />
          {errors.startWeight && <p className="text-xs text-warning">{errors.startWeight.message ?? 'Invalid value'}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="goalWeight" className="text-body text-sm">Goal weight ({unit})</Label>
          <Input id="goalWeight" type="number" step="0.1" {...register('goalWeight')} className="bg-surface-2 border-border text-heading" />
          {errors.goalWeight && <p className="text-xs text-warning">{errors.goalWeight.message as string}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="targetDate" className="text-body text-sm">Target date (optional)</Label>
        <Input id="targetDate" type="date" {...register('targetDate')} className="bg-surface-2 border-border text-heading w-40" />
      </div>
      <Button type="submit" disabled={isSubmitting} className="bg-primary text-white hover:bg-primary/90">
        {isSubmitting ? 'Saving...' : 'Save goal'}
      </Button>
    </form>
  )
}
