import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default async function PaymentsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  return (
    <div className="min-h-screen bg-[#fafcfd] text-gray-800 font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-100/40 blur-[100px] rounded-full pointer-events-none" />
      
      <nav className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-20 gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Payments & Transactions</h1>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="text-center max-w-md bg-white p-10 rounded-[2rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Financial Hub</h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            This module is currently under construction. Soon, you will be able to audit Razorpay transactions, process therapist payouts, and monitor platform revenue here.
          </p>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20">
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
