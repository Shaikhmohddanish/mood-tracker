"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smile, Plus } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export function EmptyState({
  title = "No mood entries yet",
  description = "Start tracking your daily emotions to see patterns and insights over time.",
  actionText = "Add your first mood",
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          {icon || <Smile className="h-8 w-8 text-muted-foreground" />}
        </div>
        
        <CardTitle className="mb-2 text-lg">{title}</CardTitle>
        <CardDescription className="mb-6 max-w-sm">
          {description}
        </CardDescription>
        
        {onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}