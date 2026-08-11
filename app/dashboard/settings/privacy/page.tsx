import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import PrivacySettings from "@/components/settings/privacy/PrivacySettings"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/")

  return (
    <PrivacySettings
      hasPatient={Boolean(user.patient)}
      patientCreatedAt={user.patient?.createdAt ?? null}
      userCreatedAt={user.createdAt}
    />
  )
}

export default function PrivacySettingsPage() {
  return (
    <SettingsLayout title="Privacy & Consent" backHref="/dashboard/settings">
      <Suspense fallback={<LoadingSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
