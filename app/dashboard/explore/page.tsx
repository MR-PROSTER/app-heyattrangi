import { redirect } from "next/navigation"
import { getExploreActivityBySlug } from "@/data/exploreActivities"
import ActivityDetailPage from "@/components/patient/library/explore/detail/ActivityDetailPage"
import ExploreErrorBoundary from "@/components/patient/library/explore/ExploreErrorBoundary"

interface ExploreDetailRouteProps {
  searchParams: Promise<{ item?: string }>
}

export default async function ExploreDetailRoute({
  searchParams,
}: ExploreDetailRouteProps) {
  const { item } = await searchParams

  if (!item?.trim()) {
    redirect("/patient/library")
  }

  const activity = getExploreActivityBySlug(item.trim())

  if (!activity) {
    redirect("/patient/library")
  }

  return (
    <ExploreErrorBoundary>
      <ActivityDetailPage activity={activity} />
    </ExploreErrorBoundary>
  )
}
