import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/payments"

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

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 })
    }

    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: { patient: true }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 })
    }

    // Verify the appointment belongs to the current user
    if (!payment.appointment.patient || payment.appointment.patient.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (payment.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update payment and appointment status
    const meetingLink = `/meet/${appointmentId}`
    const chatChannelId = `chat_${appointmentId}`

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "PAID",
          paymentMethod: "RAZORPAY",
        }
      }),
      prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          meetingLink,
          chatChannelId,
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      appointment: {
        id: appointmentId,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        meetingLink,
      }
    })

  } catch (error: any) {
    console.error("Error verifying appointment payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    )
  }
}
