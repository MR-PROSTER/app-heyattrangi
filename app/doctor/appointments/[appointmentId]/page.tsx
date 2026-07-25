import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import DoctorDetailView from "./DoctorDetailView"
import { format, isSameDay } from "date-fns"

async function AppointmentDetailContent({ appointmentId }: { appointmentId: string }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "DOCTOR") redirect("/auth/signin")

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      patient: {
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
      payment: true,
    },
  })

  if (!appointment) notFound()

  // Verify this doctor owns this appointment
  const doctor = await prisma.doctor.findUnique({
    where: { userId: user?.id || "" }
  })
  if (!doctor || appointment.doctorId !== doctor.id) {
     redirect("/doctor/appointments")
  }

  const appointmentDate = new Date(appointment.appointmentDate)
  const isToday = isSameDay(appointmentDate, new Date())

  // Prepare data for the client component
  const appointmentData = {
    id: appointment.id,
    status: appointment.status,
    meetingLink: appointment.meetingLink,
    doctorNotes: appointment.doctorNotes,
    formattedDate: format(appointmentDate, "EEEE, MMM d, yyyy"),
    formattedTime: format(appointmentDate, "hh:mm a"),
    isToday,
    formattedAlertDate: format(appointmentDate, "EEEE, MMMM d, yyyy 'at' hh:mm a"),
    formattedBookingDate: format(new Date(appointment.createdAt), "PPP"),
    doctor: {
      id: appointment.doctor.id,
      fullName: appointment.doctor.fullName || appointment.doctor.user.name,
      user: {
        name: appointment.doctor.user.name,
        image: appointment.doctor.user.image,
      },
    },
    patient: {
      id: appointment.patient?.id || "",
      name: appointment.patient?.user?.name || "Patient",
      email: appointment.patient?.user?.email || "",
      image: appointment.patient?.user?.image || null,
      age: appointment.patient?.age || null,
      gender: appointment.patient?.gender || null,
      healthConcerns: appointment.patient?.healthConcerns || [],
      emergencyPhone: appointment.patient?.emergencyContactPhone || null,
    },
    payment: appointment.payment ? {
      id: appointment.payment.id,
      amount: appointment.payment.amount,
      status: appointment.payment.status,
      formattedPaymentDate: format(new Date(appointment.payment.createdAt), "PPP"),
    } : null,
  }

  return (
    <div className="flex-1 min-h-full overflow-y-auto pb-20 px-4 sm:px-6 md:px-8 xl:px-10 pt-10">
      <main className="w-full h-full flex flex-col">
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link 
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold mb-4 transition-colors group text-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg>
            Back to schedule
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">Session Details</h1>
              <p className="text-gray-400 font-bold text-[14px] sm:text-[15px]">View patient history, session information, and write case notes.</p>
            </div>
            <div className="flex items-center gap-2">
               <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                 appointment.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-gray-50 text-gray-500 border border-gray-100"
               }`}>
                 {appointment.status}
               </span>
            </div>
          </div>
        </div>

        <DoctorDetailView appointment={appointmentData} />
      </main>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`} />
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-white px-6 py-10 pb-24">
      <div className="w-full space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-[200px] rounded-[32px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-14 w-full rounded-2xl" />
              <Skeleton className="h-[400px] rounded-[32px]" />
           </div>
           <Skeleton className="h-[400px] rounded-[32px]" />
        </div>
      </div>
    </div>
  )
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ appointmentId: string }> | { appointmentId: string } }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <AppointmentDetailWrapper params={params} />
    </Suspense>
  )
}

async function AppointmentDetailWrapper({ params }: { params: Promise<{ appointmentId: string }> | { appointmentId: string } }) {
  const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
  const { appointmentId } = resolvedParams
  return <AppointmentDetailContent appointmentId={appointmentId} />
}
