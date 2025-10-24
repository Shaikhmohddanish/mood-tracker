"use client"

import { useEffect } from 'react'
import { clearOldAuthData, getStorageSize } from '@/lib/storage-utils'

export function StorageManager({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check localStorage health on app start
    try {
      const storageSize = getStorageSize()
      console.log(`LocalStorage size: ${(storageSize / 1024).toFixed(2)} KB`)
      
      // If storage is over 3MB, clean it up
      if (storageSize > 3 * 1024 * 1024) {
        console.warn('LocalStorage is large, cleaning up old data')
        clearOldAuthData()
      }
    } catch (error) {
      console.error('Error checking localStorage:', error)
      // If there's an error, try to clear everything
      clearOldAuthData()
    }
  }, [])

  return <>{children}</>
}