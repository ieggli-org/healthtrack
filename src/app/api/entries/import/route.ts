import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { getUser } from '@/lib/supabase/server'
import { lbToKg } from '@/lib/utils'

const MAX_ROWS = 1000

interface CsvRow {
  date?: string
  weight?: string
  unit?: string
  note?: string
  body_fat?: string
  waist?: string
  [key: string]: string | undefined
}

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof getUser>>
  try {
    auth = await getUser()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { supabase, user } = auth

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const csvText = await (file as File).text()

  const { data: rows, errors: parseErrors } = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.toLowerCase().trim(),
  })

  if (parseErrors.length > 0) {
    return NextResponse.json(
      { error: 'CSV parse error', details: parseErrors.map(e => e.message) },
      { status: 400 }
    )
  }

  if (rows.length > MAX_ROWS) {
    return NextResponse.json(
      { error: `CSV exceeds maximum of ${MAX_ROWS} rows` },
      { status: 400 }
    )
  }

  const validRows: {
    user_id: string
    weight_kg: number
    logged_at: string
    note: string | null
    body_fat_pct: number | null
    waist_cm: number | null
  }[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const rowNum = i + 2  // 1-indexed + header row

    // Weight is required
    const rawWeight = row.weight?.trim()
    if (!rawWeight) {
      errors.push(`Row ${rowNum}: missing weight`)
      return
    }

    const weightNum = parseFloat(rawWeight)
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 999) {
      errors.push(`Row ${rowNum}: invalid weight "${rawWeight}"`)
      return
    }

    // Convert to kg
    const unit = (row.unit?.trim().toLowerCase() ?? 'kg')
    const weight_kg = unit === 'lb' ? lbToKg(weightNum) : weightNum

    // Date is optional (default to now)
    let logged_at = new Date().toISOString()
    if (row.date?.trim()) {
      const parsed = new Date(row.date.trim())
      if (isNaN(parsed.getTime())) {
        errors.push(`Row ${rowNum}: invalid date "${row.date}"`)
        return
      }
      logged_at = parsed.toISOString()
    }

    // Optional fields
    const body_fat_pct = row.body_fat?.trim()
      ? parseFloat(row.body_fat.trim())
      : null
    const waist_cm = row.waist?.trim()
      ? parseFloat(row.waist.trim())
      : null

    validRows.push({
      user_id: user.id,
      weight_kg: Math.round(weight_kg * 1000) / 1000,
      logged_at,
      note: row.note?.trim() || null,
      body_fat_pct: body_fat_pct !== null && !isNaN(body_fat_pct) ? body_fat_pct : null,
      waist_cm: waist_cm !== null && !isNaN(waist_cm) ? waist_cm : null,
    })
  })

  if (validRows.length > 0) {
    const { error: insertError } = await supabase
      .from('weight_entries')
      .insert(validRows)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ imported: validRows.length, errors })
}
