import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { queuePaymentStatusEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      status,
      amount,
      description,
      paymentId,
      orderId,
      reason,
    } = body

    if (status !== "SUCCESS" && status !== "FAILED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true },
    })

    if (!user?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    queuePaymentStatusEmail({
      email: user.email,
      name: user.name,
      status,
      amount,
      description: description || (status === "SUCCESS" ? "Payment completed" : "Payment attempt failed"),
      paymentId: paymentId || null,
      orderId: orderId || null,
      reason: reason || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment notify-status error:", error)
    return NextResponse.json({ error: "Failed to queue payment status email" }, { status: 500 })
  }
}
