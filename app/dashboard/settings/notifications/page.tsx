import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import NotificationsSettings from "@/components/settings/notifications/NotificationsSettings"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/")
  return <NotificationsSettings userId={user.id} />
}

export default function NotificationsSettingsPage() {
  // Force rebuild trigger to ensure Edit Profile title compilation
  return (
    <SettingsLayout title="Notifications" backHref="/dashboard/settings">
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
