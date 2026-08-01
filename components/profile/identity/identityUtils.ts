/** Format relative "Last updated …" from a Date. */
export function formatRelativeUpdated(date: Date | string | null | undefined): string {
  if (!date) return "Never updated"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Never updated"

  const seconds = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000))
  if (seconds < 45) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/** e.g. "Member since July 2026" */
export function formatMemberSince(date: Date | string | null | undefined): string {
  if (!date) return "Member"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "Member"
  const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  return `Member since ${label}`
}

/** Human plan label from PlanType */
export function formatPlanLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "ESSENTIAL":
      return "Essential"
    case "PREMIUM":
      return "Premium"
    case "ORGANIZATION":
      return "Organization"
    case "FREE":
    default:
      return "Free"
  }
}

/** Short stable member id for display (full id available via title). */
export function formatMemberId(id: string): string {
  if (!id) return "—"
  if (id.length <= 12) return id.toUpperCase()
  return `${id.slice(0, 6)}…${id.slice(-4)}`.toUpperCase()
}

export function validateName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return "Full name is required"
  if (trimmed.length < 2) return "Name must be at least 2 characters"
  if (trimmed.length > 80) return "Name must be under 80 characters"
  return null
}

export function validateAge(value: string): string | null {
  if (!value.trim()) return null // optional
  const n = Number(value)
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "Enter a valid age"
  if (n < 1 || n > 120) return "Age must be between 1 and 120"
  return null
}

/** Accepts 10-digit IN numbers or E.164-ish +country formats. Empty is allowed. */
export function validatePhone(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[\s\-()]/g, "")
  if (/^\+?\d{10,15}$/.test(digits)) return null
  if (/^[6-9]\d{9}$/.test(digits)) return null
  return "Enter a valid phone number"
}

export function validateGender(value: string): string | null {
  if (!value) return null
  const allowed = ["Male", "Female", "Other", "Prefer not to say"]
  if (!allowed.includes(value)) return "Select a valid gender"
  return null
}
