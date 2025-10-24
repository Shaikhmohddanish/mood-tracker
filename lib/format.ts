import { format, startOfDay, parseISO, isValid } from 'date-fns'
import type { MoodType } from './mood-constants'
import { MOOD_CONFIG } from './mood-constants'

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) {
    throw new Error('Invalid date')
  }
  
  // Format using UTC to avoid timezone shifts
  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Normalize date to start of day UTC
 */
export function normalizeToStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) {
    throw new Error('Invalid date')
  }
  // Create a new date in UTC to avoid timezone issues
  const normalized = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate())
  normalized.setUTCHours(0, 0, 0, 0)
  return normalized
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export function parseDateString(dateString: string): Date {
  // Parse the date string directly as UTC to avoid timezone shifts
  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) {
    throw new Error(`Invalid date string format: ${dateString}`)
  }
  
  // Create date directly in UTC (month is 0-indexed)
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  
  if (!isValid(date)) {
    throw new Error(`Invalid date string: ${dateString}`)
  }
  
  return date
}

/**
 * Get mood display info (emoji, label, color)
 */
export function getMoodInfo(mood: MoodType) {
  return MOOD_CONFIG[mood] || MOOD_CONFIG.neutral
}

/**
 * Get today's date as YYYY-MM-DD string (in local timezone)
 */
export function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayString()
}

/**
 * Format date for display (e.g., "Oct 24, 2025")
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) {
    return 'Invalid date'
  }
  return format(dateObj, 'MMM d, yyyy')
}

/**
 * Get date range for last N days
 */
export function getLastNDays(n: number): string[] {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    dates.push(formatDateString(date))
  }
  
  return dates
}