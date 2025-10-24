"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Smile, RefreshCw, Filter, Plus } from "lucide-react"
import { clearOldAuthData, getStorageSize } from "@/lib/storage-utils"
import { useMoods } from "@/hooks/useMoods"
import { useStats } from "@/hooks/useStats"
import { MoodForm } from "@/components/MoodForm"
import { MoodCard } from "@/components/MoodCard"
import { StatsSummary } from "@/components/StatsSummary"
import { MoodCharts } from "@/components/MoodCharts"
import { EmptyState } from "@/components/EmptyState"
import { LoadingSkeleton, MoodCardSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton"
import { getTodayString } from "@/lib/format"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)

  // Hooks for data management
  const {
    moods,
    pagination,
    isLoading: moodsLoading,
    fetchMoods,
    createMood,
    updateMood,
    deleteMood
  } = useMoods()

  const {
    stats,
    isLoading: statsLoading,
    fetchStats,
    refreshStats
  } = useStats()

  // Get today's mood entries (can be multiple now)
  const todaysMoods = moods.filter(mood => mood.date === getTodayString())

  const handleClearStorage = () => {
    try {
      const size = getStorageSize()
      clearOldAuthData()
      alert(`Cleared localStorage. Previous size: ${(size / 1024).toFixed(2)} KB`)
    } catch (error) {
      console.error("Error clearing storage:", error)
      alert("Error clearing storage. Check console for details.")
    }
  }

  const handleCreateMood = async (data: any) => {
    const result = await createMood(data)
    if (result) {
      setShowAddForm(false)
      // Refresh stats in background
      refreshStats()
    }
  }

  const handleUpdateMood = async (id: string, data: any) => {
    const result = await updateMood(id, data)
    if (result) {
      // Refresh stats in background
      refreshStats()
    }
  }

  const handleDeleteMood = async (id: string) => {
    const result = await deleteMood(id)
    if (result) {
      // Refresh stats in background
      refreshStats()
    }
  }

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchMoods({ limit: 10 })
      fetchStats()
    }
  }, [user, fetchMoods, fetchStats])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Smile className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">DailyMood</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.username}!</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearStorage} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Clear Storage
            </Button>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Forms and Today's Entry */}
          <div className="space-y-6 lg:col-span-1">
            {/* Add Mood Form or Today's Entries */}
            {todaysMoods.length === 0 && !showAddForm ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Smile className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">How are you feeling today?</h3>
                  <p className="mb-4 text-center text-sm text-muted-foreground">
                    Track your daily mood to build healthy emotional habits
                  </p>
                  <Button onClick={() => setShowAddForm(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Today's Mood
                  </Button>
                </CardContent>
              </Card>
            ) : showAddForm ? (
              <MoodForm
                onSubmit={handleCreateMood}
                isLoading={moodsLoading}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Today's Moods</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Entry
                  </Button>
                </div>
                {todaysMoods.map((mood) => (
                  <MoodCard
                    key={mood.id}
                    mood={mood}
                    onUpdate={handleUpdateMood}
                    onDelete={handleDeleteMood}
                    isLoading={moodsLoading}
                  />
                ))}
              </div>
            )}

            {/* Recent Moods */}
            {moods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Entries</CardTitle>
                  <CardDescription>Your latest mood logs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {moods.slice(0, 3).map((mood) => (
                    <MoodCard
                      key={mood.id}
                      mood={mood}
                      onUpdate={handleUpdateMood}
                      onDelete={handleDeleteMood}
                      isLoading={moodsLoading}
                    />
                  ))}
                  
                  {moods.length > 3 && (
                    <Button variant="outline" className="w-full" size="sm">
                      View All Entries
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Stats and Charts */}
          <div className="space-y-6 lg:col-span-2">
            {stats && !statsLoading ? (
              <>
                <StatsSummary stats={stats} />
                <MoodCharts stats={stats} />
              </>
            ) : statsLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-muted-foreground">Loading statistics...</span>
                  </div>
                </CardContent>
              </Card>
            ) : moods.length === 0 ? (
              <EmptyState
                title="Start Your Mood Journey"
                description="Add your first mood entry to see personalized insights, trends, and statistics about your emotional patterns."
                actionText="Add Your First Mood"
                onAction={() => setShowAddForm(true)}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
