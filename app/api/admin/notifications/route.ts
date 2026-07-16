import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await auth()
        const user = await getCurrentUser()

        if (!session?.user || user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { userId, title, message, type } = body

        if (!userId || !title || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type: type || "ADMIN_NOTE"
            }
        })

        return NextResponse.json({ success: true, notification })
    } catch (error) {
        console.error("[ADMIN_NOTIFICATION_POST]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
