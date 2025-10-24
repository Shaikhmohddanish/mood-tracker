"use client"

import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MoodSelect } from "./MoodSelect"
import { getTodayString, formatDateForDisplay } from "@/lib/format"
import type { CreateMoodRequest, UpdateMoodRequest } from "@/lib/api"

interface MoodFormProps {
  onSubmit: (data: CreateMoodRequest | UpdateMoodRequest) => Promise<void>
  initialData?: {
    mood?: string
    note?: string
    date?: string
  }
  isLoading?: boolean
  title?: string
  description?: string
  submitText?: string
}

export function MoodForm({
  onSubmit,
  initialData,
  isLoading = false,
  title = "Add Mood Entry",
  description = "How are you feeling?",
  submitText = "Save Mood"
}: MoodFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      mood: initialData?.mood || "",
      note: initialData?.note || "",
      date: initialData?.date || getTodayString()
    }
  })

  const selectedMood = watch("mood")
  const selectedDate = watch("date")

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit({
        mood: data.mood,
        note: data.note || undefined,
        date: data.date
      })
      
      // Reset form only if creating new mood (no initial data)
      if (!initialData) {
        reset({
          mood: "",
          note: "",
          date: getTodayString()
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {selectedDate && (
            <span className="text-sm font-normal text-muted-foreground">
              - {formatDateForDisplay(selectedDate)}
            </span>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <MoodSelect
            value={selectedMood}
            onValueChange={(value) => setValue("mood", value)}
            error={errors.mood?.message}
          />

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Add a note (optional)
            </Label>
            <Textarea
              id="note"
              placeholder="What made you feel this way? Any thoughts you'd like to capture..."
              className="resize-none"
              rows={3}
              {...register("note", {
                maxLength: {
                  value: 300,
                  message: "Note cannot exceed 300 characters"
                }
              })}
            />
            {errors.note && (
              <p className="text-sm text-destructive">{errors.note.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              {...register("date", {
                required: "Date is required"
              })}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedMood}
          >
            {isLoading ? "Saving..." : submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}