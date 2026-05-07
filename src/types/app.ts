export interface Entry {
  id: string
  user_id?: string
  weight_kg: number
  body_fat_pct?: number | null
  waist_cm?: number | null
  note?: string | null
  logged_at: string
  created_at?: string
  updated_at?: string
}
