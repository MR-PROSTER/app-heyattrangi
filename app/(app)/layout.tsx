import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { QuickBreatheButton } from "@/features/activities/components/QuickBreatheButton"

export default async function AppExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") {
    redirect("/")
  }
  return (
    <>
      {children}
      <QuickBreatheButton />
    </>
  )
}
