import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"

function generateCode(name: string, userId: string): string {
  const prefix = name.trim().split(" ")[0].toUpperCase().slice(0, 8)
  const suffix = userId.slice(-4).toUpperCase()
  return `${prefix}-${suffix}`
}

// GET — fetch or create the user's referral record
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userName = session.user.name || "USER"

    // Upsert referral code — create one if not yet exists
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId },
      include: { referrals: { orderBy: { createdAt: "desc" } } },
    })

    if (!referralCode) {
      const code = generateCode(userName, userId)
      referralCode = await prisma.referralCode.create({
        data: { userId, code },
        include: { referrals: { orderBy: { createdAt: "desc" } } },
      })
    }

    const joinedCount = referralCode.referrals.filter(
      (r) => r.status === "JOINED"
    ).length

    return NextResponse.json({
      code: referralCode.code,
      referralUrl: `heyattrangi.com/invite/${referralCode.code}`,
      referrals: referralCode.referrals,
      joinedCount,
      rewardClaimed: referralCode.rewardClaimed,
      claimInfo: referralCode.rewardClaimed
        ? {
            size: referralCode.claimSize,
            address: referralCode.claimAddress,
            phone: referralCode.claimPhone,
            claimedAt: referralCode.claimedAt,
          }
        : null,
    })
  } catch (error) {
    console.error("Referral GET error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST — add a new referral invitation
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { inviteeName, status } = body

    if (!inviteeName || typeof inviteeName !== "string" || !inviteeName.trim()) {
      return NextResponse.json(
        { error: "inviteeName is required" },
        { status: 400 }
      )
    }

    // Ensure referral code exists
    let referralCode = await prisma.referralCode.findUnique({
      where: { userId },
    })
    if (!referralCode) {
      const userName = session.user.name || "USER"
      const code = generateCode(userName, userId)
      referralCode = await prisma.referralCode.create({
        data: { userId, code },
      })
    }

    const referral = await prisma.referral.create({
      data: {
        referralCodeId: referralCode.id,
        inviteeName: inviteeName.trim(),
        status: status === "JOINED" ? "JOINED" : "PENDING",
      },
    })

    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    console.error("Referral POST error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
