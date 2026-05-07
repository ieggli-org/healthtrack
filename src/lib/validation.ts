import { z } from 'zod'

export const EntryCreateSchema = z.object({
  weight_kg: z.number().positive().max(999),
  logged_at: z.string().datetime({ offset: true }).optional(),
  note: z.string().max(500).optional().nullable(),
  body_fat_pct: z.number().min(0).max(100).optional().nullable(),
  waist_cm: z.number().positive().max(300).optional().nullable(),
})

export const EntryUpdateSchema = EntryCreateSchema.partial()

export const GoalCreateSchema = z.object({
  start_weight_kg: z.number().positive().max(999),
  goal_weight_kg: z.number().positive().max(999),
  target_date: z.string().date().optional().nullable(),
})

export const GoalUpdateSchema = GoalCreateSchema.partial()

export const ProfileUpdateSchema = z.object({
  height_cm: z.number().min(50).max(300).optional().nullable(),
  preferred_unit: z.enum(['kg', 'lb']).optional(),
  display_name: z.string().max(100).optional().nullable(),
})
