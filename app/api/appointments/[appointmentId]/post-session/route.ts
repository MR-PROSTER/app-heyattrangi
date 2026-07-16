import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { AppointmentStatus } from "@prisma/client"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ appointmentId: string }> }
) {
    try {
        const { appointmentId } = await params;
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { role } = body

        // Verify the appointment exists
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { doctor: true, patient: true }
        })

        if (!appointment) {
            return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
        }

        if (role === "host") {
            // Verify host is the doctor of this appointment
            if (appointment.doctor.userId !== session.user.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }

            const { status, duration, notes } = body
            
            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    status: status as AppointmentStatus,
                    actualDuration: duration,
                    doctorNotes: notes
                }
            })
        } else {
            // Verify user is the patient of this appointment
            if (appointment.patient?.userId !== session.user.id) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }

            const { rating, feedback } = body

            await prisma.appointment.update({
                where: { id: appointmentId },
                data: {
                    patientRating: rating,
                    patientFeedback: feedback
                }
            })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("[POST_SESSION_SUBMIT_ERROR]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
