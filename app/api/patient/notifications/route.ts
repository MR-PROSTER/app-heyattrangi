import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { withPerf, perfLog } from "@/lib/perf"

export async function GET() {
  const start = performance.now()
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const patient = await withPerf("notifications.patientLookup", () =>
      prisma.patient.findUnique({
        where: { userId },
        select: { id: true },
      })
    )

    // Lazy-create 30 min reminders (batched — no N+1)
    if (patient?.id) {
      const now = new Date()
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60000)

      const upcomingAppointments = await withPerf("notifications.upcoming", () =>
        prisma.appointment.findMany({
          where: {
            patientId: patient.id,
            status: "CONFIRMED",
            appointmentDate: {
              gt: now,
              lte: thirtyMinsFromNow,
            },
          },
          select: {
            id: true,
            doctor: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
          take: 5,
        })
      )

      if (upcomingAppointments.length > 0) {
        const aptIds = upcomingAppointments.map((a) => a.id)
        const existing = await prisma.notification.findMany({
          where: {
            userId,
            type: "APPOINTMENT",
            OR: aptIds.map((id) => ({ message: { contains: id } })),
          },
          select: { message: true },
        })
        const existingIds = new Set(
          existing.flatMap((n) => aptIds.filter((id) => n.message.includes(id)))
        )

        const toCreate = upcomingAppointments.filter((apt) => !existingIds.has(apt.id))
        if (toCreate.length > 0) {
          await prisma.notification.createMany({
            data: toCreate.map((apt) => ({
              userId,
              title: "Upcoming Session Reminder",
              message: `Your session with ${apt.doctor?.user?.name || "your therapist"} is starting in less than 30 minutes. (ID: ${apt.id})`,
              type: "APPOINTMENT",
            })),
          })
        }
      }
    }

    const notifications = await withPerf("notifications.list", () =>
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          createdAt: true,
        },
      })
    )

    perfLog("notifications.GET.total", performance.now() - start, {
      count: notifications.length,
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { notificationId } = body

    if (notificationId) {
      const notification = await prisma.notification.update({
        where: { id: notificationId, userId },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true, notification })
    }

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("[PATIENT_NOTIFICATIONS_PATCH]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
