import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { resolveEffectiveRole } from "@/lib/user-role"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ completed: false })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        patient: true,
        doctor: true,
        admin: true,
      },
    })

    if (!user) {
      return NextResponse.json({ completed: false })
    }

    const effectiveRole = resolveEffectiveRole(user) || user.role

    // Check if user has completed onboarding based on role
    let isCompleted = false
    switch (effectiveRole) {
      case "PATIENT":
        isCompleted = !!user.patient
        break
      case "DOCTOR":
        isCompleted = !!user.doctor
        break
      case "ADMIN":
        isCompleted = !!user.admin
        break
      case "INSTITUTION_ADMIN":
        isCompleted = true
        break
    }

    return NextResponse.json({ 
      completed: isCompleted,
      role: effectiveRole 
    })
  } catch (error) {
    console.error("Error checking onboarding:", error)
    return NextResponse.json({ completed: false })
  }
}
