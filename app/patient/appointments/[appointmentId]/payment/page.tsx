import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import PaymentPanel from "@/components/appointments/PaymentPanel"

export default async function AppointmentPaymentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }> | { appointmentId: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || (user.role !== "PATIENT")) {
    redirect("/auth/unauthorized")
  }

  // Handle params (Next.js 16 compatibility)
  let appointmentId: string
  try {
    const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
    appointmentId = resolvedParams.appointmentId
  } catch (error) {
    console.error("Error resolving params:", error)
    redirect("/patient/appointments")
  }

  if (!appointmentId) {
    redirect("/patient/appointments")
  }

  // Fetch appointment details with related data
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      doctor: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      patient: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      payment: true,
    },
  })

  if (!appointment) {
    return (
      <div className="flex-1 min-w-0 h-full overflow-y-auto w-full">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center max-w-2xl mx-auto mt-20">
            <h2 className="text-2xl font-semibold mb-4">Appointment Not Found</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              The appointment you're looking for doesn't exist.
            </p>
            <Link
              href="/patient/appointments"
              className="inline-block px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition-all"
            >
              View schedule
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Verify the appointment belongs to the current user
  const patient = await prisma.patient.findUnique({
    where: { userId: user?.id || "" },
  })

  if (!patient || appointment.patientId !== patient.id) {
    redirect("/auth/unauthorized")
  }

  // Check if payment is already completed
  if (appointment.paymentStatus === "PAID" && appointment.payment) {
    redirect(`/patient/appointments/${appointmentId}`)
  }

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto w-full bg-gray-50/30">
      <main className="max-w-lg mx-auto py-12">
        <PaymentPanel appointment={appointment} />
      </main>
    </div>
  )
}

