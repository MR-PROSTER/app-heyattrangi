import { cache } from "react"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { UserRole, Prisma } from "@prisma/client"
import { withPerf } from "@/lib/perf"

export type CurrentUser = Prisma.UserGetPayload<{
  select: {
    id: true
    clerkId: true
    name: true
    email: true
    password: true
    emailVerified: true
    image: true
    role: true
    plan: true
    orgId: true
    createdAt: true
    updatedAt: true
    patient: {
      select: {
        id: true
        userId: true
        age: true
        dob: true
        gender: true
        healthConcerns: true
        emergencyContactName: true
        emergencyContactPhone: true
        emergencyRelationship: true
        emergencyContacts: {
          select: {
            id: true
            name: true
            phone: true
            relationship: true
          }
        }
        preferredLanguage: true
        batchId: true
        departmentId: true
        rollNumber: true
        studentStatus: true
        aiNickname: true
        heardAboutUs: true
        currentStreak: true
        lastLoginDate: true
        totalCredits: true
        createdAt: true
        updatedAt: true
      }
    }
    doctor: { select: { id: true; status: true } }
    admin: { select: { id: true } }
    accounts: { select: { provider: true } }
  }
}>

/**
 * Request-deduped current user. Uses select (not include) so patient pages
 * do not pull the full Doctor document graph on every load.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  return withPerf("getCurrentUser", async () => {
    try {
      const session = await auth()

      if (!session?.user?.id) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
          password: true,
          emailVerified: true,
          image: true,
          role: true,
          plan: true,
          orgId: true,
          createdAt: true,
          updatedAt: true,
          patient: {
            select: {
              id: true,
              userId: true,
              age: true,
              dob: true,
              gender: true,
              healthConcerns: true,
              emergencyContactName: true,
              emergencyContactPhone: true,
              emergencyRelationship: true,
              emergencyContacts: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  relationship: true,
                },
              },
              preferredLanguage: true,
              batchId: true,
              departmentId: true,
              rollNumber: true,
              studentStatus: true,
              aiNickname: true,
              heardAboutUs: true,
              currentStreak: true,
              lastLoginDate: true,
              totalCredits: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          doctor: { select: { id: true, status: true } },
          admin: { select: { id: true } },
          accounts: { select: { provider: true } },
        },
      })

      return user
    } catch (error) {
      console.error("Error in getCurrentUser:", error)
      return null
    }
  })
})

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
