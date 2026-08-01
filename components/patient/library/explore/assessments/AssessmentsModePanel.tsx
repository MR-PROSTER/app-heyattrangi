"use client"

import { useRouter } from "next/navigation"
import {
  MIND_MATRIX_ASSESSMENT_STATE,
  MIND_MATRIX_HREF,
  resolveAssessmentUiStatus,
} from "@/data/assessmentState"
import AssessmentCard from "@/components/patient/library/explore/assessments/AssessmentCard"
import AssessmentEmptyState from "@/components/patient/library/explore/assessments/AssessmentEmptyState"
import AssessmentsCatalog from "@/components/patient/library/explore/assessments/AssessmentsCatalog"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"

interface AssessmentsModePanelProps {
  enabled?: boolean
  onNavigateLibraryTab: (tab: string) => void
}

/**
 * Assessments tab: previous catalog/hero + Mind Matrix card.
 */
export default function AssessmentsModePanel({
  enabled = true,
  onNavigateLibraryTab,
}: AssessmentsModePanelProps) {
  const router = useRouter()

  if (!enabled) {
    return <AssessmentEmptyState />
  }

  const state = MIND_MATRIX_ASSESSMENT_STATE
  const status = resolveAssessmentUiStatus(state)

  const startMindMatrix = () => {
    router.push(MIND_MATRIX_HREF)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 w-full">
      <AssessmentsCatalog onNavigateLibraryTab={onNavigateLibraryTab} />

      <section aria-label="Mind Matrix" className="max-w-2xl">
        <ExploreSectionHeader title="Mind Matrix" />
        <AssessmentCard
          state={state}
          status={status}
          onStart={startMindMatrix}
        />
      </section>
    </div>
  )
}
