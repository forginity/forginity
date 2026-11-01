"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export interface OtpInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  className?: string
  error?: boolean
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  className,
  error = false,
}: OtpInputProps) {
  const [digits, setDigits] = React.useState<string[]>(() => {
    const arr = Array(length).fill("")
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i]
    }
    return arr
  })
  const [activeIndex, setActiveIndex] = React.useState<number>(0)
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    const arr = Array(length).fill("")
    for (let i = 0; i < Math.min(value.length, length); i++) {
      arr[i] = value[i]
    }
    setDigits(arr)
  }, [value, length])

  const handleChange = (index: number, char: string) => {
    if (disabled) return
    const numeric = char.replace(/\D/g, "")
    if (!numeric && char !== "") return

    const newDigits = [...digits]
    // Handle multi-character paste
    if (numeric.length > 1) {
      const pastedChars = numeric.slice(0, length - index).split("")
      pastedChars.forEach((c, i) => {
        if (index + i < length) {
          newDigits[index + i] = c
        }
      })
      setDigits(newDigits)
      const combined = newDigits.join("")
      onChange?.(combined)
      if (combined.length === length) {
        onComplete?.(combined)
      }
      const nextFocus = Math.min(index + pastedChars.length, length - 1)
      inputsRef.current[nextFocus]?.focus()
      setActiveIndex(nextFocus)
      return
    }

    newDigits[index] = numeric
    setDigits(newDigits)
    const combined = newDigits.join("")
    onChange?.(combined)

    if (numeric && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }

    if (combined.length === length && !newDigits.includes("")) {
      onComplete?.(combined)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const newDigits = [...digits]
        newDigits[index - 1] = ""
        setDigits(newDigits)
        onChange?.(newDigits.join(""))
        inputsRef.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      } else {
        const newDigits = [...digits]
        newDigits[index] = ""
        setDigits(newDigits)
        onChange?.(newDigits.join(""))
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = activeIndex === index
        const digit = digits[index] || ""
        return (
          <div
            key={index}
            className={cn(
              "relative flex size-13 sm:size-[76px] items-center justify-center rounded-[14px] sm:rounded-[16px] border border-[#292929] bg-[#141414] transition-all",
              isFocused && "border-[#FF6347] ring-1 ring-[#FF6347]/30",
              error && "border-[#D94F2E]",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            <input
              ref={(el) => {
                inputsRef.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={length}
              value={digit}
              disabled={disabled}
              onFocus={() => setActiveIndex(index)}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="absolute inset-0 size-full bg-transparent text-center text-xl sm:text-[28px] font-normal text-[#F6F6F6] outline-none caret-transparent"
              aria-label={`Digit ${index + 1}`}
            />
            {!digit && isFocused && (
              <span className="h-6 w-0.5 bg-[#FF6347] animate-pulse pointer-events-none" />
            )}
          </div>
        )
      })}
    </div>
  )
}
