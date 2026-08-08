import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { SCREENERS } from "@/lib/data/screeners"
import { scoreAssessment } from "@/lib/assessments/scoreAssessment"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const body = await req.json()
    const { assessmentKey, responses } = body

    if (!assessmentKey || !Array.isArray(responses)) {
      return NextResponse.json(
        { error: "Invalid payload. 'assessmentKey' and 'responses' array are required." },
        { status: 400 }
      )
    }

    const screener = SCREENERS[assessmentKey]
    if (!screener) {
      return NextResponse.json(
        { error: `Assessment not found: ${assessmentKey}` },
        { status: 404 }
      )
    }

    // Validate responses and build the index-based answers map
    const answers: Record<number, number> = {}
    for (const resp of responses) {
      const { questionId, selectedValue } = resp
      if (typeof questionId !== "string" || typeof selectedValue !== "number") {
        return NextResponse.json(
          { error: "Each response must contain a string 'questionId' and a number 'selectedValue'." },
          { status: 400 }
        )
      }

      const qIndex = screener.questions.findIndex((q: any) => q.id === questionId)
      if (qIndex === -1) {
        return NextResponse.json(
          { error: `Invalid questionId '${questionId}' for assessment '${assessmentKey}'.` },
          { status: 400 }
        )
      }

      const question = screener.questions[qIndex]
      const isValidOption = question.options.some((opt: any) => opt.value === selectedValue)
      if (!isValidOption) {
        return NextResponse.json(
          { error: `Invalid selectedValue '${selectedValue}' for questionId '${questionId}'.` },
          { status: 400 }
        )
      }

      answers[qIndex] = selectedValue
    }

    // Run database transaction to record the attempt and responses
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create AssessmentAttempt (INCOMPLETE) and nest creation of AssessmentResponse records
      const attempt = await tx.assessmentAttempt.create({
        data: {
          userId,
          assessmentKey,
          status: "INCOMPLETE",
          responses: {
            create: responses.map((r: any) => ({
              questionId: r.questionId,
              selectedValue: r.selectedValue,
            })),
          },
        },
      })

      // 2. Calculate score, severity, interpretation using server-side logic
      const scoringResult = scoreAssessment(assessmentKey, screener, answers)

      // 3. Update the AssessmentAttempt to COMPLETED
      await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          score: scoringResult.score,
          severity: scoringResult.severity,
          interpretation: scoringResult.interpretation,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      })

      return {
        id: attempt.id,
        ...scoringResult,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Assessment submitted successfully.",
      result,
    })
  } catch (error) {
    console.error("Error submitting assessment:", error)
    return NextResponse.json({ error: "Failed to submit assessment" }, { status: 500 })
  }
}
