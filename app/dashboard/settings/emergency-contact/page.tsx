import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { getMembershipTier } from "@/components/profile/membership/membershipUtils"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import EmergencyContactForm from "@/components/settings/emergency/EmergencyContactForm"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  if (getMembershipTier(user.plan) !== "committed") {
    redirect("/dashboard/settings")
  }

  return (
    <EmergencyContactForm
      initial={{
        name: user.name || "",
        age: user.patient?.age?.toString() || "",
        gender: user.patient?.gender || "",
        healthConcerns: user.patient?.healthConcerns || [],
        contactName: user.patient?.emergencyContactName || "",
        contactPhone: user.patient?.emergencyContactPhone || "",
        relationship: user.patient?.emergencyRelationship || "",
      }}
    />
  )
}

export default function EmergencyContactPage() {
  return (
    <SettingsLayout title="Emergency Contact" backHref="/dashboard/settings">
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
