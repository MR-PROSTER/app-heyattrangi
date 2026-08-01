/**
 * Personal-details helpers for Settings.
 */

export function phoneStorageKey(userId: string) {
  return `attrangi:profile-phone:${userId}`
}

export function pendingEmailKey(userId: string) {
  return `attrangi:pending-email:${userId}`
}

export function readLocal(key: string): string {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(key) || ""
  } catch {
    return ""
  }
}

export function writeLocal(key: string, value: string) {
  try {
    if (!value.trim()) localStorage.removeItem(key)
    else localStorage.setItem(key, value.trim())
  } catch {
    /* ignore */
  }
}

export function validateEmail(value: string): string | null {
  const t = value.trim()
  if (!t) return "Email is required"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "Enter a valid email address"
  if (t.length > 120) return "Email must be under 120 characters"
  return null
}
