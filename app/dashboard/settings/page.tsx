import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { getMembershipTier } from "@/components/profile/membership/membershipUtils"
import { settingsMenuForTier } from "@/lib/settings/types"
import SettingsLayout from "@/components/settings/SettingsLayout"
import SettingsMenu from "@/components/settings/SettingsMenu"

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  const isCommitted = getMembershipTier(user.plan) === "committed"
  const items = settingsMenuForTier(isCommitted)

  return (
    <SettingsLayout title="Settings" backHref="/dashboard/profile">
      <SettingsMenu items={items} />
    </SettingsLayout>
  )
}
