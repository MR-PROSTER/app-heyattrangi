import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

// PATCH — toggle referral status (PENDING <-> JOINED)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referralId } = await params

    // Verify ownership via join through referral code
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referralCode: true },
    })

    if (!referral || referral.referralCode.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: referral.status === "JOINED" ? "PENDING" : "JOINED",
      },
    })

    return NextResponse.json({ referral: updated })
  } catch (error) {
    console.error("Referral PATCH error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE — remove a referral invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referralId } = await params

    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { referralCode: true },
    })

    if (!referral || referral.referralCode.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.referral.delete({ where: { id: referralId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Referral DELETE error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
