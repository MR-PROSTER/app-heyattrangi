import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {

  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { appointmentId } = await params


    // Fetch the appointment to check if the user is authorized (Doctor of this appointment)
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true }
    })

    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 })
    }

    // Ensure the user is a doctor and it's their appointment
    const doctor = await prisma.doctor.findUnique({
      where: { userId: session.user.id }
    })

    if (!doctor || doctor.id !== appointment.doctorId) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Ensure the appointment is PAID before generating a link
    if (appointment.paymentStatus !== "PAID") {
      return new NextResponse("Payment required before generating meeting link", { status: 402 })
    }

    // Generate or override with the new unique meeting link
    const meetingLink = `/meet/${appointmentId}`

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        meetingLink,
      }
    })

    return NextResponse.json({ meetingLink: updatedAppointment.meetingLink })
  } catch (error) {
    console.error("[MEETING_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
