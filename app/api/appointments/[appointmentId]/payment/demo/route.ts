import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> | { appointmentId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle params (Next.js 16 compatibility)
    const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
    const appointmentId = resolvedParams.appointmentId

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: true,
        patient: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Verify the appointment belongs to the current user
    if (!appointment.patient || appointment.patient.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if payment is already completed
    if (appointment.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 })
    }

    const consultationFee = appointment.doctor.consultationFee
    const platformFee = consultationFee * 0.2 // 20% platform fee
    const doctorAmount = consultationFee - platformFee

    // Demo payment processing - simulate payment success
    // In production, this will be replaced with Razorpay integration
    
    // Create payment record
    const payment = await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        amount: consultationFee,
        platformFee,
        doctorAmount,
        razorpayOrderId: `demo_order_${Date.now()}`,
        razorpayPaymentId: `demo_payment_${Date.now()}`,
        status: "PAID",
        paymentMethod: "DEMO",
        settlementStatus: "PENDING",
      },
      update: {
        status: "PAID",
      },
    })

    // Generate meeting link and chat channel
    const meetingLink = `/meet/${appointmentId}`
    const chatChannelId = `chat_${appointmentId}`

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        meetingLink,
        chatChannelId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully (Demo)",
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
      },
      appointment: {
        id: appointment.id,
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    })
  } catch (error: any) {
    console.error("Error processing demo payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 500 }
    )
  }
}

