export type MembershipTier = "light" | "active" | "premium" | "committed"

export type MembershipBadgeVariant = "light" | "active" | "premium" | "committed"

/** Feature / entitlement tier derived from plan. */
export function getMembershipTier(plan: string | null | undefined): MembershipTier {
  switch (plan) {
    case "PREMIUM":
    case "ORGANIZATION":
      return "committed"
    case "ESSENTIAL":
      return "active"
    case "FREE":
    default:
      return "light"
  }
}

/** Visual badge variant (1:1 with plan). */
export function getMembershipBadgeVariant(plan: string | null | undefined): MembershipBadgeVariant {
  switch (plan) {
    case "ORGANIZATION":
      return "committed"
    case "PREMIUM":
      return "premium"
    case "ESSENTIAL":
      return "active"
    case "FREE":
    default:
      return "light"
  }
}

export function getMembershipTitle(plan: string | null | undefined): string {
  switch (getMembershipBadgeVariant(plan)) {
    case "committed":
      return "Committed Member"
    case "premium":
      return "Premium Member"
    case "active":
      return "Active Member"
    case "light":
    default:
      return "Light Member"
  }
}

export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "—"

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

export function inferAuthProvider(user: {
  image?: string | null
  password?: string | null
  accounts?: { provider: string }[]
}): string {
  const fromAccount = user.accounts?.[0]?.provider
  if (fromAccount) {
    if (fromAccount === "google") return "Google"
    if (fromAccount === "credentials") return "Email"
    return fromAccount.charAt(0).toUpperCase() + fromAccount.slice(1)
  }
  if (user.image && /googleusercontent|ggpht|google/i.test(user.image)) return "Google"
  if (user.password) return "Email"
  return "Google"
}

export function getAccountStatus(patient?: { studentStatus?: string | null } | null): string {
  const status = patient?.studentStatus || "ACTIVE"
  if (status === "SUSPENDED") return "Suspended"
  if (status === "GRADUATED") return "Graduated"
  return "Active"
}
