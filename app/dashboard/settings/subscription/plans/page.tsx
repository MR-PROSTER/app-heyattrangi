import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import SubscriptionSettings from "@/components/settings/subscription/SubscriptionSettings"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")
  return <SubscriptionSettings user={user} isTestMode={false} />
}

export default async function SubscriptionPlansPage({ searchParams }: PageProps) {
  const params = await searchParams
  const from = typeof params.from === "string" ? params.from : "profile"
  
  // Decide back href based on entry point
  const backHref = from === "settings" ? "/dashboard/settings/subscription" : "/dashboard/profile"

  return (
    <SettingsLayout title="Subscription" backHref={backHref} maxWidthClass="max-w-6xl">
      <Suspense fallback={<LoadingSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
