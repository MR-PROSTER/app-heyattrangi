import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/doctor/Sidebar"
import LoadingBar from "@/components/ui/LoadingBar"

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "DOCTOR") {
    redirect("/auth/unauthorized")
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden relative">
      <LoadingBar />
      <Sidebar />
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
