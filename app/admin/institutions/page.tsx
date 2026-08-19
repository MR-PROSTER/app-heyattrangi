import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { buildInstitutionAnalytics, resolveAdminRange } from "@/lib/admin/analytics"

function parseSearchParams(
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams()
  return Promise.resolve(searchParams).then((resolved) => {
    if (!resolved) return params
    for (const [key, value] of Object.entries(resolved)) {
      if (Array.isArray(value)) {
        if (value[0]) params.set(key, value[0])
      } else if (typeof value === "string" && value) {
        params.set(key, value)
      }
    }
    return params
  })
}

export default async function AdminInstitutionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>
}) {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const params = await parseSearchParams(searchParams)
  const parsed = resolveAdminRange(params)
  if (parsed.error) {
    return <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-900">{parsed.error}</div>
  }

  const data = await buildInstitutionAnalytics({
    range: parsed.range,
    organizationId: parsed.organizationId || null,
  })

  const selectedOrg = parsed.organizationId
    ? data.institutions.find((institution) => institution.id === parsed.organizationId)
    : null

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Institutions
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Cross-institution comparison
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          {data.range.label}. Compare user volume, activation, retention, chat usage,
          and mood usage across organizations.
        </p>
      </div>

      {selectedOrg && (
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Users", value: selectedOrg.totalUsers },
            { label: "Active", value: selectedOrg.activeUsers },
            { label: "Activation", value: `${selectedOrg.activationRate}%` },
            { label: "Retention", value: `${selectedOrg.retentionRate}%` },
          ].map((item) => (
            <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
              <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Comparison table
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              All organizations
            </h2>
          </div>
        </div>

        {data.institutions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
            No institutions found for this filter.
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">Institution</th>
                  <th className="px-4 py-4">Users</th>
                  <th className="px-4 py-4">Active</th>
                  <th className="px-4 py-4">Activation</th>
                  <th className="px-4 py-4">Retention</th>
                  <th className="px-4 py-4">Chat usage</th>
                  <th className="px-4 py-4">Mood usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.institutions.map((institution) => (
                  <tr
                    key={institution.id}
                    className={selectedOrg?.id === institution.id ? "bg-amber-50/60" : ""}
                  >
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {institution.name}
                      <div className="text-xs font-medium text-slate-500">
                        {institution.domains.join(", ") || "No domains"}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{institution.totalUsers}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.activeUsers}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.activationRate}%</td>
                    <td className="px-4 py-4 text-slate-600">{institution.retentionRate}%</td>
                    <td className="px-4 py-4 text-slate-600">{institution.chatUsage}</td>
                    <td className="px-4 py-4 text-slate-600">{institution.moodUsage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
