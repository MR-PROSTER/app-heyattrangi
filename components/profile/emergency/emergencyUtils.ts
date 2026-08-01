export const RELATIONSHIP_OPTIONS = [
  { value: "Parent", label: "Parent" },
  { value: "Mother", label: "Mother" },
  { value: "Father", label: "Father" },
  { value: "Guardian", label: "Guardian" },
  { value: "Sibling", label: "Sibling" },
  { value: "Friend", label: "Friend" },
  { value: "Partner", label: "Partner" },
  { value: "Other", label: "Other" },
] as const

export type RelationshipValue = (typeof RELATIONSHIP_OPTIONS)[number]["value"]

export function validateEmergencyName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return "Contact name is required"
  if (trimmed.length < 2) return "Name must be at least 2 characters"
  if (trimmed.length > 80) return "Name must be under 80 characters"
  return null
}

/** Indian mobile: 10 digits starting 6–9, optional +91 / 0 prefix. Empty allowed. */
export function validateIndianMobile(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const digits = trimmed.replace(/[\s\-()]/g, "")
  let national = digits
  if (national.startsWith("+91")) national = national.slice(3)
  else if (national.startsWith("91") && national.length === 12) national = national.slice(2)
  else if (national.startsWith("0") && national.length === 11) national = national.slice(1)

  if (!/^[6-9]\d{9}$/.test(national)) {
    return "Enter a valid Indian mobile number"
  }
  return null
}

export function validateRelationship(value: string): string | null {
  if (!value) return null
  if (!RELATIONSHIP_OPTIONS.some((o) => o.value === value)) {
    return "Select a valid relationship"
  }
  return null
}

export function relationshipStorageKey(userId: string) {
  return `attrangi:emergency-relationship:${userId}`
}

export function readStoredRelationship(userId: string, fallback?: string | null): string {
  if (typeof window === "undefined") return fallback || ""
  try {
    return localStorage.getItem(relationshipStorageKey(userId)) || fallback || ""
  } catch {
    return fallback || ""
  }
}

export function writeStoredRelationship(userId: string, value: string) {
  try {
    if (!value.trim()) localStorage.removeItem(relationshipStorageKey(userId))
    else localStorage.setItem(relationshipStorageKey(userId), value.trim())
  } catch {
    /* ignore */
  }
}
