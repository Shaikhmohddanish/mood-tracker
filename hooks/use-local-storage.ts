"use client"

import { useState, useCallback } from 'react'
import { clearOldAuthData } from '@/lib/storage-utils'

interface StorageHookReturn {
  setItem: (key: string, value: string) => Promise<boolean>
  getItem: (key: string) => string | null
  removeItem: (key: string) => void
  clearStorage: () => void
  storageAvailable: boolean
}

export function useLocalStorage(): StorageHookReturn {
  const [storageAvailable, setStorageAvailable] = useState(true)

  const setItem = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error: any) {
      console.error(`LocalStorage setItem failed for key "${key}":`, error)
      
      if (error.name === 'QuotaExceededError') {
        // Try to clear old data and retry
        try {
          console.warn('LocalStorage quota exceeded, clearing old data...')
          clearOldAuthData()
          localStorage.setItem(key, value)
          return true
        } catch (retryError) {
          console.error('Failed to save even after clearing old data:', retryError)
          setStorageAvailable(false)
          return false
        }
      }
      
      setStorageAvailable(false)
      return false
    }
  }, [])

  const getItem = useCallback((key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`LocalStorage getItem failed for key "${key}":`, error)
      return null
    }
  }, [])

  const removeItem = useCallback((key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`LocalStorage removeItem failed for key "${key}":`, error)
    }
  }, [])

  const clearStorage = useCallback((): void => {
    try {
      localStorage.clear()
      setStorageAvailable(true)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }, [])

  return {
    setItem,
    getItem,
    removeItem,
    clearStorage,
    storageAvailable
  }
}