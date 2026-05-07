'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEntries } from '@/hooks/useEntries'
import { EntryTable } from './EntryTable'
import { EntryForm } from './EntryForm'
import { CsvImport } from './CsvImport'
import type { Entry } from '@/types/app'

export function LogPageClient() {
  const { data, isLoading, isError } = useEntries()
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const entries: Entry[] = data?.entries ?? []

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
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center bg-surface border border-border rounded-2xl">
          <p className="text-muted text-sm">No entries yet. Start tracking your weight today.</p>
          <Button onClick={handleAddClick}>Add your first entry</Button>
        </div>
      ) : (
        <EntryTable entries={entries} onEdit={handleEdit} />
      )}

      {/* Add / Edit modal */}
      <EntryForm open={formOpen} onClose={handleClose} entry={editingEntry} />
    </div>
  )
}
