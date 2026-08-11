import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SecondaryColumn from "@/components/doctor/dashboard/SecondaryColumn"
import CenterColumn from "@/components/doctor/dashboard/CenterColumn"
import RightColumn from "@/components/doctor/dashboard/RightColumn"

export default async function DoctorDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "DOCTOR") {
    redirect("/auth/unauthorized")
  }

  const displayName = session.user.name || "Doctor"

  const doctor = await prisma.doctor.findUnique({ where: { userId: user?.id || "" } })

  let upcomingAppointments: any[] = []
  if (doctor) {
    // Step 1: fetch appointments with patient (but NOT user include, to avoid null-relation crash)
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: { patient: true },
      orderBy: { appointmentDate: "asc" },
    })

    // Step 2: collect valid userIds and fetch matching users
    const patientUserIds = appointments
      .map((a) => a.patient?.userId)
      .filter(Boolean) as string[]

    const users = await prisma.user.findMany({
      where: { id: { in: patientUserIds } },
      select: { id: true, name: true, image: true },
    })
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

    // Step 3: merge user back onto patient, skip any orphaned records
    const now = new Date()
    upcomingAppointments = appointments
      .filter((apt) => {
        const isValidPatient = apt.patient?.userId && userMap[apt.patient.userId]
        const endTime = new Date(new Date(apt.appointmentDate).getTime() + 45 * 60000)
        return isValidPatient && endTime > now && apt.status !== "CANCELLED"
      })
      .map((apt) => ({
        ...apt,
        patient: {
          ...apt.patient,
          user: userMap[apt.patient!.userId],
        },
      }))
  }

  return (
    <div className="flex flex-1 w-full relative h-full">
      <CenterColumn displayName={displayName} upcomingAppointments={upcomingAppointments} />
      <RightColumn upcomingAppointments={upcomingAppointments} />
    </div>
  )
}
