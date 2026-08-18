import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { enforceLimit } from "@/lib/limits/checkLimits"

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
        plan: true,
        role: true,
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
      plan: user.plan || "FREE",
      role: user.role || "PATIENT",
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

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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
      emergencyContacts, // Array of { name, phone, relationship }
    } = data

    // 1. Enforce Profile updates limit (20/day)
    const profileUpdateLimit = await enforceLimit({
      userId: session.user.id,
      action: "PROFILE_UPDATE",
      plan: dbUser.plan,
      limitFree: 20,
      limitPremium: 20,
      windowMs: 24 * 60 * 60 * 1000,
      errorMessage: "Daily profile updates limit reached",
    })

    if (!profileUpdateLimit.allowed) {
      return NextResponse.json({ error: "LIMIT_EXCEEDED", message: profileUpdateLimit.message, resetInSeconds: profileUpdateLimit.resetInSeconds }, { status: 429 })
    }

    // 2. Enforce Emergency Contact limits if contacts are being updated
    if (emergencyContacts !== undefined) {
      const emergencyLimit = await enforceLimit({
        userId: session.user.id,
        action: "EMERGENCY_CONTACT_UPDATE",
        plan: dbUser.plan,
        limitFree: 10,
        limitPremium: 10,
        windowMs: 24 * 60 * 60 * 1000,
        errorMessage: "Daily emergency contact updates limit reached",
      })

      if (!emergencyLimit.allowed) {
        return NextResponse.json({ error: "LIMIT_EXCEEDED", message: emergencyLimit.message, resetInSeconds: emergencyLimit.resetInSeconds }, { status: 429 })
      }

      if (!Array.isArray(emergencyContacts) || emergencyContacts.length < 2 || emergencyContacts.length > 5) {
        return NextResponse.json({ error: "VALIDATION_ERROR", message: "You must provide between 2 and 5 emergency contacts." }, { status: 400 })
      }

      // Validate fields
      for (const ec of emergencyContacts) {
        if (!ec.name || ec.name.length > 100) {
          return NextResponse.json({ error: "VALIDATION_ERROR", message: "Contact name must be between 1 and 100 characters." }, { status: 400 })
        }
        if (!ec.relationship || ec.relationship.length > 100) {
          return NextResponse.json({ error: "VALIDATION_ERROR", message: "Relationship must be between 1 and 100 characters." }, { status: 400 })
        }
        if (!ec.phone || ec.phone.trim().length === 0) {
          return NextResponse.json({ error: "VALIDATION_ERROR", message: "Phone number is required." }, { status: 400 })
        }
      }
    }

    // Update User Name
    if (name !== undefined) {
      if (name && name.length > 100) {
        return NextResponse.json({ error: "VALIDATION_ERROR", message: "Name must be under 100 characters." }, { status: 400 })
      }
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

    // Legacy sync
    if (emergencyContacts && emergencyContacts.length > 0) {
      const first = emergencyContacts[0]
      patientCreate.emergencyContactName = first.name || null
      patientUpdate.emergencyContactName = first.name || null
      patientCreate.emergencyContactPhone = first.phone || null
      patientUpdate.emergencyContactPhone = first.phone || null
      patientCreate.emergencyRelationship = first.relationship || null
      patientUpdate.emergencyRelationship = first.relationship || null
    } else {
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
    }

    // Upsert Patient record
    const patient = await prisma.patient.upsert({
      where: { userId: session.user.id },
      create: patientCreate as never,
      update: patientUpdate as never,
    })

    // Sync multiple emergency contacts in relation
    if (emergencyContacts !== undefined) {
      await prisma.$transaction([
        prisma.emergencyContact.deleteMany({ where: { patientId: patient.id } }),
        prisma.emergencyContact.createMany({
          data: emergencyContacts.map((ec: any) => ({
            patientId: patient.id,
            name: ec.name.trim(),
            phone: ec.phone.trim(),
            relationship: ec.relationship.trim(),
          })),
        }),
      ])
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Patient profile update error:", error)
    const message = error instanceof Error ? error.message : "Failed to update profile"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
