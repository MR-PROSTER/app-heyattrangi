"use client"

import AssessmentEmptyState from "@/components/patient/library/explore/assessments/AssessmentEmptyState"
import AssessmentsCatalog from "@/components/patient/library/explore/assessments/AssessmentsCatalog"

interface AssessmentsModePanelProps {
  enabled?: boolean
  onNavigateLibraryTab: (tab: string) => void
}

/**
 * Assessments tab: clinical assessments catalog.
 */
export default function AssessmentsModePanel({
  enabled = true,
  onNavigateLibraryTab,
}: AssessmentsModePanelProps) {
  if (!enabled) {
    return <AssessmentEmptyState />
  }

  return (
    <div className="animate-in fade-in duration-200 w-full">
      <AssessmentsCatalog onNavigateLibraryTab={onNavigateLibraryTab} />
    </div>
  )
}
