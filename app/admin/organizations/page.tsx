import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users, CalendarDays } from "lucide-react"
import AddOrganizationModal from "@/components/admin/AddOrganizationModal"
import OrganizationActionsDropdown from "@/components/admin/OrganizationActionsDropdown"

export default async function OrganizationsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
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
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Institutions
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Institutions and B2B
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Manage organizations, limits, and enrollment capacity from the shared admin shell.
          </p>
        </div>
        <AddOrganizationModal />
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
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
    </section>
  )
}
