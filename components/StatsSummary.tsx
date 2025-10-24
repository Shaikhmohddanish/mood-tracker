"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, Target } from "lucide-react"
import type { MoodStatsResponse } from "@/lib/api"

interface StatsSummaryProps {
  stats: MoodStatsResponse
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const totalEntries = Object.values(stats.distribution).reduce((sum, count) => sum + count, 0)
  const activeDays = stats.last30.filter(day => day.hasEntry === 1).length

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streak.currentStreak}</div>
          <p className="text-xs text-muted-foreground">
            {stats.streak.currentStreak === 1 ? 'day' : 'days'} in a row
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.streak.longestStreak}</div>
          <p className="text-xs text-muted-foreground">
            Personal best
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity (30 days)</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeDays}/30</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((activeDays / 30) * 100)}% consistency
          </p>
        </CardContent>
      </Card>

      {totalEntries > 0 && (
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mood Distribution</CardTitle>
            <CardDescription>Your overall mood patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.distribution)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([mood, count]) => {
                  const percentage = Math.round((count / totalEntries) * 100)
                  return (
                    <Badge key={mood} variant="secondary" className="text-xs">
                      {mood} {percentage}%
                    </Badge>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}