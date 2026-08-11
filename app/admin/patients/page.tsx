import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import PatientListClient from "@/components/admin/PatientListClient"

export default async function PatientsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch all users with role PATIENT
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-[#fafcfd] text-gray-800 font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-100/40 blur-[100px] rounded-full pointer-events-none" />
      
      <nav className="relative z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-20 gap-4">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="text-xl font-black tracking-tight text-gray-900">Patients & Accounts</h1>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10 p-6 overflow-y-auto">
         <PatientListClient patients={patients} />
      </main>
    </div>
  )
}

