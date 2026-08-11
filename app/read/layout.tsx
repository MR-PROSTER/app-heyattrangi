import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import LoadingBar from "@/components/ui/LoadingBar"

/**
 * Read article detail — full-bleed, no left sidebar.
 */
export default async function ReadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PATIENT") {
    redirect("/")
  }

  return (
    <div className="flex h-screen w-full bg-[#F9F8F3] overflow-hidden relative">
      <LoadingBar />
      <div className="flex-1 min-w-0 h-full flex flex-col relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}
