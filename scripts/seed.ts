#!/usr/bin/env tsx
/**
 * Dev seed script — populates 90 days of synthetic weight data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts <user-id>
 *
 * Prerequisites: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 * The user must already exist (sign in once via Google OAuth first).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local manually (tsx doesn't auto-load it)
function loadEnv() {
  try {
    const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of env.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local not found — rely on existing env vars
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Populate .env.local first (see .env.example)')
  process.exit(1)
}

const userId = process.argv[2]
if (!userId) {
  console.error('Usage: npx tsx scripts/seed.ts <user-id>')
  console.error('Get your user ID from: Supabase dashboard → Authentication → Users')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Synthetic data parameters
const DAYS = 90
const START_WEIGHT_KG = 92
const END_WEIGHT_KG = 86        // net -6 kg over 90 days (~0.067 kg/day)
const DAILY_NOISE = 0.6         // ±0.3 kg random daily variation
const LOG_RATE = 0.85           // 85% of days logged (realistic consistency)

function gaussian(mean: number, stddev: number): number {
  // Box-Muller transform
  const u = 1 - Math.random()
  const v = Math.random()
  return mean + stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function seed() {
  console.log(`Seeding 90 days of weight data for user: ${userId}`)

  const today = new Date()
  today.setHours(7, 30, 0, 0) // morning weigh-in time

  const entries: Array<{
    user_id: string
    weight_kg: number
    body_fat_pct: number | null
    waist_cm: number | null
    note: string | null
    logged_at: string
  }> = []

  const slope = (END_WEIGHT_KG - START_WEIGHT_KG) / DAYS

  for (let i = DAYS - 1; i >= 0; i--) {
    // Skip some days to simulate realistic logging behaviour
    if (Math.random() > LOG_RATE) continue

    const date = addDays(today, -i)
    const trend = START_WEIGHT_KG + slope * (DAYS - 1 - i)
    const weight = Math.max(50, parseFloat(gaussian(trend, DAILY_NOISE / 2).toFixed(2)))

    // Sparse body fat and waist data (logged ~30% of the time)
    const bodyFat = Math.random() < 0.3
      ? parseFloat(gaussian(22, 0.5).toFixed(1))
      : null

    const waist = Math.random() < 0.2
      ? parseFloat(gaussian(88, 1).toFixed(1))
      : null

    // Occasional notes
    const notes = [
      'Post-workout', 'After vacation', 'Feeling light', 'Heavy meal yesterday',
      'Slept well', 'Stressful week', null, null, null, null,
    ]
    const note = notes[Math.floor(Math.random() * notes.length)]

    // Vary the time slightly (6:30–8:30 AM)
    date.setMinutes(Math.floor(Math.random() * 120))

    entries.push({
      user_id: userId,
      weight_kg: weight,
      body_fat_pct: bodyFat,
      waist_cm: waist,
      note,
      logged_at: date.toISOString(),
    })
  }

  console.log(`Inserting ${entries.length} entries...`)

  const { error } = await supabase.from('weight_entries').insert(entries)

  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }

  // Upsert a profile with height for BMI calculation
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, height_cm: 178, preferred_unit: 'kg' }, { onConflict: 'id' })

  if (profileError) {
    console.warn('Profile upsert warning (non-fatal):', profileError.message)
  }

  // Create an active goal
  const { error: goalError } = await supabase.from('goals').insert({
    user_id: userId,
    start_weight_kg: START_WEIGHT_KG,
    goal_weight_kg: 82,
    target_date: addDays(today, 60).toISOString().slice(0, 10),
    is_active: true,
  })

  if (goalError) {
    console.warn('Goal insert warning (non-fatal):', goalError.message)
  }

  console.log(`✓ Seeded ${entries.length} weight entries`)
  console.log(`✓ Profile set (height: 178 cm)`)
  console.log(`✓ Active goal: 82 kg by ${addDays(today, 60).toISOString().slice(0, 10)}`)
  console.log('\nOpen http://localhost:3000/dashboard to see your data.')
}

seed()
