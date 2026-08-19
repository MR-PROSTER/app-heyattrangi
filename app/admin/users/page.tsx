import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type SearchParamsValue = Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>

function readParams(searchParams?: SearchParamsValue) {
  return Promise.resolve(searchParams).then((resolved) => {
    const params = new URLSearchParams()
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

function resolveStatus(user: {
  role: string
  patient?: { studentStatus?: string | null } | null
  doctor?: { status?: string | null } | null
}) {
  if (user.role === "PATIENT") return user.patient?.studentStatus || "ACTIVE"
  if (user.role === "DOCTOR") return user.doctor?.status || "PENDING_PROFILE"
  return user.role
}

function resolveLastActive(user: {
  patient?: { lastLoginDate?: Date | null } | null
  updatedAt: Date
  createdAt: Date
}) {
  return user.patient?.lastLoginDate || user.updatedAt || user.createdAt
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: SearchParamsValue
}) {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const params = await readParams(searchParams)
  const query = params.get("search") || ""
  const status = params.get("status") || "all"
  const page = Math.max(1, parseInt(params.get("page") || "1", 10))
  const limit = Math.min(50, Math.max(10, parseInt(params.get("limit") || "20", 10)))
  const organizationId = params.get("organizationId") || null
  const range = params.get("range") || "last7"
  const sort = params.get("sort") || "joined"
  const dir = params.get("dir") === "asc" ? "asc" : "desc"

  const where = {
    ...(organizationId ? { orgId: organizationId } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { email: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      patient: {
        select: {
          studentStatus: true,
          lastLoginDate: true,
        },
      },
      doctor: {
        select: {
          status: true,
        },
      },
      organization: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const rows = users
    .map((item) => ({
      id: item.id,
      name: item.name || "Unnamed user",
      email: item.email || "No email",
      institution: item.organization?.name || "Independent",
      joined: item.createdAt,
      lastActive: resolveLastActive(item),
      role: item.role,
      status: resolveStatus(item),
    }))
    .filter((item) => status === "all" || item.status === status)
    .sort((a, b) => {
      const direction = dir === "asc" ? 1 : -1
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name) * direction
        case "email":
          return a.email.localeCompare(b.email) * direction
        case "institution":
          return a.institution.localeCompare(b.institution) * direction
        case "status":
          return String(a.status).localeCompare(String(b.status)) * direction
        case "lastActive":
          return (a.lastActive.getTime() - b.lastActive.getTime()) * direction
        case "joined":
        default:
          return (a.joined.getTime() - b.joined.getTime()) * direction
      }
    })

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(page, totalPages)
  const paginatedRows = rows.slice((safePage - 1) * limit, safePage * limit)

  const makePageHref = (nextPage: number) => {
    const nextParams = new URLSearchParams(params.toString())
    nextParams.set("page", String(nextPage))
    nextParams.set("range", range)
    nextParams.set("sort", sort)
    nextParams.set("dir", dir)
    if (organizationId) nextParams.set("organizationId", organizationId)
    return `/admin/users?${nextParams.toString()}`
  }

  const setSortHref = (nextSort: string) => {
    const nextParams = new URLSearchParams(params.toString())
    const isSameSort = nextParams.get("sort") === nextSort
    nextParams.set("sort", nextSort)
    nextParams.set("dir", isSameSort && dir === "desc" ? "asc" : "desc")
    nextParams.set("page", "1")
    nextParams.set("range", range)
    if (organizationId) nextParams.set("organizationId", organizationId)
    return `/admin/users?${nextParams.toString()}`
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Operational lookup
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Search internal users by name or email, filter by institution and status,
          and inspect join dates and last active timestamps.
        </p>
      </div>

      <form className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm" method="get">
        <input type="hidden" name="range" value={range} />
        {organizationId ? <input type="hidden" name="organizationId" value={organizationId} /> : null}
        <div className="grid gap-4 md:grid-cols-[1.5fr_0.8fr_auto]">
          <input
            name="search"
            defaultValue={query}
            placeholder="Search by name or email"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none"
          >
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="GRADUATED">Graduated</option>
            <option value="PENDING_PROFILE">Pending profile</option>
            <option value="PENDING_DOCUMENTS">Pending documents</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ADMIN">Admin</option>
            <option value="INSTITUTION_ADMIN">Institution admin</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            Search
          </button>
        </div>
      </form>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              Results
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              {total} matching users
            </h2>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            Page {safePage} of {totalPages}
          </div>
        </div>

        {paginatedRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-sm text-slate-500">
            No users found for the selected filters.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                <tr>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("name")}>Name</Link>
                  </th>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("email")}>Email</Link>
                  </th>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("institution")}>Institution</Link>
                  </th>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("joined")}>Joined</Link>
                  </th>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("lastActive")}>Last active</Link>
                  </th>
                  <th className="px-4 py-4">
                    <Link href={setSortHref("status")}>Status</Link>
                  </th>
                  <th className="px-4 py-4">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      <Link href={`/admin/users/${row.id}`} className="hover:text-[#c87d00]">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{row.email}</td>
                    <td className="px-4 py-4 text-slate-600">{row.institution}</td>
                    <td className="px-4 py-4 text-slate-600">{format(row.joined, "dd MMM yyyy")}</td>
                    <td className="px-4 py-4 text-slate-600">{format(row.lastActive, "dd MMM yyyy")}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/users/${row.id}`}
                        className="inline-flex rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-500">
            Sorted by {sort} ({dir})
          </div>
          <Link
            href={makePageHref(Math.max(1, safePage - 1))}
            className={`rounded-2xl border px-4 py-2 text-sm font-bold ${
              safePage <= 1 ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Previous
          </Link>
          <Link
            href={makePageHref(Math.min(totalPages, safePage + 1))}
            className={`rounded-2xl border px-4 py-2 text-sm font-bold ${
              safePage >= totalPages ? "pointer-events-none border-slate-200 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  )
}
