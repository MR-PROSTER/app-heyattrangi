import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import SettingsClient from "@/components/settings/SettingsClient"

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/")

  return (
    <SettingsLayout title="Settings" backHref="/dashboard/profile">
      <SettingsClient user={user} />
    </SettingsLayout>
  )
}
