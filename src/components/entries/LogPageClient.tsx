'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEntries } from '@/hooks/useEntries'
import { EntryTable } from './EntryTable'
import { EntryForm } from './EntryForm'
import { CsvImport } from './CsvImport'

interface Entry {
  id: string
  weight_kg: number
  logged_at: string
  note?: string | null
  body_fat_pct?: number | null
  waist_cm?: number | null
}

export function LogPageClient() {
  const { data, isLoading, isError } = useEntries()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const entries: Entry[] = (data?.entries as Entry[]) ?? []

  const handleAddClick = () => {
    setEditingEntry(null)
    setFormOpen(true)
  }

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setEditingEntry(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Entry Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your weight entries over time
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* CSV Import */}
      <CsvImport />

      {/* Table */}
      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading entries…</div>
      ) : isError ? (
        <div className="py-12 text-center text-destructive">
          Failed to load entries. Please refresh the page.
        </div>
      ) : (
        <EntryTable entries={entries} onEdit={handleEdit} />
      )}

      {/* Add / Edit modal */}
      <EntryForm open={formOpen} onClose={handleClose} entry={editingEntry} />
    </div>
  )
}
