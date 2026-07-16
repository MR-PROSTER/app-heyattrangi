import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await auth()
        const user = await getCurrentUser()

        if (!session?.user || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Lazy-create 30 min reminders
        const now = new Date()
        const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000)

        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                patientId: user.id,
                status: "CONFIRMED",
                appointmentDate: {
                    gt: now,
                    lte: thirtyMinsFromNow
                }
            },
            include: {
                doctor: {
                    include: {
                        user: true
                    }
                }
            }
        })

        for (const apt of upcomingAppointments) {
            // Check if notification already exists
            const existingNotif = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: "APPOINTMENT",
                    message: {
                        contains: apt.id
                    }
                }
            })

            if (!existingNotif) {
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        title: "Upcoming Session Reminder",
                        message: `Your session with ${apt.doctor?.user?.name || "your therapist"} is starting in less than 30 minutes. (ID: ${apt.id})`,
                        type: "APPOINTMENT",
                    }
                })
            }
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ notifications })
    } catch (error) {
        console.error("[PATIENT_NOTIFICATIONS_GET]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth()
        const user = await getCurrentUser()

        if (!session?.user || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { notificationId } = body

        if (notificationId) {
            // Mark specific notification as read
            const notification = await prisma.notification.update({
                where: { id: notificationId, userId: user.id },
                data: { isRead: true }
            })
            return NextResponse.json({ success: true, notification })
        } else {
            // Mark all as read
            const result = await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true }
            })
            return NextResponse.json({ success: true, count: result.count })
        }
    } catch (error) {
        console.error("[PATIENT_NOTIFICATIONS_PATCH]", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
