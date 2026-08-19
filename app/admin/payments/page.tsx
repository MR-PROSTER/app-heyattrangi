import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"

export default async function PaymentsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Finance
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Payments and transactions
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This module is still under construction. The shared admin shell now handles
          the navigation and session framing for this page.
        </p>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Financial Hub</h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Soon you will be able to audit transactions, process payouts, and monitor
          platform revenue here.
        </p>
      </div>
    </section>
  )
}
