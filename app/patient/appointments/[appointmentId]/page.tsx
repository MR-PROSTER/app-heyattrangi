import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import DetailView from "./DetailView"
import { format, isSameDay } from "date-fns"

async function AppointmentDetailContent({ appointmentId }: { appointmentId: string }) {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/signin")

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
            select: { name: true, email: true },
          },
        },
      },
      payment: true,
    },
  })

  if (!appointment) notFound()

  const appointmentDate = new Date(appointment.appointmentDate)
  const isToday = isSameDay(appointmentDate, new Date())

  // Prepare data for the client component
  const appointmentData = {
    id: appointment.id,
    status: appointment.status,
    meetingLink: appointment.meetingLink,
    doctorNotes: appointment.doctorNotes,
    actualDuration: appointment.actualDuration,
    patientRating: appointment.patientRating,
    patientFeedback: appointment.patientFeedback,
    formattedDate: format(appointmentDate, "EEEE, MMM d, yyyy"),
    formattedTime: format(appointmentDate, "hh:mm a"),
    isToday,
    formattedAlertDate: format(appointmentDate, "EEEE, MMMM d, yyyy 'at' hh:mm a"),
    formattedBookingDate: format(new Date(appointment.createdAt), "PPP"),
    doctor: {
      id: appointment.doctor.id,
      fullName: appointment.doctor.fullName,
      primarySpecialization: appointment.doctor.primarySpecialization,
      specialization: appointment.doctor.specialization,
      consultationFee: appointment.doctor.consultationFee,
      user: {
        name: appointment.doctor.user.name,
        image: appointment.doctor.user.image,
      },
    },
    patient: {
      name: appointment.patient?.user?.name || null,
      email: appointment.patient?.user?.email || null,
    },
    payment: appointment.payment ? {
      id: appointment.payment.id,
      amount: appointment.payment.amount,
      status: appointment.payment.status,
      formattedPaymentDate: format(new Date(appointment.payment.createdAt), "PPP"),
    } : null,
  }

  return (
    <div className="flex-1 min-h-full overflow-y-auto selection:bg-orange-100 selection:text-orange-900 pb-20 px-4 sm:px-6 md:px-8 xl:px-10 pt-10">
      <main className="w-full h-full flex flex-col">
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link 
            href="/patient/appointments"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 font-bold mb-4 transition-colors group text-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7"/></svg>
            Back to schedule
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-2">Appointment Details</h1>
          <p className="text-gray-400 font-bold text-[14px] sm:text-[15px]">View your appointment information, session details, and payment history.</p>
        </div>

        <DetailView appointment={appointmentData} />
      </main>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded-2xl ${className}`} />
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] px-6 py-10 pb-24">
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
