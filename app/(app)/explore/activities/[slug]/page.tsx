import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getActivityBySlug } from "@/features/activities/data/activities"
import { BreathingSession } from "@/features/activities/components/BreathingSession"
import { BoxBreathingSession } from "@/features/activities/components/BoxBreathingSession"
import { FourSevenEightSession } from "@/features/activities/components/FourSevenEightSession"
import { PhysiologicalSighSession } from "@/features/activities/components/PhysiologicalSighSession"
import { GroundingSession } from "@/features/activities/components/GroundingSession"
import { MicroMovementSession } from "@/features/activities/components/MicroMovementSession"
import { BodyScanSession } from "@/features/activities/components/BodyScanSession"
import { ComingSoonActivity } from "@/features/activities/components/ComingSoonActivity"
import type { BreathingModeId } from "@/features/activities/data/breathingModes"

interface PageProps {
  params: Promise<{ slug: string }>
}

const LEGACY_MODE: Record<string, BreathingModeId> = {
  "box-breathing": "box",
  "breathing-4-7-8": "478",
  "belly-breathing": "belly",
}

export default async function ActivitySessionPage({ params }: PageProps) {
  const { slug } = await params

  if (slug === "physiological-sigh") {
    const activity = getActivityBySlug("physiological-sigh")
    if (!activity) notFound()
    return <PhysiologicalSighSession activity={activity} />
  }

  if (slug === "5-4-3-2-1-grounding") {
    const activity = getActivityBySlug("5-4-3-2-1-grounding")
    if (!activity) notFound()
    return <GroundingSession activity={activity} />
  }

  if (slug === "micro-movement") {
    const activity = getActivityBySlug("micro-movement")
    if (!activity) notFound()
    return <MicroMovementSession activity={activity} />
  }

  if (slug === "body-scan") {
    const activity = getActivityBySlug("body-scan")
    if (!activity) notFound()
    return <BodyScanSession activity={activity} />
  }

  const legacyMode = LEGACY_MODE[slug]
  if (legacyMode) {
    redirect(`/explore/activities/breathing?mode=${legacyMode}`)
  }

  const activity = getActivityBySlug(slug)
  if (!activity) notFound()

  if (activity.kind === "breathing") {
    return (
      <Suspense
        fallback={
          <div className="min-h-[100dvh] bg-canvas" aria-busy="true" />
        }
      >
        <BreathingSession activity={activity} />
      </Suspense>
    )
  }

  if (activity.kind === "box-breathing") {
    return <BoxBreathingSession activity={activity} />
  }

  if (activity.kind === "four-seven-eight") {
    return <FourSevenEightSession activity={activity} />
  }

  if (activity.kind === "grounding") {
    return <GroundingSession activity={activity} />
  }

  if (activity.kind === "micro-movement") {
    return <MicroMovementSession activity={activity} />
  }

  if (activity.kind === "body-scan") {
    return <BodyScanSession activity={activity} />
  }

  return <ComingSoonActivity activity={activity} />
}
