import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || (user.role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
    redirect("/")
  }

  // Fetch doctor statistics
  const doctors = await prisma.doctor.findMany({
    select: {
      status: true,
    },
  })

  const pendingCount = doctors.filter(d => d.status === "PENDING_PROFILE" || d.status === "PENDING_DOCUMENTS" || d.status === "PENDING_REVIEW").length
  const totalDoctors = doctors.length
 
  // Fetch support message statistics
  const newMessagesCount = await prisma.supportMessage.count({
    where: {
      isRead: false,
    },
  })
 
  return (
    <div className="min-h-screen bg-[#fafcfd] text-gray-800 font-sans relative overflow-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-orange-100/40 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-100/40 blur-[100px] rounded-full pointer-events-none" />
 
      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-[0_4px_14px_rgba(249,107,19,0.25)]">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h1 className="text-xl font-black tracking-tight text-gray-900">Attrangi Admin</h1>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/admin/profile"
                className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors"
              >
                Profile
              </Link>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-700">
                  {session.user.name?.split(" ")[0] || "Admin"}
                </span>
                <div className="scale-90 opacity-80 hover:opacity-100 transition-opacity">
                  <SignOutButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
 
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-gray-500 font-medium">
            Monitor platform health, verify doctors, and manage global settings.
          </p>
        </div>
 
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stat Card 1 */}
          <Link href="/admin/doctors" className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-orange-200 hover:shadow-[0_8px_30px_rgba(249,107,19,0.08)] transition-all duration-300 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="text-gray-500 font-bold mb-2">Pending Approvals</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-gray-900">{pendingCount}</p>
                <span className="text-xs font-black uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">Action Required</span>
              </div>
            </div>
          </Link>
 
          {/* Stat Card 2 */}
          <Link href="/admin/doctors" className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-blue-200 hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] transition-all duration-300 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="text-gray-500 font-bold mb-2">Total Verified Doctors</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-gray-900">{totalDoctors}</p>
              </div>
            </div>
          </Link>
 
          {/* Stat Card 3 */}
          <div className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 transition-all duration-300 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-6 text-green-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-gray-500 font-bold mb-2">Platform Revenue</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-gray-900">₹0</p>
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">This Month</span>
              </div>
            </div>
          </div>
 
          {/* Stat Card 4: Support Messages */}
          <Link href="/admin/support-messages" className="group relative bg-white border border-gray-100 rounded-[2rem] p-8 hover:border-rose-200 hover:shadow-[0_8px_30px_rgba(244,63,94,0.08)] transition-all duration-300 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-6 text-rose-500 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <h3 className="text-gray-500 font-bold mb-2">Support Messages</h3>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-gray-900">{newMessagesCount}</p>
                {newMessagesCount > 0 && (
                  <span className="text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">New</span>
                )}
              </div>
            </div>
          </Link>
        </div>
 
        {/* Quick Actions Grid */}
        <div className="mb-6">
          <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
            Management Modules
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <Link
              href="/admin/doctors"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Doctors & Clinical</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  Verify KYC documents, approve new therapists, and monitor active practitioners.
                </p>
              </div>
            </Link>
 
            <Link
              href="/admin/patients"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Patients & Accounts</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  Manage user profiles, view platform activity, and handle account recovery.
                </p>
              </div>
            </Link>
 
            <Link
              href="/admin/payments"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">Payments & Tranx</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  Audit razorpay transactions, process therapist payouts, and view invoices.
                </p>
              </div>
            </Link>
 
            <Link
              href="/admin/organizations"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Institutions & B2B</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  Manage school tie-ups, B2B enterprise plans, and institutional metrics.
                </p>
              </div>
            </Link>
 
            <Link
              href="/admin/support-messages"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">Support Messages</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  Read messages from our founder contact flow, reply to support, and track resolution.
                </p>
              </div>
            </Link>
 
            <Link
              href="/institution"
              className="group relative p-6 bg-white border border-gray-100 rounded-[1.5rem] hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Institution Portal (Demo)</h4>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  View the new batches, students, and departments management screens.
                </p>
              </div>
            </Link>
 
          </div>
        </div>

      </main>
    </div>
  )
}
