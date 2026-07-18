import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth.config"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    if (!orgId) {
      return NextResponse.json({ error: "No institution associated with this admin" }, { status: 400 })
    }

    const batches = await prisma.batch.findMany({
      where: { organizationId: orgId },
      include: {
        _count: {
          select: { patients: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error("Error fetching batches:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || !session.user || (session.user as any).role !== "INSTITUTION_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = (session.user as any).orgId
    if (!orgId) {
      return NextResponse.json({ error: "No institution associated with this admin" }, { status: 400 })
    }

    const body = await request.json()
    const { name, graduationYear, startDate, endDate } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const newBatch = await prisma.batch.create({
      data: {
        organizationId: orgId,
        name,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "ACTIVE"
      }
    })

    return NextResponse.json(newBatch, { status: 201 })
  } catch (error) {
    console.error("Error creating batch:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
