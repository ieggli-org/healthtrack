'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Entry } from '@/types/app'

interface EntryParams {
  from?: string
  to?: string
  limit?: number
}

async function fetchEntries(params: EntryParams = {}) {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  if (params.limit) search.set('limit', String(params.limit))
  const res = await fetch(`/api/entries?${search}`)
  if (!res.ok) throw new Error('Failed to fetch entries')
  return res.json() as Promise<{ entries: Entry[] }>
}

export function useEntries(params: EntryParams = {}) {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => fetchEntries(params),
  })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create entry')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update entry')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete entry')
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useImportEntries() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/entries/import', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Failed to import entries')
      return res.json() as Promise<{ imported: number; errors: string[] }>
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
