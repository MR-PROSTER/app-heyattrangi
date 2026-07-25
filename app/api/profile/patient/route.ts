import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const { name, age, gender, healthConcerns, emergencyContact, emergencyPhone } = data

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
      },
    })

    // Update or create patient profile
    await prisma.patient.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        age: age || null,
        gender: gender || null,
        healthConcerns: healthConcerns || [],
        emergencyContactName: emergencyContact || null,
        emergencyContactPhone: emergencyPhone || null,
      },
      update: {
        age: age || null,
        gender: gender || null,
        healthConcerns: healthConcerns || [],
        emergencyContactName: emergencyContact || null,
        emergencyContactPhone: emergencyPhone || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Patient profile update error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}


