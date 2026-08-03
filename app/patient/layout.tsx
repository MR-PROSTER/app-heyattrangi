import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Sidebar from "@/components/patient/Sidebar"
import LoadingBar from "@/components/ui/LoadingBar"
import { headers } from "next/headers"

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  const user = await getCurrentUser()

  // Allow guests to bypass unauthorized redirect for the ai-bot route
  if (!user || user.role !== "PATIENT") {
    if (pathname !== "/patient/ai-bot") {
      redirect("/auth/unauthorized")
    }
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <LoadingBar />
      <Sidebar />
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}

