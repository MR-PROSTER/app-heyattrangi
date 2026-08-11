import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import LanguageSettings from "@/components/settings/language/LanguageSettings"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/")

  return (
    <LanguageSettings
      userId={user.id}
      currentLanguage={user.patient?.preferredLanguage || "English"}
    />
  )
}

export default function LanguageSettingsPage() {
  return (
    <SettingsLayout title="Language" backHref="/dashboard/settings">
      <Suspense fallback={<LoadingSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
