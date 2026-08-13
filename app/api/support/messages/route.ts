import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
 
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
 
    const data = await req.json()
    const { message } = data
 
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 })
    }
 
    const trimmedMessage = message.trim()
 
    if (trimmedMessage.length > 2000) {
      return NextResponse.json({ error: "Message cannot exceed 2000 characters" }, { status: 400 })
    }
 
    // Save to database
    const supportMessage = await prisma.supportMessage.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || null,
        userEmail: session.user.email || null,
        message: trimmedMessage,
        status: "new",
        isRead: false,
      },
    })
 
    return NextResponse.json({
      success: true,
      message: "Your message has been shared successfully.",
    })
  } catch (error: any) {
    console.error("Support message submit error:", error)
    return NextResponse.json(
      { error: "Unable to send your message right now. Please try again." },
      { status: 500 }
    )
  }
}
