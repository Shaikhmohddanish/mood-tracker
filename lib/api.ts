import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error("Failed to get token from localStorage:", error)
    }
  }
  return config
})

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export interface VerifyResponse {
  user: {
    id: string
    username: string
    email: string
  }
}

export interface MoodData {
  id: string
  mood: string
  note?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface MoodsListResponse {
  moods: MoodData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface MoodStatsResponse {
  byDate: { date: string; count: number; topMood: string | null }[]
  distribution: Record<string, number>
  streak: { currentStreak: number; longestStreak: number }
  last30: { date: string; hasEntry: number }[]
}

export interface CreateMoodRequest {
  mood: string
  note?: string
  date?: string
}

export interface UpdateMoodRequest {
  mood?: string
  note?: string
  date?: string
}

export interface MoodQueryParams {
  page?: number
  limit?: number
  from?: string
  to?: string
  mood?: string
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data)
    return response.data
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data)
    return response.data
  },

  verifyToken: async (): Promise<VerifyResponse> => {
    const response = await api.post<VerifyResponse>("/auth/verify")
    return response.data
  },
}

export const moodsApi = {
  list: async (params?: MoodQueryParams) => {
    const response = await api.get<{ ok: boolean; data: MoodsListResponse }>("/moods", { params })
    return response.data.data
  },

  create: async (data: CreateMoodRequest) => {
    const response = await api.post<{ ok: boolean; data: MoodData }>("/moods", data)
    return response.data.data
  },

  get: async (id: string) => {
    const response = await api.get<{ ok: boolean; data: MoodData }>(`/moods/${id}`)
    return response.data.data
  },

  update: async (id: string, data: UpdateMoodRequest) => {
    const response = await api.put<{ ok: boolean; data: MoodData }>(`/moods/${id}`, data)
    return response.data.data
  },

  delete: async (id: string) => {
    const response = await api.delete<{ ok: boolean; data: { message: string } }>(`/moods/${id}`)
    return response.data.data
  },

  stats: async () => {
    const response = await api.get<{ ok: boolean; data: MoodStatsResponse }>("/moods/stats")
    return response.data.data
  },
}
