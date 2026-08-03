/**
 * Persist recently-read article ids across /patient/library and /read/[slug].
 */

const STORAGE_KEY = "heyattrangi.recentlyReadIds"
const MAX_ITEMS = 8

export function getRecentlyReadIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

export function markRecentlyReadId(id: string): void {
  if (typeof window === "undefined") return
  const trimmed = id.trim()
  if (!trimmed) return
  try {
    const prev = getRecentlyReadIds()
    const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, MAX_ITEMS)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }
}
