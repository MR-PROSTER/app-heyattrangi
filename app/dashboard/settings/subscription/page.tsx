import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import SubscriptionSettings from "@/components/settings/subscription/SubscriptionSettings"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")
  return <SubscriptionSettings user={user} />
}

export default function SubscriptionSettingsPage() {
  return (
    <SettingsLayout title="Subscription" backHref="/dashboard/settings" maxWidthClass="max-w-6xl">
      <Suspense fallback={<LoadingSkeleton rows={1} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
