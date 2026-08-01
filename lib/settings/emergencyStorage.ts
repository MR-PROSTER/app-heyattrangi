/**
 * Alternate emergency number — local until API supports it.
 */
export function alternateEmergencyPhoneKey(userId: string) {
  return `attrangi:emergency-alt-phone:${userId}`
}

export function readAlternateEmergencyPhone(userId: string): string {
  if (typeof window === "undefined") return ""
  try {
    return localStorage.getItem(alternateEmergencyPhoneKey(userId)) || ""
  } catch {
    return ""
  }
}

export function writeAlternateEmergencyPhone(userId: string, value: string) {
  try {
    if (!value.trim()) localStorage.removeItem(alternateEmergencyPhoneKey(userId))
    else localStorage.setItem(alternateEmergencyPhoneKey(userId), value.trim())
  } catch {
    /* ignore */
  }
}
