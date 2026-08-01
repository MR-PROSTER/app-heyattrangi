"use client"

import { useState } from "react"
import type { GroundingConfig } from "@/data/activities/groundingConfigs"
import ActivityStep from "@/components/patient/library/explore/engines/ActivityStep"
import ActivityAnimation from "@/components/patient/library/explore/engines/ActivityAnimation"

interface GroundingEngineProps {
  config: GroundingConfig
  isPaused: boolean
}

export default function GroundingEngine({
  config,
  isPaused,
}: GroundingEngineProps) {
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
    <ActivityAnimation
      animationKey={step.id}
      variant="fade"
      isPaused={isPaused}
      className="w-full"
    >
      <ActivityStep
        current={index}
        total={config.steps.length}
        headline={step.headline}
        detail={step.detail}
        onBack={goBack}
        onNext={goNext}
        backLabel="Back"
        nextLabel="Next"
        canGoBack={index > 0}
        canGoNext={!isLast}
        disabled={isPaused}
      />
      {isLast && (
        <p className="mt-4 text-center text-sm text-slate-500 font-medium">
          You&apos;ve reached the last step. Press Finish when you&apos;re ready.
        </p>
      )}
      {isPaused && (
        <p
          className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400"
          role="status"
        >
          Paused
        </p>
      )}
    </ActivityAnimation>
  )
}
