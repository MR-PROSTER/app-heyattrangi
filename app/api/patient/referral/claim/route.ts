import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

// POST — claim the T-shirt reward
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { address, phone, size } = body

    if (!address?.trim() || !phone?.trim() || !size?.trim()) {
      return NextResponse.json(
        { error: "address, phone and size are required" },
        { status: 400 }
      )
    }

    const referralCode = await prisma.referralCode.findUnique({
      where: { userId },
      include: { referrals: true },
    })

    if (!referralCode) {
      return NextResponse.json(
        { error: "No referral record found" },
        { status: 404 }
      )
    }

    const joinedCount = referralCode.referrals.filter(
      (r) => r.status === "JOINED"
    ).length

    if (joinedCount < 30) {
      return NextResponse.json(
        { error: "You need 30 joined friends to claim the reward" },
        { status: 403 }
      )
    }

    if (referralCode.rewardClaimed) {
      return NextResponse.json(
        { error: "Reward already claimed" },
        { status: 409 }
      )
    }

    const updated = await prisma.referralCode.update({
      where: { userId },
      data: {
        rewardClaimed: true,
        claimAddress: address.trim(),
        claimPhone: phone.trim(),
        claimSize: size.trim(),
        claimedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, claimedAt: updated.claimedAt })
  } catch (error) {
    console.error("Referral claim POST error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
