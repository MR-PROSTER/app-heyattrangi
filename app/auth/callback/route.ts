import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import type { PlanType, UserRole } from "@prisma/client"
import { resolveEffectiveRole } from "@/lib/user-role"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const searchParams = req.nextUrl.searchParams
    const isSignup = searchParams.get("signup") === "true"
    const selectedRole = searchParams.get("role")

    if (!session?.user?.id) {
      console.error("No session or user ID in callback")
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Wait a moment for NextAuth adapter to finish creating the user
    // Retry logic in case user creation is still in progress
    let user = null
    let retries = 3
    while (!user && retries > 0) {
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          patient: true,
          doctor: true,
          admin: true,
        },
      })
      
      if (!user && retries > 1) {
        // Wait 500ms before retrying
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      retries--
    }

    // If user still doesn't exist after retries, redirect to signup
    if (!user) {
      console.error("User not found after retries:", session.user.id)
      return NextResponse.redirect(new URL("/auth/signup", req.url))
    }

    const effectiveRole = resolveEffectiveRole(user) || user.role
    let isNewUser = !user.patient && !user.doctor && !user.admin

    // If this is a signup attempt, but the user is already registered (existing user)
    if (isSignup && !isNewUser) {
      console.log("Existing user tried to signup via OAuth - redirecting to signin with error")
      return NextResponse.redirect(new URL("/auth/signin?error=existing_user", req.url))
    }

    // If this is a signup and role needs to be set/updated
    if (isSignup && selectedRole) {
      // Update user role if different or not set
      if (!effectiveRole || effectiveRole !== selectedRole) {
        try {
          const updateData: { role: UserRole; plan?: PlanType; orgId?: string } = {
            role: selectedRole as UserRole,
          }

          if (selectedRole === "INSTITUTION_ADMIN" && user.email) {
            const domain = user.email.split("@")[1]?.toLowerCase()
            if (domain) {
              const org = await prisma.organization.findFirst({
                where: { domains: { has: domain } },
              })
              if (org) {
                updateData.plan = "ORGANIZATION"
                updateData.orgId = org.id
              } else {
                updateData.plan = "ORGANIZATION"
              }
            }
          }

          user = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            include: {
              patient: true,
              doctor: true,
              admin: true,
            },
          })
        } catch (error) {
          console.error("Error updating user role:", error)
          // Continue with existing user if update fails
        }
      }
    }

    isNewUser = !user.patient && !user.doctor && !user.admin
    const resolvedRole = resolveEffectiveRole(user) || user.role

    if (isNewUser) {
      if (!selectedRole) {
        console.log("New Google/OAuth user without role - redirecting to signup for role selection")
        return NextResponse.redirect(new URL("/auth/signup", req.url))
      }
      if ((resolveEffectiveRole(user) || user.role) !== selectedRole) {
        try {
          user = await prisma.user.update({
            where: { id: session.user.id },
            data: { role: selectedRole as UserRole },
            include: { patient: true, doctor: true, admin: true }
          })
        } catch (error) {
          console.error("Error updating Google user role:", error)
        }
      }
      if (selectedRole === "INSTITUTION_ADMIN") {
        return NextResponse.redirect(new URL("/institution", req.url))
      }
      return NextResponse.redirect(new URL(`/onboarding?role=${selectedRole}`, req.url))
    }

    // CRITICAL FIX: Differentiate between Sign In and Sign Up
    // SIGN IN: Always go to dashboard, skip onboarding check completely
    // SIGN UP: Check onboarding and redirect if incomplete
    
    // Auto-create missing profiles for existing users signing in
    if (!isSignup && resolvedRole === "DOCTOR" && !user.doctor) {
      console.log("Auto-creating missing doctor profile for existing user")
      try {
        await prisma.doctor.create({
          data: {
            userId: user.id,
            fullName: user.name || "Doctor",
            status: "PENDING_PROFILE",
            consultationFee: 0,
          },
        })
        console.log("✅ Created missing doctor profile")
      } catch (error) {
        console.error("Error creating doctor profile:", error)
      }
    }

    if (!isSignup) {
      // This is a SIGN IN - go directly to dashboard, no onboarding check
    console.log("SIGN IN detected - redirecting directly to dashboard:", {
      userId: user.id,
      role: resolvedRole,
      hasDoctor: !!user.doctor,
    })
      
      // Redirect based on role (or default dashboard if no role)
      switch (resolvedRole) {
        case "PATIENT":
          return NextResponse.redirect(new URL("/patient/dashboard", req.url))
        case "DOCTOR":
          return NextResponse.redirect(new URL("/doctor/dashboard", req.url))
        case "ADMIN":
          return NextResponse.redirect(new URL("/admin/dashboard", req.url))
        case "INSTITUTION_ADMIN":
          return NextResponse.redirect(new URL("/institution", req.url))
        default:
          // No role set - send to signup to select role
          console.log("No role set for existing user - redirecting to signup")
          return NextResponse.redirect(new URL("/auth/signup", req.url))
      }
    }

    // This is a SIGN UP - check onboarding status
    console.log("SIGN UP detected - checking onboarding status:", {
      userId: user.id,
      role: resolvedRole,
    })

    // Check if onboarding is complete based on role
    let isOnboardingComplete = false
    switch (resolvedRole) {
      case "PATIENT":
        isOnboardingComplete = !!user.patient
        break
      case "DOCTOR":
        isOnboardingComplete = !!user.doctor
        console.log("Doctor onboarding check:", {
          hasDoctor: !!user.doctor,
          doctorId: user.doctor?.id,
        })
        break
      case "ADMIN":
        isOnboardingComplete = !!user.admin
        break
      case "INSTITUTION_ADMIN":
        isOnboardingComplete = true
        break
      default:
        isOnboardingComplete = false
    }

    // For SIGN UP, redirect to onboarding if incomplete
    if (!isOnboardingComplete) {
      if (resolvedRole) {
        console.log("New signup - onboarding incomplete, redirecting to onboarding:", resolvedRole)
        return NextResponse.redirect(new URL(`/onboarding?role=${resolvedRole}`, req.url))
      }
      // No role set - redirect to signup to select role
      return NextResponse.redirect(new URL("/auth/signup", req.url))
    }

    // Onboarding complete for signup - redirect to dashboard
    console.log("Signup onboarding complete - redirecting to dashboard:", resolvedRole)
    switch (resolvedRole) {
      case "PATIENT":
        return NextResponse.redirect(new URL("/patient/dashboard", req.url))
      case "DOCTOR":
        return NextResponse.redirect(new URL("/doctor/dashboard", req.url))
      case "ADMIN":
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      case "INSTITUTION_ADMIN":
        return NextResponse.redirect(new URL("/institution", req.url))
      default:
        return NextResponse.redirect(new URL("/auth", req.url))
    }
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/auth/error", req.url))
  }
}
