import type React from "react"
import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({ label, error, id, ...props }, ref) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={inputId}
        ref={ref}
        className={error ? "border-destructive focus-visible:ring-destructive" : ""}
        {...props}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
})

InputField.displayName = "InputField"
