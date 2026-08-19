export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CenterColumn from "@/components/patient/dashboard/CenterColumn"
import DashboardSkeleton from "@/components/patient/dashboard/DashboardSkeleton"
import { withPerf, perfLog } from "@/lib/perf"

function buildMockDailyTasks() {
  const today = new Date()
  return [
    { id: "mock-2", title: "Mindful Walk", type: "ACTIVITY", dueDate: new Date(new Date(today).setHours(12, 0, 0)) },
    { id: "mock-3", title: "Deep Breathing Focus", type: "MEDITATION", dueDate: new Date(new Date(today).setHours(15, 30, 0)) },
    { id: "mock-4", title: "Pragya AI Reflection", type: "AI_CHAT", dueDate: new Date(new Date(today).setHours(19, 0, 0)) },
  ]
}

async function fetchUpcomingAppointments(patientId: string) {
  return withPerf("DashboardContent.appointments", () =>
    prisma.appointment.findMany({
      where: {
        patientId,
        appointmentDate: { gt: new Date() },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: {
        id: true,
        appointmentDate: true,
        status: true,
        meetingLink: true,
        doctor: {
          select: {
            id: true,
            user: { select: { name: true, image: true } },
          },
        },
      },
      orderBy: { appointmentDate: "asc" },
      take: 10,
    }).then((rows) =>
      rows.map((apt) => ({
        ...apt,
        meetLink: apt.meetingLink,
      }))
    )
  )
}

async function DashboardContent() {
  const start = performance.now()

  // Deduped via React.cache — layout no longer re-runs the heavy user include
  const user = await getCurrentUser()

  if (!user?.id) return null

  const displayName = user.name || "You"
  const plan = user.plan || "FREE"
  const patientId = user.patient?.id

  const upcomingAppointments = patientId
    ? await fetchUpcomingAppointments(patientId)
    : []

  const dailyTasks = buildMockDailyTasks()

  perfLog("DashboardContent.total", performance.now() - start, {
    appointments: upcomingAppointments.length,
  })

  return (
    <div className="flex flex-1 w-full relative h-full">
      <CenterColumn
        displayName={displayName}
        plan={plan}
        upcomingAppointments={upcomingAppointments}
        dailyTasks={dailyTasks}
        userImage={user.image}
      />
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
