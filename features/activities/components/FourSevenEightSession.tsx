"use client"

import type { Activity } from "../types"
import { PATTERN_478 } from "../data/patterns"
import { SessionShell } from "./SessionShell"
import { BreathingRing } from "./BreathingRing"
import { FourSevenEightNotice } from "./FourSevenEightNotice"

const HOW_IT_WORKS = [
  "Inhale for 4, hold for 7, exhale for 8.",
  "Breathe in gently through your nose.",
  "Hold without strain — a soft pause is enough.",
  "Let the exhale leave slowly through your mouth. That longer out-breath is the point.",
] as const

const DURATIONS = [
  { cycles: 4, label: "4 cycles (~1 min)" },
  { cycles: 9, label: "9 cycles (~3 min)" },
  { cycles: 16, label: "16 cycles (~5 min)" },
] as const

interface FourSevenEightSessionProps {
  activity: Activity
  backHref?: string
}

export function FourSevenEightSession({
  activity,
  backHref = "/patient/library",
}: FourSevenEightSessionProps) {
  return (
    <SessionShell
      activity={activity}
      pattern={activity.pattern ?? PATTERN_478}
      durationOptions={DURATIONS}
      defaultCycles={9}
      firstSessionCycles={4}
      howItWorks={HOW_IT_WORKS}
      backHref={backHref}
      audioProfile="478"
      showStopAnytime
      safetyNotice={<FourSevenEightNotice />}
      visualizer={(engine) => <BreathingRing engine={engine} />}
    />
  )
}
