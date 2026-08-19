import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import DoctorVerificationPanel from "@/components/admin/DoctorVerificationPanel"

export default async function AdminDoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  // Handle params (Next.js 16 might pass it as a Promise)
  let doctorId: string
  try {
    const resolvedParams = await (params instanceof Promise ? params : Promise.resolve(params))
    doctorId = resolvedParams.id
  } catch (error) {
    console.error("Error resolving params:", error)
    redirect("/admin/doctors")
  }

  if (!doctorId) {
    console.error("No doctor ID provided")
    redirect("/admin/doctors")
  }

  // Fetch doctor details with all related data
  let doctor
  try {
    doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        availability: true,
      },
    })
  } catch (error) {
    console.error("Error fetching doctor:", error)
    redirect("/admin/doctors")
  }

  if (!doctor) {
    console.error("Doctor not found:", doctorId)
    return (
      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Doctor Not Found</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The doctor you&apos;re looking for does not exist or has been removed.
          </p>
          <Link
            href="/admin/doctors"
            className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            Back to Doctors List
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href="/admin/doctors"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          ← Back to Doctors List
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
          Doctor Verification
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Review documents and verify doctor credentials.
        </p>
      </div>

      <DoctorVerificationPanel doctor={doctor} />
    </section>
  )
}
