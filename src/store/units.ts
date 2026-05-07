import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UnitsStore {
  unit: 'kg' | 'lb'
  toggle: () => void
  setUnit: (unit: 'kg' | 'lb') => void
}

export const useUnits = create<UnitsStore>()(
  persist(
    (set) => ({
      unit: 'kg',
      toggle: () => set((s) => ({ unit: s.unit === 'kg' ? 'lb' : 'kg' })),
      setUnit: (unit) => set({ unit }),
    }),
    { name: 'healthtrack-units' }
  )
)
