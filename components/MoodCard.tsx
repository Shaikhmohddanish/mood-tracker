"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar } from "lucide-react"
import { getMoodInfo, formatDateForDisplay, isToday } from "@/lib/format"
import { MoodForm } from "./MoodForm"
import type { MoodData, UpdateMoodRequest } from "@/lib/api"
import type { MoodType } from "@/lib/models/Mood"

interface MoodCardProps {
  mood: MoodData
  onUpdate: (id: string, data: UpdateMoodRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export function MoodCard({ mood, onUpdate, onDelete, isLoading = false }: MoodCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const moodInfo = getMoodInfo(mood.mood as MoodType)
  const todayEntry = isToday(mood.date)

  const handleUpdate = async (data: UpdateMoodRequest) => {
    try {
      await onUpdate(mood.id, data)
      setIsEditing(false)
    } catch (error) {
      console.error("Update error:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this mood entry?")) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(mood.id)
    } catch (error) {
      console.error("Delete error:", error)
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <MoodForm
        onSubmit={handleUpdate}
        initialData={{
          mood: mood.mood,
          note: mood.note,
          date: mood.date
        }}
        isLoading={isLoading}
        title="Edit Mood"
        description="Update your mood entry"
        submitText="Update Mood"
      />
    )
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{moodInfo.emoji}</span>
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>{moodInfo.label}</span>
                {todayEntry && (
                  <Badge variant="secondary" className="text-xs">
                    Today
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Calendar className="h-3 w-3" />
                {formatDateForDisplay(mood.date)}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isLoading || isDeleting}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {mood.note && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground italic">
              "{mood.note}"
            </p>
          </div>
        </CardContent>
      )}

      {isDeleting && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">Deleting...</span>
          </div>
        </div>
      )}
    </Card>
  )
}