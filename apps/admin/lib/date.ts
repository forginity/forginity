/**
 * Format ISO date string into human-readable Figma spec display format: "DD Mon YYYY" (e.g. "30 Oct 2026").
 */
export function formatDisplayDate(dateString?: string | null): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "—"

  const day = date.getDate()
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}
