import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"

export default async function AdminInstitutionsPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Institutions
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Cross-institution comparison
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This page will compare organization cohorts by active users, activation,
          retention, chat usage, mood usage, and feature adoption.
        </p>
      </div>
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/70 p-8 text-sm text-slate-500">
        The institution analytics API is still pending.
      </div>
    </section>
  )
}
