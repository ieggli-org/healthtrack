'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useImportEntries } from '@/hooks/useEntries'

export function CsvImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importEntries = useImportEntries()
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }
    setResult(null)
    try {
      const data = await importEntries.mutateAsync(file)
      setResult(data)
      if (data.errors.length === 0) {
        toast.success(`${data.imported} ${data.imported === 1 ? 'entry' : 'entries'} imported`)
      } else {
        toast.warning(
          `${data.imported} imported, ${data.errors.length} error${data.errors.length > 1 ? 's' : ''}`
        )
      }
    } catch {
      toast.error('Import failed. Please check your CSV format.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so re-selecting same file triggers onChange
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-heading">Import from CSV</h2>
      <p className="mb-4 text-xs text-muted-foreground">
        CSV must have columns: <code className="text-body">weight_kg, logged_at</code>. Optional:{' '}
        <code className="text-body">note, body_fat_pct, waist_cm</code>.
      </p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-surface-2'
        }`}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag & drop a CSV file here, or{' '}
          <span className="font-medium text-primary">click to browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleChange}
          disabled={importEntries.isPending}
        />
      </div>

      {importEntries.isPending && (
        <p className="mt-3 text-sm text-muted-foreground">Importing…</p>
      )}

      {result && !importEntries.isPending && (
        <div className="mt-3 rounded-md border border-border bg-surface-2 p-3 text-sm">
          <p className="text-body">
            <span className="font-medium text-heading">{result.imported}</span>{' '}
            {result.imported === 1 ? 'entry' : 'entries'} imported
            {result.errors.length > 0 && (
              <span className="text-warning">
                {', '}
                {result.errors.length} error{result.errors.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {result.errors.slice(0, 5).map((err, i) => (
                <li key={i} className="text-xs text-destructive">
                  {err}
                </li>
              ))}
              {result.errors.length > 5 && (
                <li className="text-xs text-muted-foreground">
                  …and {result.errors.length - 5} more
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={importEntries.isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {importEntries.isPending ? 'Importing…' : 'Choose File'}
        </Button>
      </div>
    </div>
  )
}
