import type { UserRole } from "@prisma/client"

type RoleSource = {
  role?: UserRole | string | null
  patient?: unknown
  doctor?: unknown
  admin?: unknown
}

export function resolveEffectiveRole(user?: RoleSource | null): UserRole | null {
  if (!user) return null

  // Prefer persisted profile relations over a potentially stale role field.
  if (user.admin) return "ADMIN"
  if (user.doctor) return "DOCTOR"
  if (user.patient) return "PATIENT"

  const role = user.role
  if (
    role === "PATIENT" ||
    role === "DOCTOR" ||
    role === "ADMIN" ||
    role === "INSTITUTION_ADMIN"
  ) {
    return role
  }

  return null
}
