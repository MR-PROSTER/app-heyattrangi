import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"

export class AdminAuthError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireAdminUser() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new AdminAuthError(401, "Unauthorized")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    throw new AdminAuthError(403, "Forbidden")
  }

  return { session, user }
}
