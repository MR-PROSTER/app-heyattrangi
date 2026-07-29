import { NextResponse } from 'next/server'
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        
        console.log("Saving Assessment Result:", body)

        // Save completed assessment results to MongoDB for future personalization
        const db: any = prisma
        const saved = await db.patientAssessmentResult.create({
            data: {
                userId: session.user.id,
                assessmentId: body.assessmentId || "unknown",
                date: body.date || new Date().toISOString().split('T')[0],
                results: body, // store full payload
            }
        })

        return NextResponse.json({ success: true, message: "Assessment saved successfully.", id: saved.id })
    } catch (error) {
        console.error("Error saving assessment:", error)
        return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 })
    }
}

