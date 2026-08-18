import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user to confirm existence and retrieve email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 1. Delete AssessmentResponses first (prevent constraint violations)
    const attempts = await prisma.assessmentAttempt.findMany({
      where: { userId },
      select: { id: true },
    })
    const attemptIds = attempts.map(a => a.id)

    if (attemptIds.length > 0) {
      await prisma.assessmentResponse.deleteMany({
        where: { attemptId: { in: attemptIds } },
      })
    }

    // 2. Delete AssessmentAttempts
    await prisma.assessmentAttempt.deleteMany({
      where: { userId },
    })

    // 3. Delete PatientAssessmentResult records
    await prisma.patientAssessmentResult.deleteMany({
      where: { userId },
    })

    // 4. Delete TechnicalLimitLog records
    await prisma.technicalLimitLog.deleteMany({
      where: { userId },
    })

    // 5. Delete LoginOtp
    if (user.email) {
      await prisma.loginOtp.deleteMany({
        where: { email: user.email },
      })
    }

    // 6. Delete primary User record (cascading deletes for accounts, sessions, patient, doctor, journals, moods, conversations, notifications, reminders, etc.)
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE_ACCOUNT_ERROR]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
