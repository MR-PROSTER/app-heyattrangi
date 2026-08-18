import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"

export default async function AdminEngagementPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Engagement
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Product usage analytics
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This section will surface DAU, WAU, MAU, feature usage, chat frequency,
          mood activity, repeat usage, and streak distribution once the aggregate
          APIs are connected.
        </p>
      </div>
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/70 p-8 text-sm text-slate-500">
        Analytics wiring comes next. No fabricated metrics are shown here.
      </div>
    </section>
  )
}
