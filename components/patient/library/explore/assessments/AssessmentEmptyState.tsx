"use client"

interface AssessmentEmptyStateProps {
  title?: string
  description?: string
}

export default function AssessmentEmptyState({
  title = "Assessments",
  description = "No assessments are available right now.",
}: AssessmentEmptyStateProps) {
  return (
    <div
      className="animate-in fade-in duration-200 rounded-[24px] border border-slate-100 bg-white/70 px-6 py-14 text-center"
      role="status"
    >
      <h3 className="font-bold text-[18px] text-slate-800 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  )
}
