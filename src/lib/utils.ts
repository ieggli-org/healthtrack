import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function displayWeight(kg: number, unit: 'kg' | 'lb'): number {
  if (unit === 'lb') return Math.round(kg * 2.20462 * 10) / 10
  return Math.round(kg * 10) / 10
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  return `${displayWeight(kg, unit)} ${unit}`
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function lbToKg(lb: number): number {
  return Math.round(lb * 0.453592 * 1000) / 1000
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}
