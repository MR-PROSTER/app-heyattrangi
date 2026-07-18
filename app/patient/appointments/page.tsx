export const dynamic = 'force-dynamic'
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import AppointmentsList from "@/components/appointments/AppointmentsList"
import ScheduleSkeleton from "@/components/appointments/ScheduleSkeleton"
import { redirect } from "next/navigation"

async function AppointmentsContent() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/signin")

  const patient = await prisma.patient.findUnique({
    where: { userId: user?.id || "" },
  })

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="text-center bg-white rounded-[40px] border border-gray-100 p-12 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-3">Finish setting up your profile</h2>
          <p className="text-gray-400 font-bold mb-8">Add a few details so we can show your appointments here when you book.</p>
          <Link
            href="/patient/profile"
            className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
          >
            Complete profile
          </Link>
        </div>
      </div>
    )
  }

  const now = new Date()

  // Fetch upcoming appointments
  const upcomingAppointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      appointmentDate: { gt: now },
      status: { in: ["CONFIRMED", "COMPLETED"] },
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

  // Fetch past appointments
  const pastAppointments = await prisma.appointment.findMany({
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

  return (
    <div className="min-h-screen bg-[#F7F8FA] selection:bg-orange-100 selection:text-orange-600">
      <main className="mx-auto max-w-[1440px] px-8 pt-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Schedule</h1>
            <p className="text-gray-400 font-bold text-lg">Manage your upcoming and past therapy sessions</p>
          </div>
          <Link
            href="/patient/therapists"
            className="flex items-center gap-2 rounded-2xl bg-[#F97316] px-6 py-4 text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[14px] font-black">Book a session</span>
          </Link>
        </div>

        <AppointmentsList
          upcomingAppointments={upcomingAppointments}
          pastAppointments={pastAppointments}
        />
      </main>
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<ScheduleSkeleton />}>
      <AppointmentsContent />
    </Suspense>
  )
}
