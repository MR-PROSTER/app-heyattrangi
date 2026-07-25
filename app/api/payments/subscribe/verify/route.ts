import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/payments"
import { queuePaymentStatusEmail } from "@/lib/email"
import { PlanType } from "@prisma/client"

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, amount } = data
    const planLabel = plan === "PREMIUM" ? "Companion" : plan === "ESSENTIAL" ? "Listener" : String(plan || "subscription")

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
          amount,
          description: `Subscription payment for ${planLabel} plan`,
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

    // Update user plan and record the transaction in a database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update user plan
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          plan: plan as PlanType,
        },
      })

      // 2. Record the transaction
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "SUBSCRIPTION",
          amount: parseFloat(amount),
          status: "SUCCESS",
          description: `Subscription Upgrade to ${plan}`,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        }
      })
    })

    if (user?.email) {
      queuePaymentStatusEmail({
        email: user.email,
        name: user.name,
        status: "SUCCESS",
        amount,
        description: `Subscription upgrade to ${planLabel} plan`,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription payment verification error:", error)
    try {
      const session = await auth()
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, name: true },
        })
        if (user?.email) {
          queuePaymentStatusEmail({
            email: user.email,
            name: user.name,
            status: "FAILED",
            description: "Subscription payment verification",
            reason: "Failed to verify subscription payment",
          })
        }
      }
    } catch (notifyError) {
      console.error("Failed to notify payment failure:", notifyError)
    }
    return NextResponse.json(
      { error: "Failed to verify subscription payment" },
      { status: 500 }
    )
  }
}
