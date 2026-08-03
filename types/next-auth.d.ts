import "next-auth"
import { UserRole, PlanType } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      plan?: PlanType
      orgId?: string | null
    }
  }

  interface User {
    role: UserRole
    plan?: PlanType
    orgId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: UserRole
    plan?: PlanType
    orgId?: string | null
  }
}
