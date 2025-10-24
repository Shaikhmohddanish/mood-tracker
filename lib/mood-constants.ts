// Mood types and constants - separated from model to avoid loading issues

export type MoodType = 'happy' | 'neutral' | 'sad' | 'stressed' | 'excited' | 'tired'

export const MOOD_VALUES: MoodType[] = ['happy', 'neutral', 'sad', 'stressed', 'excited', 'tired']

export const MOOD_CONFIG = {
  happy: { emoji: '😊', label: 'Happy', color: '#10B981' },
  neutral: { emoji: '😐', label: 'Neutral', color: '#6B7280' },
  sad: { emoji: '😢', label: 'Sad', color: '#3B82F6' },
  stressed: { emoji: '😰', label: 'Stressed', color: '#F59E0B' },
  excited: { emoji: '🤩', label: 'Excited', color: '#8B5CF6' },
  tired: { emoji: '😴', label: 'Tired', color: '#6B7280' }
} as const