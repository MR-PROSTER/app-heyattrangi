import { format, formatDistanceToNow } from "date-fns"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ParamsValue = Promise<{ id: string }> | { id: string }

function resolveStatus(user: {
  role: string
  patient?: { studentStatus?: string | null } | null
  doctor?: { status?: string | null } | null
}) {
  if (user.role === "PATIENT") return user.patient?.studentStatus || "ACTIVE"
  if (user.role === "DOCTOR") return user.doctor?.status || "PENDING_PROFILE"
  return user.role
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: ParamsValue
}) {
  const session = await auth()
  const admin = await getCurrentUser()

  if (!session?.user || admin?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  const resolvedParams = await Promise.resolve(params)
  const userId = resolvedParams.id
  if (!userId) {
    redirect("/admin/users")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      patient: {
        select: {
          age: true,
          gender: true,
          preferredLanguage: true,
          batchId: true,
          departmentId: true,
          rollNumber: true,
          studentStatus: true,
          lastLoginDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      doctor: {
        select: {
          status: true,
          fullName: true,
          mobileNumber: true,
          primarySpecialization: true,
          licenseVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      admin: {
        select: {
          phoneNumber: true,
          otpEnabled: true,
          permissions: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          domains: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/admin/users")
  }

  const [
    conversations,
    messages,
    moods,
    journals,
    activities,
    assessments,
    supportMessages,
  ] = await Promise.all([
    prisma.conversation.count({
      where: { userId: user.id },
    }),
    prisma.message.count({
      where: {
        role: "USER",
        conversation: {
          is: {
            userId: user.id,
          },
        },
      },
    }),
    prisma.moodEntry.count({
      where: { userId: user.id },
    }),
    prisma.journalEntry.count({
      where: { userId: user.id },
    }),
    prisma.userActivityLog.count({
      where: { userId: user.id },
    }),
    prisma.assessmentAttempt.count({
      where: { userId: user.id, status: "COMPLETED" },
    }),
    prisma.supportMessage.count({
      where: { userId: user.id },
    }),
  ])

  const recentActivity = [
    ...(await prisma.moodEntry.findMany({
      where: { userId: user.id },
      select: { timestamp: true },
      orderBy: { timestamp: "desc" },
      take: 3,
    })).map((entry) => ({
      kind: "Mood check-in",
      at: entry.timestamp,
    })),
    ...(await prisma.journalEntry.findMany({
      where: { userId: user.id },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    })).map((entry) => ({
      kind: "Journal entry",
      at: entry.createdAt,
    })),
    ...(await prisma.userActivityLog.findMany({
      where: { userId: user.id },
      select: { timestamp: true },
      orderBy: { timestamp: "desc" },
      take: 3,
    })).map((entry) => ({
      kind: "Wellness activity",
      at: entry.timestamp,
    })),
    ...(await prisma.message.findMany({
      where: {
        role: "USER",
        conversation: { is: { userId: user.id } },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    })).map((entry) => ({
      kind: "Pragya message",
      at: entry.createdAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10)

  const status = resolveStatus(user)
  const lastActive = user.patient?.lastLoginDate || user.updatedAt || user.createdAt

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              User detail
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              {user.name || "Unnamed user"}
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Operational profile for lookup, status checks, and activity review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/users"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Back to Users
            </Link>
            <span className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              {status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Messages", value: messages },
          { label: "Mood entries", value: moods },
          { label: "Journals", value: journals },
          { label: "Wellness logs", value: activities },
          { label: "Assessments", value: assessments },
          { label: "Support messages", value: supportMessages },
          { label: "Conversations", value: conversations },
          { label: "Last active", value: formatDistanceToNow(lastActive, { addSuffix: true }) },
        ].map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
              {item.label}
            </div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-950">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Profile
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Account details
          </h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Email", value: user.email || "No email" },
              { label: "Role", value: user.role },
              { label: "Institution", value: user.organization?.name || "Independent" },
              { label: "Joined", value: format(user.createdAt, "dd MMM yyyy") },
              { label: "Last updated", value: format(user.updatedAt, "dd MMM yyyy") },
              { label: "Last active", value: format(lastActive, "dd MMM yyyy") },
            ].map((field) => (
              <div key={field.label} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  {field.label}
                </dt>
                <dd className="mt-2 text-sm font-bold text-slate-900">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
            Recent activity
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
            Aggregate timeline
          </h2>
          {recentActivity.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500">
              No tracked activity found for this user.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recentActivity.map((item, index) => (
                <div key={`${item.kind}-${index}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.kind}</div>
                    <div className="text-xs text-slate-500">No content shown</div>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    {format(item.at, "dd MMM yyyy, HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Related profile
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">
          Role-specific metadata
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {user.patient && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Student status
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.patient.studentStatus}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Preferred language
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.patient.preferredLanguage || "English"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Roll number
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.patient.rollNumber || "Not set"}</div>
              </div>
            </>
          )}
          {user.doctor && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Doctor status
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.doctor.status || "Unknown"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Specialization
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.doctor.primarySpecialization || "Not set"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  License verified
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.doctor.licenseVerified ? "Yes" : "No"}</div>
              </div>
            </>
          )}
          {user.admin && (
            <>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Admin OTP
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">{user.admin.otpEnabled ? "Enabled" : "Disabled"}</div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Permissions
                </div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  {user.admin.permissions.length > 0 ? user.admin.permissions.join(", ") : "None"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
