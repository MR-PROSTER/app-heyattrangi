export const dynamic = 'force-dynamic'
import { Suspense } from "react"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CenterColumn from "@/components/patient/dashboard/CenterColumn"
import RightColumn from "@/components/patient/dashboard/RightColumn"
import BotPopup from "@/components/patient/dashboard/BotPopup"
import DailyRewardPopup from "@/components/patient/dashboard/DailyRewardPopup"
import DashboardSkeleton from "@/components/patient/dashboard/DashboardSkeleton"

async function DashboardContent() {
  const session = await auth()
  const user = await getCurrentUser()
  
  if (!user?.id) return null

  const displayName = session?.user?.name || "You"
  const plan = user?.plan || "FREE"
  const patient = await prisma.patient.findUnique({ where: { userId: user?.id || "" } })

  let upcomingAppointments: any[] = []
  let dailyTasks: any[] = []

  if (patient) {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: { user: { select: { name: true, image: true } } },
        },
      },
      orderBy: { appointmentDate: "asc" },
    })

    const now = new Date()
    upcomingAppointments = appointments.filter(
      (apt) => new Date(apt.appointmentDate) > now && (apt.status === "CONFIRMED" || apt.status === "COMPLETED")
    )

    dailyTasks = []

    if (dailyTasks.length === 0) {
        const today = new Date()
        dailyTasks = [
            { id: "mock-1", title: "Morning Journaling", type: "JOURNAL", dueDate: new Date(today.setHours(9, 30, 0)) },
            { id: "mock-2", title: "Mindful Walk", type: "ACTIVITY", dueDate: new Date(today.setHours(12, 0, 0)) },
            { id: "mock-3", title: "Deep Breathing Focus", type: "MEDITATION", dueDate: new Date(today.setHours(15, 30, 0)) },
            { id: "mock-4", title: "Pragya AI Reflection", type: "AI_CHAT", dueDate: new Date(today.setHours(19, 0, 0)) },
        ]
    }
  }

  return (
    <div className="flex flex-1 w-full relative h-full">
      <CenterColumn displayName={displayName} plan={plan} upcomingAppointments={upcomingAppointments} dailyTasks={dailyTasks} />
      <RightColumn upcomingAppointments={upcomingAppointments} />
      <DailyRewardPopup />
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
