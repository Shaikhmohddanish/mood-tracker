import { z } from 'zod'
import { MOOD_VALUES } from './mood-constants'

// Mood creation schema
export const createMoodSchema = z.object({
  mood: z.enum(MOOD_VALUES as [string, ...string[]]),
  note: z.string().max(300, 'Note cannot exceed 300 characters').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})

// Mood update schema (all fields optional)
export const updateMoodSchema = z.object({
  mood: z.enum(MOOD_VALUES as [string, ...string[]]).optional(),
  note: z.string().max(300, 'Note cannot exceed 300 characters').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
})

// Query parameters schema for listing moods
export const moodQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  mood: z.enum(MOOD_VALUES as [string, ...string[]]).optional()
})

export type CreateMoodData = z.infer<typeof createMoodSchema>
export type UpdateMoodData = z.infer<typeof updateMoodSchema>
export type MoodQuery = z.infer<typeof moodQuerySchema>