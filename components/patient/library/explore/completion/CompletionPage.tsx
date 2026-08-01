"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { ExploreActivity } from "@/data/exploreActivities"
import {
  getCompletionPrimaryMessage,
  getCompletionSecondaryMessage,
  resolveCompletionKind,
} from "@/data/activities/completionMessages"
import CompletionHero from "@/components/patient/library/explore/completion/CompletionHero"
import CompletionMessage from "@/components/patient/library/explore/completion/CompletionMessage"
import CompletionSummary from "@/components/patient/library/explore/completion/CompletionSummary"
import CompletionActions from "@/components/patient/library/explore/completion/CompletionActions"

interface CompletionPageProps {
  activity: ExploreActivity
  elapsedMs: number
  completedAt?: Date
  onDone: () => void
  onTryAnother: () => void
}

export default function CompletionPage({
  activity,
  elapsedMs,
  completedAt,
  onDone,
  onTryAnother,
}: CompletionPageProps) {
  const kind = resolveCompletionKind(activity.category)
  const primary = getCompletionPrimaryMessage(kind)
  const [secondary] = useState(() => getCompletionSecondaryMessage(kind))
  const finishedAt = completedAt ?? new Date()

  return (
    <motion.div
      role="region"
      aria-label="Activity complete"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 h-full min-h-0 w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans"
    >
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 md:p-8 w-full max-w-md mx-auto flex flex-col items-center gap-8 pb-12">
          <CompletionHero activity={activity} elapsedMs={elapsedMs} />
          <CompletionMessage primary={primary} secondary={secondary} />
          <CompletionSummary
            activity={activity}
            elapsedMs={elapsedMs}
            completedAt={finishedAt}
          />
          <CompletionActions onDone={onDone} onTryAnother={onTryAnother} />
        </div>
      </div>
    </motion.div>
  )
}
