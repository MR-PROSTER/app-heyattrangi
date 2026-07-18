import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        domains: true
      },
      orderBy: {
        name: "asc"
      }
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Error fetching public organizations:", error)
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    )
  }
}
