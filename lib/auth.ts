import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function getCurrentUser() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patient: true,
        doctor: true,
        admin: true,
        accounts: { select: { provider: true } },
      },
    })

    return user
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    // Return null on error instead of crashing
    return null
  }
}

export async function requireAuth(requiredRole?: UserRole) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  if (requiredRole && user.role !== requiredRole) {
    throw new Error("Forbidden")
  }

  return user
}

