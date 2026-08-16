import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        patient: {
          select: {
            rollNumber: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name || "",
      email: user.email || "",
      rollNumber: user.patient?.rollNumber || "",
    })
  } catch (error: unknown) {
    console.error("GET patient profile error:", error)
    return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const {
      name,
      age,
      gender,
      dob,
      preferredLanguage,
      healthConcerns,
      emergencyContact,
      emergencyPhone,
      emergencyRelationship,
    } = data

    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: name || null },
      })
    }

    const patientCreate: Record<string, unknown> = {
      userId: session.user.id,
    }
    const patientUpdate: Record<string, unknown> = {}

    if (age !== undefined) {
      patientCreate.age = age || null
      patientUpdate.age = age || null
    }
    if (gender !== undefined) {
      patientCreate.gender = gender || null
      patientUpdate.gender = gender || null
    }
    if (dob !== undefined) {
      patientCreate.dob = dob || null
      patientUpdate.dob = dob || null
    }
    if (preferredLanguage !== undefined) {
      patientCreate.preferredLanguage = preferredLanguage || "English"
      patientUpdate.preferredLanguage = preferredLanguage || "English"
    }
    if (healthConcerns !== undefined) {
      patientCreate.healthConcerns = healthConcerns || []
      patientUpdate.healthConcerns = healthConcerns || []
    }
    if (emergencyContact !== undefined) {
      patientCreate.emergencyContactName = emergencyContact || null
      patientUpdate.emergencyContactName = emergencyContact || null
    }
    if (emergencyPhone !== undefined) {
      patientCreate.emergencyContactPhone = emergencyPhone || null
      patientUpdate.emergencyContactPhone = emergencyPhone || null
    }
    if (emergencyRelationship !== undefined) {
      patientCreate.emergencyRelationship = emergencyRelationship || null
      patientUpdate.emergencyRelationship = emergencyRelationship || null
    }

    if (Object.keys(patientUpdate).length > 0) {
      await prisma.patient.upsert({
        where: { userId: session.user.id },
        create: patientCreate as never,
        update: patientUpdate as never,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Patient profile update error:", error)
    const message = error instanceof Error ? error.message : "Failed to update profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
