"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { Activity, BreathingPattern } from "../types"
import { BOX_PATTERN } from "../types"
import { PATTERN_478 } from "../data/patterns"
import type { BreathingModeId, BreathingModeOption } from "../data/breathingModes"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"
import type { AudioCueProfile } from "../hooks/useSessionAudio"
import { SessionShell } from "./SessionShell"
import { BreathingBox } from "./BreathingBox"
import { BreathingRing } from "./BreathingRing"
import { FourSevenEightNotice } from "./FourSevenEightNotice"
import { BellyBreathingSession } from "./BellyBreathingSession"
import { PhysiologicalSighSession } from "./PhysiologicalSighSession"
import type { DurationOption } from "./PreSessionCard"
import type { BreathingEngineState } from "../hooks/usePacedTimeline"

const MODE_OPTIONS: readonly BreathingModeOption[] = [
  {
    id: "box",
    label: "Box",
    description:
      "A steady four-count rhythm. Inhale, hold, exhale, hold — one easy box at a time.",
    ready: true,
  },
  {
    id: "478",
    label: "4-7-8",
    description:
      "Inhale for 4, hold for 7, exhale for 8. The longer out-breath is the point.",
    ready: true,
  },
  {
    id: "belly",
    label: "Belly",
    description: "Simple diaphragmatic breaths — a gentle first practice.",
    ready: true,
  },
  {
    id: "sigh",
    label: "Sigh",
    description:
      "A quick double inhale and long exhale when you need a reset.",
    ready: true,
  },
] as const

interface ModeConfig {
  historySlug: string
  title: string
  pattern: BreathingPattern
  howItWorks: readonly string[]
  durationOptions: readonly DurationOption[]
  defaultCycles: number
  firstSessionCycles?: number
  audioProfile: AudioCueProfile
  showStopAnytime: boolean
  showSafety: boolean
}

const MODE_CONFIG: Record<Exclude<BreathingModeId, "belly" | "sigh">, ModeConfig> = {
  box: {
    historySlug: "box-breathing",
    title: "Box Breathing",
    pattern: BOX_PATTERN,
    howItWorks: [
      "Follow the square as a soft light traces each side.",
      "Inhale as it rises. Hold along the top.",
      "Exhale as it falls. Hold along the bottom.",
      "Each side lasts four seconds — one easy box at a time.",
    ],
    durationOptions: [
      { cycles: 4, label: "1 min" },
      { cycles: 8, label: "2 min" },
      { cycles: 19, label: "5 min" },
    ],
    defaultCycles: 8,
    audioProfile: "box",
    showStopAnytime: false,
    showSafety: false,
  },
  "478": {
    historySlug: "breathing-4-7-8",
    title: "4-7-8 Breathing",
    pattern: PATTERN_478,
    howItWorks: [
      "Inhale for 4, hold for 7, exhale for 8.",
      "Breathe in gently through your nose.",
      "Hold without strain — a soft pause is enough.",
      "Let the exhale leave slowly through your mouth. That longer out-breath is the point.",
    ],
    durationOptions: [
      { cycles: 4, label: "4 cycles (~1 min)" },
      { cycles: 9, label: "9 cycles (~3 min)" },
      { cycles: 16, label: "16 cycles (~5 min)" },
    ],
    defaultCycles: 9,
    firstSessionCycles: 4,
    audioProfile: "478",
    showStopAnytime: true,
    showSafety: true,
  },
}

function parseMode(raw: string | null): BreathingModeId {
  if (raw === "478" || raw === "belly" || raw === "sigh" || raw === "box") {
    return raw
  }
  if (raw === "4-7-8" || raw === "breathing-4-7-8") return "478"
  if (raw === "box-breathing") return "box"
  if (raw === "belly-breathing") return "belly"
  if (raw === "physiological-sigh") return "sigh"
  return "box"
}

interface BreathingSessionProps {
  activity: Activity
  backHref?: string
  initialMode?: BreathingModeId
}

export function BreathingSession({
  activity,
  backHref = "/patient/library",
  initialMode,
}: BreathingSessionProps) {
  const searchParams = useSearchParams()
  const fromQuery = parseMode(searchParams.get("mode"))
  const [mode, setMode] = useState<BreathingModeId>(initialMode ?? fromQuery)
  const reducedMotion = usePrefersReducedMotion()
  const option = MODE_OPTIONS.find((m) => m.id === mode) ?? MODE_OPTIONS[0]

  if (mode === "belly") {
    return (
      <BellyBreathingSession
        activity={activity}
        backHref={backHref}
        modeOptions={MODE_OPTIONS}
        mode={mode}
        onModeChange={(id) => setMode(parseMode(id))}
      />
    )
  }

  if (mode === "sigh") {
    return (
      <PhysiologicalSighSession activity={activity} backHref={backHref} />
    )
  }

  const config = MODE_CONFIG[mode]

  const visualizer = (engine: BreathingEngineState) =>
    mode === "478" ? (
      <BreathingRing engine={engine} />
    ) : (
      <BreathingBox
        phase={engine.phase}
        cycleProgressMv={engine.cycleProgressMv}
        phaseProgressMv={engine.phaseProgressMv}
        reducedMotion={reducedMotion}
        countdown={engine.phaseRemaining}
      />
    )

  return (
    <SessionShell
      key={mode}
      activity={activity}
      title={config.title}
      description={option.description}
      pattern={config.pattern}
      durationOptions={config.durationOptions}
      defaultCycles={config.defaultCycles}
      firstSessionCycles={config.firstSessionCycles}
      howItWorks={config.howItWorks}
      backHref={backHref}
      audioProfile={config.audioProfile}
      showStopAnytime={config.showStopAnytime}
      sessionSlug={config.historySlug}
      safetyNotice={config.showSafety ? <FourSevenEightNotice /> : null}
      modeOptions={MODE_OPTIONS}
      mode={mode}
      onModeChange={(id) => setMode(parseMode(id))}
      beginDisabled={!option.ready}
      beginLabel={option.ready ? "Begin" : "Coming soon"}
      footerNote={
        option.ready
          ? "You can stop whenever you like."
          : "This mode is almost ready. Try Box, 4-7-8, or Belly for now."
      }
      visualizer={visualizer}
    />
  )
}
