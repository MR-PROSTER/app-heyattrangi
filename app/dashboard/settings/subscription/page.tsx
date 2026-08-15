import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsLayout from "@/components/settings/SettingsLayout"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import SubscriptionBillingDetails from "@/components/settings/subscription/SubscriptionBillingDetails"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  // Find the latest successful subscription transaction
  const latestTxn = await prisma.transaction.findFirst({
    where: {
      userId: user.id,
      type: "SUBSCRIPTION",
      status: "SUCCESS",
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  let nextPaymentDate: string | undefined
  if (latestTxn) {
    const date = new Date(latestTxn.createdAt)
    if (latestTxn.amount === 805) {
      date.setMonth(date.getMonth() + 6)
    } else if (latestTxn.amount === 1430) {
      date.setMonth(date.getMonth() + 12)
    } else {
      date.setMonth(date.getMonth() + 1)
    }
    nextPaymentDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return <SubscriptionBillingDetails user={user} nextPaymentDate={nextPaymentDate} latestTxn={latestTxn} />
}

export default function SubscriptionSettingsPage() {
  return (
    <SettingsLayout title="Subscription & billing" backHref="/dashboard/settings" maxWidthClass="max-w-[430px]">
      <Suspense fallback={<LoadingSkeleton rows={5} />}>
        <Content />
      </Suspense>
    </SettingsLayout>
  )
}
