'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDeleteEntry } from '@/hooks/useEntries'
import { useUnits } from '@/store/units'
import { displayWeight, formatDate } from '@/lib/utils'

interface Entry {
  id: string
  weight_kg: number
  logged_at: string
  note?: string | null
  body_fat_pct?: number | null
  waist_cm?: number | null
}

interface EntryTableProps {
  entries: Entry[]
  onEdit: (entry: Entry) => void
}

export function EntryTable({ entries, onEdit }: EntryTableProps) {
  const { unit } = useUnits()
  const deleteEntry = useDeleteEntry()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const sorted = [...entries].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return
    try {
      await deleteEntry.mutateAsync(confirmDeleteId)
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete entry')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No entries yet. Add your first weight entry above.
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Weight ({unit})
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Body Fat %</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Note</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((entry) => (
              <tr key={entry.id} className="bg-surface hover:bg-surface-2 transition-colors">
                <td className="px-4 py-3 text-body">{formatDate(entry.logged_at)}</td>
                <td className="px-4 py-3 font-medium text-heading">
                  {displayWeight(entry.weight_kg, unit)}
                </td>
                <td className="px-4 py-3 text-body">
                  {entry.body_fat_pct != null ? `${entry.body_fat_pct}%` : '—'}
                </td>
                <td className="px-4 py-3 text-body">
                  {entry.note ? (
                    entry.note.length > 40 ? `${entry.note.slice(0, 40)}…` : entry.note
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(entry)}
                      aria-label="Edit entry"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(entry.id)}
                      aria-label="Delete entry"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-sm rounded-lg border border-border bg-surface p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-heading">Delete entry?</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteEntry.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteEntry.isPending}
              >
                {deleteEntry.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
