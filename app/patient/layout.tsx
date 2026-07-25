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

  // Allow guest (unauthenticated) users on the chatbot route, rendering without the sidebar
  if (pathname === "/patient/ai-bot") {
    if (!user) {
      return (
        <div className="flex h-screen w-full bg-white overflow-hidden relative">
          <LoadingBar />
          <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
            {children}
          </div>
        </div>
      )
    }
  }

  if (!user || (user.role !== "PATIENT")) {
    redirect("/auth/unauthorized")
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

