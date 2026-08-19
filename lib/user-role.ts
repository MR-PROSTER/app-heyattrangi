import type { UserRole } from "@prisma/client"

type RoleSource = {
  role?: UserRole | string | null
  patient?: unknown
  doctor?: unknown
  admin?: unknown
}

export function resolveEffectiveRole(user?: RoleSource | null): UserRole | null {
  if (!user) return null

  const role = user.role
  if (
    role === "PATIENT" ||
    role === "DOCTOR" ||
    role === "ADMIN" ||
    role === "INSTITUTION_ADMIN"
  ) {
    return role
  }

  // Fall back to attached profile records only when the persisted role value is
  // missing or legacy. This keeps manual role promotions (for example, PATIENT
  // -> ADMIN) working even if older profile rows are still attached.
  if (user.admin) return "ADMIN"
  if (user.doctor) return "DOCTOR"
  if (user.patient) return "PATIENT"

  return null
}
