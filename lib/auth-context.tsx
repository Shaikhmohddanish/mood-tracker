"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { safeLocalStorageSet, safeLocalStorageGet, safeLocalStorageRemove, clearOldAuthData } from "@/lib/storage-utils"

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth data on mount and verify token
    const initAuth = async () => {
      const storedToken = safeLocalStorageGet("token")
      
      if (storedToken) {
        try {
          // Verify token with server
          const response = await authApi.verifyToken()
          setToken(storedToken)
          setUser(response.user)
        } catch (error) {
          // Token is invalid, clear stored data
          safeLocalStorageRemove("token")
          safeLocalStorageRemove("user")
          console.error("Token verification failed:", error)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = (newToken: string, newUser: User) => {
    try {
      // Clear existing data first to free up space
      safeLocalStorageRemove("token")
      safeLocalStorageRemove("user")
      
      // Set new data with safe storage
      const tokenSaved = safeLocalStorageSet("token", newToken)
      const userSaved = safeLocalStorageSet("user", JSON.stringify(newUser))
      
      // Update state
      setToken(newToken)
      setUser(newUser)
      
      // Show warning if storage failed but continue with session-only auth
      if (!tokenSaved || !userSaved) {
        console.warn("Authentication data could not be saved to localStorage")
      }
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to save authentication data:", error)
      
      // Clear potentially corrupted data and try to clean up storage
      clearOldAuthData()
      
      // Still set state for session-only auth
      setToken(newToken)
      setUser(newUser)
      router.push("/dashboard")
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    safeLocalStorageRemove("token")
    safeLocalStorageRemove("user")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
