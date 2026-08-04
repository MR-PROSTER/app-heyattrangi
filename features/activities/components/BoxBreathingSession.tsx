"use client"

import type { Activity } from "../types"
import { BOX_PATTERN } from "../types"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import { SessionShell } from "./SessionShell"
import { BreathingBox } from "./BreathingBox"

const BOX_HOW_IT_WORKS = [
  "Follow the square as a soft light traces each side.",
  "Inhale as it rises. Hold along the top.",
  "Exhale as it falls. Hold along the bottom.",
  "Each side lasts four seconds — one easy box at a time.",
] as const

const BOX_DURATIONS = [
  { cycles: 4, label: "1 min" },
  { cycles: 8, label: "2 min" },
  { cycles: 19, label: "5 min" },
] as const

interface BoxBreathingSessionProps {
  activity: Activity
  backHref?: string
}

export function BoxBreathingSession({
  activity,
  backHref = "/patient/library",
}: BoxBreathingSessionProps) {
  const reducedMotion = usePrefersReducedMotion()
  const pattern = activity.pattern ?? BOX_PATTERN

  return (
    <SessionShell
      activity={activity}
      pattern={pattern}
      durationOptions={BOX_DURATIONS}
      defaultCycles={8}
      howItWorks={BOX_HOW_IT_WORKS}
      backHref={backHref}
      audioProfile="box"
      visualizer={(engine) => (
        <BreathingBox
          phase={engine.phase}
          cycleProgressMv={engine.cycleProgressMv}
          phaseProgressMv={engine.phaseProgressMv}
          reducedMotion={reducedMotion}
          countdown={engine.phaseRemaining}
        />
      )}
    />
  )
}
