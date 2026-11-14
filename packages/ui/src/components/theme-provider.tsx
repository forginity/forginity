"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// Suppress React 19 / Next.js 16 false-positive warning for next-themes' inline script tag
if (process.env.NODE_ENV === "development") {
  const originalError = console.error
  if (!(originalError as unknown as { __scriptTagWarningSuppressed?: boolean }).__scriptTagWarningSuppressed) {
    const wrappedError = (...args: unknown[]) => {
      const message = typeof args[0] === "string" ? args[0] : (args[0] as { message?: string })?.message || ""
      if (typeof message === "string" && message.includes("Encountered a script tag")) {
        return
      }
      originalError.apply(console, args)
    }
    ;(wrappedError as unknown as { __scriptTagWarningSuppressed?: boolean }).__scriptTagWarningSuppressed = true
    console.error = wrappedError
  }
}

export { useTheme }

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}
