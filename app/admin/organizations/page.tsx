import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Users, CalendarDays, MoreVertical } from "lucide-react"
import AddOrganizationModal from "@/components/admin/AddOrganizationModal"
import OrganizationActionsDropdown from "@/components/admin/OrganizationActionsDropdown"

export default async function OrganizationsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/")
  }

  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: { users: true, batches: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-[#fafcfd] text-gray-800 font-sans relative flex flex-col">
      <nav className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </Link>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Institutions & B2B</h1>
            </div>
            <AddOrganizationModal />
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wider rounded-t-[1.5rem]">
              <tr>
                <th className="px-6 py-5">Institution</th>
                <th className="px-6 py-5">Limits (Sessions/Students)</th>
                <th className="px-6 py-5">Current Stats</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {organizations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500 font-medium">
                    No institutions found. Add one to get started.
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500 font-medium">{org.domains.join(", ") || "No domains"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-gray-800">
                        {org.sessionLimit || "Unlimited"} / {org.studentLimit || "Unlimited"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1.5"><Users size={16} className="text-gray-400" /> {org._count.users}</div>
                        <div className="flex items-center gap-1.5"><CalendarDays size={16} className="text-gray-400" /> {org._count.batches} Batches</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        org.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {org.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <OrganizationActionsDropdown org={{
                        id: org.id,
                        name: org.name,
                        domains: org.domains,
                        sessionLimit: org.sessionLimit,
                        studentLimit: org.studentLimit,
                        status: org.status
                      }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
