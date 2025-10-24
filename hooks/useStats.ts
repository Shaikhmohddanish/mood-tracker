"use client"

import { useState, useCallback } from 'react'
import { moodsApi, type MoodStatsResponse } from '@/lib/api'
import { toast } from 'sonner'

interface UseStatsReturn {
  stats: MoodStatsResponse | null
  isLoading: boolean
  error: string | null
  fetchStats: () => Promise<void>
  refreshStats: () => Promise<void>
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<MoodStatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await moodsApi.stats()
      setStats(response)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to fetch statistics'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshStats = useCallback(async () => {
    // Refresh without showing loading state for background updates
    setError(null)
    
    try {
      const response = await moodsApi.stats()
      setStats(response)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to refresh statistics'
      setError(errorMessage)
      // Don't show toast for background refresh errors
    }
  }, [])

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    refreshStats
  }
}