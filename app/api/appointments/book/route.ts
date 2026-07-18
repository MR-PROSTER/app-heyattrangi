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
    const { doctorId, appointmentDate, reason } = data

    // Find patient profile from user ID
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Patient profile not found. Please complete your profile." }, { status: 404 })
    }

    // Verify doctor exists and is approved
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        availability: true,
      },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    if (doctor.status !== "VERIFIED") {
      return NextResponse.json({ error: "Doctor is not available for booking" }, { status: 400 })
    }

    if (!doctor.availability?.isAvailable) {
      return NextResponse.json({ error: "Doctor is not accepting appointments" }, { status: 400 })
    }


    // Check for existing appointments at this time
    const appointmentDateObj = new Date(appointmentDate)
    const durationInMinutes = doctor.appointmentDuration || 30
    const endTimeObj = new Date(appointmentDateObj.getTime() + durationInMinutes * 60000)

    // Create a separate date object for the day (normalized to 00:00:00)
    const dayDateObj = new Date(appointmentDateObj)
    dayDateObj.setHours(0, 0, 0, 0)

    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctorId,
        appointmentDate: appointmentDateObj,
        OR: [
          { status: "CONFIRMED" },
          { status: "COMPLETED" },
          { 
            status: "PENDING", 
            createdAt: { gte: fifteenMinsAgo } 
          }
        ]
      },
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      )
    }

    // Use transaction to ensure both TimeSlot and Appointment are created
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create TimeSlot
      const timeSlot = await tx.timeSlot.create({
        data: {
          doctorId: doctorId,
          date: dayDateObj,
          startTime: appointmentDateObj,
          endTime: endTimeObj,
          isBooked: true,
        },
      })

      // 2. Create Appointment linked to TimeSlot
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctorId,
          appointmentDate: appointmentDateObj,
          status: "PENDING",
          paymentStatus: "PENDING",
          timeSlotId: timeSlot.id,
        },
      })

      return appointment
    })

    return NextResponse.json({
      success: true,
      appointmentId: result.id,
      appointment: result
    })
  } catch (error: any) {
    console.error("Error booking appointment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to book appointment" },
      { status: 500 }
    )
  }
}
