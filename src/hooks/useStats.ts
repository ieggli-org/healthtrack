'use client'

import { useQuery } from '@tanstack/react-query'

export function useStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['stats', from, to],
    queryFn: async () => {
      const search = new URLSearchParams()
      if (from) search.set('from', from)
      if (to) search.set('to', to)
      const res = await fetch(`/api/stats?${search}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    staleTime: 60_000,
    enabled: true,
  })
}
