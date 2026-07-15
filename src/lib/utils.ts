import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function progressColor(percentage: number) {
  if (percentage < 50) return '#3b82f6'
  if (percentage < 80) return '#f59e0b'
  return '#ef4444'
}

export function tempColor(temp: number) {
  if (temp < 60) return '#22c55e'
  if (temp < 80) return '#f59e0b'
  return '#ef4444'
}

export function formatNumber(num: number | null | undefined, digits = 2) {
  const value = typeof num === 'number' && Number.isFinite(num) ? num : 0
  return value.toFixed(digits)
}

export function toNumber(num: number | null | undefined, fallback = 0) {
  return typeof num === 'number' && Number.isFinite(num) ? num : fallback
}
