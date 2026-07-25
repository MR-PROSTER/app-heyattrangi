import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { name, age, dob, gender, healthConcerns, emergencyContact, emergencyPhone, orgId, preferredLanguage, heardAboutUs } = data

    // Update user role, name, and orgId if provided
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        role: "PATIENT",
        ...(name && { name }),
        ...(orgId && { orgId })
      },
    })

    // Create patient profile
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        age: parseInt(age) || 0,
        dob,
        gender,
        healthConcerns: Array.isArray(healthConcerns) ? healthConcerns : [],
        emergencyContactName: emergencyContact,
        emergencyContactPhone: emergencyPhone,
        preferredLanguage: preferredLanguage || "English",
        heardAboutUs: heardAboutUs || undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Patient onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}

