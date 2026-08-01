"use client"

import { useState } from "react"
import type { RelaxationConfig } from "@/data/activities/relaxationConfigs"
import ActivityStep from "@/components/patient/library/explore/engines/ActivityStep"
import ActivityAnimation from "@/components/patient/library/explore/engines/ActivityAnimation"

interface RelaxationEngineProps {
  config: RelaxationConfig
  isPaused: boolean
}

export default function RelaxationEngine({
  config,
  isPaused,
}: RelaxationEngineProps) {
  const [index, setIndex] = useState(0)
  const step = config.steps[index]
  const isLast = index >= config.steps.length - 1

  const goBack = () => {
    if (isPaused || index <= 0) return
    setIndex((i) => i - 1)
  }

  const goNext = () => {
    if (isPaused || isLast) return
    setIndex((i) => i + 1)
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <p className="text-center text-sm text-slate-500 font-medium leading-relaxed px-2">
        {config.intro}
      </p>

      <ActivityAnimation
        animationKey={step.id}
        variant="slide"
        isPaused={isPaused}
        className="w-full"
      >
        <ActivityStep
          current={index}
          total={config.steps.length}
          detail={step.instruction}
          onBack={goBack}
          onNext={goNext}
          backLabel="Back"
          nextLabel="Next"
          canGoBack={index > 0}
          canGoNext={!isLast}
          disabled={isPaused}
        >
          {!isLast && (
            <p
              className="text-slate-300 text-2xl font-light leading-none py-1"
              aria-hidden
            >
              ↓
            </p>
          )}
        </ActivityStep>
      </ActivityAnimation>

      {isPaused && (
        <p
          className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400"
          role="status"
        >
          Paused
        </p>
      )}
    </div>
  )
}
