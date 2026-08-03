import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import LoadingBar from "@/components/ui/LoadingBar"
import PatientShell from "@/components/patient/PatientShell"
import { headers } from "next/headers"
import { withPerf } from "@/lib/perf"

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return withPerf("PatientLayout", async () => {
    const headersList = await headers()
    const pathname = headersList.get("x-pathname") || ""

    // Role comes from JWT claims (no doctor/admin/patient join on every navigation)
    const session = await auth()

    // Allow guest (unauthenticated) users on the chatbot route, rendering without the sidebar
    if (pathname === "/patient/ai-bot") {
      if (!session?.user) {
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

    if (!session?.user || session.user.role !== "PATIENT") {
      redirect("/auth/unauthorized")
    }

    return <PatientShell>{children}</PatientShell>
  })
}
