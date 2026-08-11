import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { inferAuthProvider } from "@/components/profile/membership/membershipUtils"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import PersonalDetailsForm from "@/components/settings/personal-details/PersonalDetailsForm"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/")

  const provider = inferAuthProvider({
    image: user.image,
    password: user.password,
    accounts: user.accounts,
  })
  const emailEditable = provider !== "Google"

  return (
    <PersonalDetailsForm
      initial={{
        userId: user.id,
        name: user.name,
        email: user.email,
        emailEditable,
      }}
    />
  )
}

export default function PersonalDetailsPage() {
  return (
    <SettingsLayout title="Personal Details" backHref="/dashboard/settings">
      <Suspense fallback={<LoadingSkeleton rows={3} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
