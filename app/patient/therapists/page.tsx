import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TherapistDashboard from "@/components/therapists/TherapistDashboard"

async function TherapistsContent() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/signin")

  const patient = await prisma.patient.findUnique({
    where: { userId: user?.id || "" },
  })

  // If no patient record, we can still pass empty arrays. The dashboard will handle it or they can complete their profile.
  let upcomingAppointments: any[] = []
  let pastAppointments: any[] = []

  if (patient) {
    const now = new Date()

    upcomingAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        appointmentDate: { gt: now },
        status: { not: "CANCELLED" },
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
        payment: {
          select: { id: true, amount: true, status: true, createdAt: true },
        },
      },
      orderBy: { appointmentDate: "asc" },
    })

    pastAppointments = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        OR: [
          { appointmentDate: { lte: now } },
          { status: "COMPLETED" },
          { status: "CANCELLED" },
        ],
      },
      include: {
        doctor: {
          include: {
            user: {
              select: { name: true, email: true, image: true },
            },
          },
        },
        payment: {
          select: { id: true, amount: true, status: true, createdAt: true },
        },
      },
      orderBy: { appointmentDate: "desc" },
    })
  }

  return (
    <TherapistDashboard 
      upcomingAppointments={upcomingAppointments} 
      pastAppointments={pastAppointments} 
    />
  )
}

export default function TherapistsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 min-w-0 h-full flex items-center justify-center bg-white">
        <div className="animate-pulse text-gray-400 font-medium">Loading therapist hub...</div>
      </div>
    }>
      <TherapistsContent />
    </Suspense>
  )
}
