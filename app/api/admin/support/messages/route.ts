import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
 
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
 
    const { searchParams } = new URL(req.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit
 
    const where: any = {}
 
    if (status !== "all") {
      where.status = status
    }
 
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { userEmail: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ]
    }
 
    const total = await prisma.supportMessage.count({ where })
 
    const messages = await prisma.supportMessage.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })
 
    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Admin support message query error:", error)
    return NextResponse.json({ error: "Failed to fetch support messages" }, { status: 500 })
  }
}
