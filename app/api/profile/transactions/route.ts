import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    let mappedPayments: any[] = []
    
    if (patient) {
      const payments = await prisma.payment.findMany({
        where: { appointment: { patientId: patient.id } },
        include: { appointment: { include: { doctor: { include: { user: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 20
      })

      mappedPayments = payments.map(p => ({
        id: p.id,
        type: "APPOINTMENT",
        amount: p.amount,
        status: p.status === "PAID" ? "SUCCESS" : p.status,
        description: `Session with ${p.appointment.doctor?.user?.name || "Therapist"}`,
        createdAt: p.createdAt
      }))
    }

    const mappedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      status: t.status,
      description: t.description,
      createdAt: t.createdAt
    }))

    const combined = [...mappedTransactions, ...mappedPayments].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 30)

    const walletBalance = 0

    return NextResponse.json({
      success: true,
      transactions: combined,
      walletBalance
    })

  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}
