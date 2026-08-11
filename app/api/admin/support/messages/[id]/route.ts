import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
 
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || (session.user.role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
 
    const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
    const messageId = resolvedParams.id
    const data = await req.json()
    const { status, isRead } = data
 
    const updateData: any = {}
 
    if (status !== undefined) {
      if (!["new", "read", "resolved"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
      }
      updateData.status = status
    }
 
    if (isRead !== undefined) {
      updateData.isRead = !!isRead
    }
 
    const updatedMessage = await prisma.supportMessage.update({
      where: { id: messageId },
      data: updateData,
    })
 
    return NextResponse.json({
      success: true,
      message: updatedMessage,
    })
  } catch (error: any) {
    console.error("Admin support message patch error:", error)
    return NextResponse.json({ error: "Failed to update support message" }, { status: 500 })
  }
}
