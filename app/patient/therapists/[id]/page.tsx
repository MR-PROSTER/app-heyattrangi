import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import TherapistBookingPanel from "@/components/therapists/TherapistBookingPanel"

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || (user.role !== "PATIENT")) {
    redirect("/")
  }

  // Handle params (Next.js 16 compatibility)
  let doctorId: string
  try {
    const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
    doctorId = resolvedParams.id
  } catch (error) {
    console.error("Error resolving params:", error)
    redirect("/patient/therapists")
  }

  if (!doctorId) {
    redirect("/patient/therapists")
  }

  // Fetch doctor details and appointments
  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      availability: true,
      appointments: {
        where: {
          appointmentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          },
          OR: [
            { status: "CONFIRMED" },
            { status: "COMPLETED" },
            { 
              status: "PENDING", 
              createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } 
            }
          ]
        },
        select: {
          appointmentDate: true
        }
      }
    },
  })

  if (!doctor || doctor.status !== "VERIFIED") {
    return (
      <div className="flex-1 min-w-0 h-full overflow-y-auto w-full bg-[var(--color-bg)]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Therapist Not Available</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              This therapist is not available or has not been approved yet.
            </p>
            <Link
              href="/patient/therapists"
              className="inline-block px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg font-medium hover:opacity-90 transition-all"
            >
              Browse Other Therapists
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto w-full bg-[#f8fafd]">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Minimalist Top Bar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/patient/therapists"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-500 transition-all text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Specialist Details</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 text-red-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </div>

        <TherapistBookingPanel doctor={doctor} />
      </main>
    </div>
  )
}

