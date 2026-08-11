import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function AdminDoctorsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  // Fetch all doctors with their user info
  const doctors = await prisma.doctor.findMany({
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
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get counts
  const pendingCount = doctors.filter(d => d.status === "PENDING_PROFILE" || d.status === "PENDING_DOCUMENTS" || d.status === "PENDING_REVIEW").length
  const approvedCount = doctors.filter(d => d.status === "VERIFIED").length

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
              <span className="text-sm text-gray-600">Doctors</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                Doctor Management
              </h1>
              <p className="text-gray-600">
                View and verify doctor registrations
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-800">{doctors.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No doctors registered yet
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-semibold mr-3">
                            {(doctor.fullName || doctor.user.name || "D")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {doctor.fullName || doctor.user.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {doctor.primarySpecialization || doctor.specialization || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {doctor.licenseNumber || "Not provided"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            doctor.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : doctor.status === "PENDING_PROFILE" || doctor.status === "PENDING_DOCUMENTS" || doctor.status === "PENDING_REVIEW"
                              ? "bg-yellow-100 text-yellow-800"
                              : doctor.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {doctor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doctor.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/doctors/${doctor.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

