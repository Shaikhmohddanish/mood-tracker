/**
 * Utility functions for localStorage management
 */

export const clearOldAuthData = () => {
  try {
    // Remove any old or corrupted auth data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // You can also clear other app-specific data if needed
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('dailymood-') || key.includes('auth')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}

export const getStorageSize = () => {
  try {
    let total = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  } catch (error) {
    console.error("Error calculating storage size:", error)
    return 0
  }
}

export const safeLocalStorageSet = (key: string, value: string): boolean => {
  try {
    // Check if we're close to quota (roughly 5MB limit in most browsers)
    const currentSize = getStorageSize()
    const newDataSize = key.length + value.length
    
    // If adding new data would exceed ~4MB, clear old data first
    if (currentSize + newDataSize > 4 * 1024 * 1024) {
      console.warn("localStorage is near capacity, clearing old data")
      clearOldAuthData()
    }
    
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`Failed to set localStorage item ${key}:`, error)
    return false
  }
}

export const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Failed to get localStorage item ${key}:`, error)
    return null
  }
}

export const safeLocalStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove localStorage item ${key}:`, error)
  }
}