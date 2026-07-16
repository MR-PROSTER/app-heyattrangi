"use server"

import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function saveAiOnboarding(data: {
  aiNickname: string
  heardAboutUs: string
  age: number
  healthConcerns: string[]
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const { aiNickname, heardAboutUs, age, healthConcerns } = data

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    })

    if (!patient) {
      // Create patient if not exists
      await prisma.patient.create({
        data: {
          userId: session.user.id,
          aiNickname,
          heardAboutUs,
          age,
          healthConcerns,
        },
      })
    } else {
      // Update existing patient
      await prisma.patient.update({
        where: { userId: session.user.id },
        data: {
          aiNickname,
          heardAboutUs,
          age,
          healthConcerns,
        },
      })
    }

    revalidatePath("/patient/ai-bot")
    return { success: true }
  } catch (error) {
    console.error("Error saving AI onboarding:", error)
    return { success: false, error: "Failed to save onboarding details" }
  }
}
