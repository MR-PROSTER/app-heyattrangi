import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/payments"
import { queuePaymentStatusEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    const data = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = data

    // Find payment
    const payment = await prisma.payment.findFirst({
      where: {
        appointmentId,
        razorpayOrderId: razorpay_order_id,
      },
      include: {
        appointment: {
          include: {
            doctor: true,
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )

    if (!isValid) {
      if (user?.email) {
        queuePaymentStatusEmail({
          email: user.email,
          name: user.name,
          status: "FAILED",
          amount: payment.amount,
          description: "Appointment session payment",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          reason: "Invalid payment signature",
        })
      }
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "PAID",
      },
    })

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    })

    // Generate meeting link and chat channel (placeholder)
    const meetingLink = `/meet/${appointmentId}`
    const chatChannelId = `chat_${appointmentId}`

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        meetingLink,
        chatChannelId,
      },
    })

    // TODO: Settle payment to doctor (via Razorpay Payouts or Routes)
    // For now, settlement can be done manually or scheduled

    if (user?.email) {
      queuePaymentStatusEmail({
        email: user.email,
        name: user.name,
        status: "SUCCESS",
        amount: payment.amount,
        description: "Appointment session payment",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      })
    }

    return NextResponse.json({
      success: true,
      appointmentId,
      meetingLink,
      chatChannelId,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
