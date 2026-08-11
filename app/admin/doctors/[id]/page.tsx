import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard" className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                  Attrangi - Admin Panel
                </Link>
              </div>
              <SignOutButton />
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Doctor Not Found</h2>
            <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/admin/doctors"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Doctors List
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                Attrangi - Admin Panel
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/admin/doctors" className="text-sm text-gray-600 hover:text-gray-800">
                Doctors
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-600">Details</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/doctors"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back to List
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/doctors"
            className="text-sm text-gray-600 hover:text-gray-800 mb-4 inline-block"
          >
            ← Back to Doctors List
          </Link>
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Doctor Verification
          </h1>
          <p className="text-gray-600">
            Review documents and verify doctor credentials
          </p>
        </div>

        <DoctorVerificationPanel doctor={doctor} />
      </main>
    </div>
  )
}
