'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useEntries } from '@/hooks/useEntries'
import { useUnits } from '@/store/units'
import { createBrowserClient } from '@/lib/supabase/client'

export function SettingsPageClient() {
  const supabase = createBrowserClient()
  const [user, setUser] = useState<any>(null)
  const { data: profileData } = useProfile()
  const { data: entriesData } = useEntries({ limit: 500 })
  const updateProfile = useUpdateProfile()
  const { unit, setUnit } = useUnits()
  const [height, setHeight] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  useEffect(() => {
    if ((profileData?.profile as any)?.height_cm) {
      setHeight(String((profileData?.profile as any).height_cm))
    }
  }, [profileData])

  const saveHeight = async () => {
    const heightNum = parseFloat(height)
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      toast.error('Height must be between 50 and 300 cm')
      return
    }
    await updateProfile.mutateAsync({ height_cm: heightNum })
    toast.success('Height saved')
  }

  const saveUnit = async (newUnit: 'kg' | 'lb') => {
    setUnit(newUnit)
    await updateProfile.mutateAsync({ preferred_unit: newUnit })
    toast.success(`Unit set to ${newUnit}`)
  }

  const exportCSV = () => {
    const entries = (entriesData?.entries ?? []) as Array<{
      logged_at: string
      weight_kg: number
      body_fat_pct?: number | null
      waist_cm?: number | null
      note?: string | null
    }>
    const csv = Papa.unparse(
      entries.map(e => ({
        date: e.logged_at,
        weight_kg: e.weight_kg,
        body_fat_pct: e.body_fat_pct ?? '',
        waist_cm: e.waist_cm ?? '',
        note: e.note ?? '',
      }))
    )
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `healthtrack-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = (user?.user_metadata?.full_name as string) ?? user?.email ?? ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-lg font-medium text-heading">Settings</h2>
        <p className="text-sm text-muted mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-heading">Profile</h3>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-heading">{displayName}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="space-y-2">
          <Label htmlFor="height" className="text-body text-sm">Height (cm)</Label>
          <div className="flex gap-2">
            <Input
              id="height"
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="w-32 bg-surface-2 border-border text-heading"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={saveHeight}
              disabled={updateProfile.isPending}
              className="border-border text-body hover:text-heading"
            >
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-muted">Used to calculate BMI</p>
        </div>
      </section>

      {/* Units */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-heading">Units</h3>
        <div className="flex gap-2">
          {(['kg', 'lb'] as const).map(u => (
            <button
              key={u}
              onClick={() => saveUnit(u)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                unit === u
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-muted hover:text-body border border-border'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">All weight values are stored in kg and displayed in your preferred unit.</p>
      </section>

      {/* Data export */}
      <section className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-medium text-heading">Data</h3>
        <Button
          variant="outline"
          onClick={exportCSV}
          className="border-border text-body hover:text-heading"
        >
          <Download className="mr-2 h-4 w-4" />
          Export all data as CSV
        </Button>
        <p className="text-xs text-muted">Downloads all your weight entries as a CSV file.</p>
      </section>
    </div>
  )
}
