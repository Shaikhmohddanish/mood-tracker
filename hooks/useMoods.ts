"use client"

import { useState, useCallback } from 'react'
import { moodsApi, type MoodData, type CreateMoodRequest, type UpdateMoodRequest, type MoodQueryParams } from '@/lib/api'
import { toast } from 'sonner'

interface UseMoodsReturn {
  moods: MoodData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  } | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchMoods: (params?: MoodQueryParams) => Promise<void>
  createMood: (data: CreateMoodRequest) => Promise<MoodData | null>
  updateMood: (id: string, data: UpdateMoodRequest) => Promise<MoodData | null>
  deleteMood: (id: string) => Promise<boolean>
  
  // Optimistic updates
  addOptimisticMood: (mood: MoodData) => void
  updateOptimisticMood: (id: string, updates: Partial<MoodData>) => void
  removeOptimisticMood: (id: string) => void
}

export function useMoods(): UseMoodsReturn {
  const [moods, setMoods] = useState<MoodData[]>([])
  const [pagination, setPagination] = useState<UseMoodsReturn['pagination']>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMoods = useCallback(async (params?: MoodQueryParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await moodsApi.list(params)
      setMoods(response.moods)
      setPagination(response.pagination)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch moods'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createMood = useCallback(async (data: CreateMoodRequest): Promise<MoodData | null> => {
    setError(null)
    
    try {
      const newMood = await moodsApi.create(data)
      
      // Add to the beginning of the list
      setMoods(prev => [newMood, ...prev])
      
      toast.success('Mood saved successfully!')
      return newMood
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to save mood'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  const updateMood = useCallback(async (id: string, data: UpdateMoodRequest): Promise<MoodData | null> => {
    setError(null)
    
    try {
      const updatedMood = await moodsApi.update(id, data)
      
      // Update in the list
      setMoods(prev => prev.map(mood => 
        mood.id === id ? updatedMood : mood
      ))
      
      toast.success('Mood updated successfully!')
      return updatedMood
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to update mood'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  const deleteMood = useCallback(async (id: string): Promise<boolean> => {
    setError(null)
    
    try {
      await moodsApi.delete(id)
      
      // Remove from the list
      setMoods(prev => prev.filter(mood => mood.id !== id))
      
      toast.success('Mood deleted successfully!')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to delete mood'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }, [])

  // Optimistic update helpers
  const addOptimisticMood = useCallback((mood: MoodData) => {
    setMoods(prev => [mood, ...prev])
  }, [])

  const updateOptimisticMood = useCallback((id: string, updates: Partial<MoodData>) => {
    setMoods(prev => prev.map(mood => 
      mood.id === id ? { ...mood, ...updates } : mood
    ))
  }, [])

  const removeOptimisticMood = useCallback((id: string) => {
    setMoods(prev => prev.filter(mood => mood.id !== id))
  }, [])

  return {
    moods,
    pagination,
    isLoading,
    error,
    fetchMoods,
    createMood,
    updateMood,
    deleteMood,
    addOptimisticMood,
    updateOptimisticMood,
    removeOptimisticMood
  }
}