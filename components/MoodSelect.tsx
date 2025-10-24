"use client"

import { forwardRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getMoodInfo } from "@/lib/format"
import { MOOD_VALUES, MoodType } from "@/lib/mood-constants"

interface MoodSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
}

export const MoodSelect = forwardRef<HTMLButtonElement, MoodSelectProps>(
  ({ value, onValueChange, label = "How are you feeling?", placeholder = "Select your mood", error }, ref) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger 
            ref={ref}
            className={error ? "border-destructive focus-visible:ring-destructive" : ""}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {MOOD_VALUES.map((mood) => {
              const info = getMoodInfo(mood as MoodType)
              return (
                <SelectItem key={mood} value={mood}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.emoji}</span>
                    <span>{info.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)

MoodSelect.displayName = "MoodSelect"