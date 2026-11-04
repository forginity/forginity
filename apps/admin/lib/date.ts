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

/**
 * Format ISO date string into human-readable date & time: "DD Mon YYYY, HH:mm" (e.g. "30 Oct 2026, 14:00").
 */
export function formatDisplayDateTime(dateString?: string | null): string {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "—"

  const day = date.getDate()
  const month = date.toLocaleDateString("en-US", { month: "short" })
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day} ${month} ${year}, ${hours}:${minutes}`
}

/**
 * Converts a Date or ISO string to the "YYYY-MM-DDTHH:mm" format required by <input type="datetime-local" />.
 */
export function toInputDateTime(dateInput?: Date | string | null): string {
  const date = dateInput ? new Date(dateInput) : new Date()
  if (isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
