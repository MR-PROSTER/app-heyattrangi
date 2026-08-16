import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import AppearanceSettings from "@/components/settings/appearance/AppearanceSettings"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")
  return <AppearanceSettings />
}

export default function AppearancePage() {
  return (
    <div className="appearance-page">
      <SettingsLayout title="Appearance" backHref="/dashboard/settings" maxWidthClass="max-w-[430px]">
        <Suspense fallback={<LoadingSkeleton rows={2} />}>
          <Content />
        </Suspense>
      </SettingsLayout>
    </div>
  )
}
