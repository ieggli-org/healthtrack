'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries'
import { useUnits } from '@/store/units'
import { lbToKg, kgToLb } from '@/lib/utils'

interface Entry {
  id: string
  weight_kg: number
  logged_at: string
  note?: string | null
  body_fat_pct?: number | null
  waist_cm?: number | null
}

interface EntryFormProps {
  open: boolean
  onClose: () => void
  entry?: Entry | null
}

// Display schema — user enters weight in their preferred unit
const DisplayEntrySchema = z.object({
  weight: z
    .string()
    .min(1, 'Weight is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Must be a positive number'),
  logged_at: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
  body_fat_pct: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
      'Must be between 0 and 100'
    ),
  waist_cm: z
    .string()
    .optional()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) > 0 && Number(v) <= 300),
      'Must be between 0 and 300'
    ),
})

type DisplayEntryValues = z.infer<typeof DisplayEntrySchema>

function toLocalDatetimeString(isoString: string): string {
  try {
    const d = new Date(isoString)
    return format(d, "yyyy-MM-dd'T'HH:mm")
  } catch {
    return isoString
  }
}

function nowLocalDatetimeString(): string {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm")
}

export function EntryForm({ open, onClose, entry }: EntryFormProps) {
  const { unit } = useUnits()
  const createEntry = useCreateEntry()
  const updateEntry = useUpdateEntry()

  const isEditing = !!entry

  const form = useForm<DisplayEntryValues>({
    resolver: zodResolver(DisplayEntrySchema),
    defaultValues: {
      weight: '',
      logged_at: nowLocalDatetimeString(),
      note: '',
      body_fat_pct: '',
      waist_cm: '',
    },
  })

  // Populate form when editing an entry
  useEffect(() => {
    if (entry) {
      const displayW =
        unit === 'lb'
          ? String(kgToLb(entry.weight_kg))
          : String(Math.round(entry.weight_kg * 10) / 10)

      form.reset({
        weight: displayW,
        logged_at: toLocalDatetimeString(entry.logged_at),
        note: entry.note ?? '',
        body_fat_pct: entry.body_fat_pct != null ? String(entry.body_fat_pct) : '',
        waist_cm: entry.waist_cm != null ? String(entry.waist_cm) : '',
      })
    } else {
      form.reset({
        weight: '',
        logged_at: nowLocalDatetimeString(),
        note: '',
        body_fat_pct: '',
        waist_cm: '',
      })
    }
  }, [entry, unit, form])

  const onSubmit = async (values: DisplayEntryValues) => {
    const displayW = Number(values.weight)
    const weight_kg = unit === 'lb' ? lbToKg(displayW) : displayW

    // Convert datetime-local string to ISO with offset
    const logged_at = new Date(values.logged_at).toISOString()

    const payload = {
      weight_kg,
      logged_at,
      note: values.note || null,
      body_fat_pct: values.body_fat_pct ? Number(values.body_fat_pct) : null,
      waist_cm: values.waist_cm ? Number(values.waist_cm) : null,
    }

    try {
      if (isEditing && entry) {
        await updateEntry.mutateAsync({ id: entry.id, data: payload })
        toast.success('Entry updated')
      } else {
        await createEntry.mutateAsync(payload)
        toast.success('Entry added')
      }
      onClose()
    } catch {
      toast.error(isEditing ? 'Failed to update entry' : 'Failed to add entry')
    }
  }

  const isPending = createEntry.isPending || updateEntry.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Weight */}
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight ({unit})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder={unit === 'kg' ? 'e.g. 75.5' : 'e.g. 166.4'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date/Time */}
            <FormField
              control={form.control}
              name="logged_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add a note…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Body fat % */}
              <FormField
                control={form.control}
                name="body_fat_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Fat % (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        placeholder="e.g. 18.5"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Waist cm */}
              <FormField
                control={form.control}
                name="waist_cm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waist cm (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="300"
                        placeholder="e.g. 85"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : isEditing ? 'Update' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
