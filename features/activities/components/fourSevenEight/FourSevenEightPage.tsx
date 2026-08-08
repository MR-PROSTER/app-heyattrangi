"use client"

import { useEffect, useRef, useState } from "react"
import type { Activity } from "../../types"
import { PATTERN_478 } from "../../data/patterns"
import { SessionShell } from "../SessionShell"
import { BreathingRing } from "../BreathingRing"
import { FourSevenEightNotice } from "../FourSevenEightNotice"
import { FourSevenEightHelp } from "./FourSevenEightHelp"
import { VideoLearnSection } from "./VideoLearnSection"
import { SessionStatsBar } from "./SessionStatsBar"
import { useSessionStore } from "../../store/useSessionStore"
import { use478SpeechGuide } from "../../hooks/use478SpeechGuide"
import {
  useNatureAmbience,
  type NatureSoundId,
} from "../../hooks/useNatureAmbience"
import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import { formatDuration } from "../../lib/formatDuration"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"

const HOW_IT_WORKS = [
  "Inhale for 4, hold for 7, exhale for 8.",
  "Breathe in gently through your nose.",
  "Hold without strain — a soft pause is enough.",
  "Let the exhale leave slowly through your mouth. That longer out-breath is the point.",
] as const

const DURATIONS = [
  { cycles: 4, label: "4 cycles", detail: "~1 min" },
  { cycles: 6, label: "6 cycles", detail: "~2 min" },
  { cycles: 8, label: "8 cycles", detail: "~2.5 min" },
  { cycles: 10, label: "10 cycles", detail: "~3 min" },
  { cycles: 0, label: "Unlimited", detail: "Runs until you end the session" },
] as const

const NATURE_OPTIONS: { id: NatureSoundId; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "ocean", label: "Ocean" },
  { id: "wind", label: "Wind" },
]

interface FourSevenEightSessionProps {
  activity: Activity
  backHref?: string
}

function VoiceAndAmbienceSync({
  engine,
  voiceEnabled,
  nature,
}: {
  engine: BreathingEngineState
  voiceEnabled: boolean
  nature: NatureSoundId
}) {
  const { speakBegin, syncPhase, reset } = use478SpeechGuide({
    enabled: voiceEnabled,
  })
  const active =
    engine.status === "running" || engine.status === "paused"
  useNatureAmbience(nature, active && nature !== "off")

  const beganRef = useRef(false)

  useEffect(() => {
    if (engine.status !== "running") return
    if (!beganRef.current) {
      beganRef.current = true
      speakBegin()
    }
  }, [engine.status, speakBegin])

  useEffect(() => {
    if (engine.status === "idle") {
      beganRef.current = false
      reset()
    }
  }, [engine.status, reset])

  const phaseKey = `${engine.cycle}:${engine.phaseIndex}`

  useEffect(() => {
    if (engine.status !== "running") return
    syncPhase(
      engine.phaseSpec.kind,
      phaseKey,
      engine.phaseSpec.seconds,
      engine.phaseRemaining,
      true
    )
  }, [
    engine.status,
    engine.phaseSpec.kind,
    engine.phaseSpec.seconds,
    engine.phaseRemaining,
    phaseKey,
    syncPhase,
  ])

  return null
}

function AmbientBackdrop() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return null
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid="478-ambient"
    >
      <div
        className="absolute -left-1/4 top-0 h-[60vmax] w-[60vmax] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-breath), transparent 70%)",
          animation: "breath-478-drift 36s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[50vmax] w-[50vmax] rounded-full opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent), transparent 70%)",
          animation: "breath-478-drift 42s ease-in-out infinite reverse",
        }}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-accent/25"
          style={{
            left: `${12 + i * 14}%`,
            top: `${20 + (i % 3) * 22}%`,
            animation: `breath-478-float ${10 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes breath-478-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 3%) scale(1.05); }
        }
        @keyframes breath-478-float {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-18px); opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}

export function FourSevenEightSession({
  activity,
  backHref = "/patient/library",
}: FourSevenEightSessionProps) {
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)
  const [voice, setVoice] = useState(prefs.voiceGuide ?? false)
  const [nature, setNature] = useState<NatureSoundId>(
    (prefs.natureSound as NatureSoundId) ?? "off"
  )
  const [plannedCycles, setPlannedCycles] = useState(8)

  const estimatedLabel =
    plannedCycles <= 0
      ? "Until you stop"
      : `About ${formatDuration(plannedCycles * PATTERN_478.cycleSeconds * 1000)}`

  return (
    <div className="relative min-h-[100dvh] bg-canvas">
      <AmbientBackdrop />
      <div className="relative z-10">
        <SessionShell
          activity={activity}
          pattern={activity.pattern ?? PATTERN_478}
          durationOptions={DURATIONS}
          defaultCycles={8}
          firstSessionCycles={4}
          howItWorks={HOW_IT_WORKS}
          backHref={backHref}
          audioProfile="478"
          showStopAnytime
          sessionSlug="breathing-4-7-8"
          title="4-7-8 Breathing Exercise"
          description="Slow your breathing to calm your mind, reduce stress, and improve focus."
          footerNote={`${estimatedLabel}. You can pause or stop whenever you like.`}
          countdownLabel="Tap to skip"
          safetyNotice={<FourSevenEightNotice />}
          completeHeadline={(r) =>
            r.endedEarly
              ? "Good call. Stopping when your body says so is the whole skill."
              : "Great job!"
          }
          completeEncouragement="Take a moment to notice how your body feels."
          onCyclesSelected={setPlannedCycles}
          teachingStep={<FourSevenEightHelp />}
          preSessionAppendix={<VideoLearnSection />}
          settingsExtras={
            <div className="mb-6 space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">
                  Voice guidance
                </legend>
                <p id="voice-help" className="mb-2 text-sm text-ink-subtle">
                  A short spoken intro, then full guidance and a live count
                  through each phase.
                </p>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-pressed={voice}
                  aria-describedby="voice-help"
                  onClick={() => {
                    const next = !voice
                    setVoice(next)
                    setPref("voiceGuide", next)
                  }}
                >
                  Voice: {voice ? "On" : "Off"}
                </button>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-ink">
                  Nature sounds
                </legend>
                <p id="nature-help" className="mb-2 text-sm text-ink-subtle">
                  Soft background bed. Separate from phase cue tones.
                </p>
                <div
                  className="flex flex-wrap gap-2"
                  role="radiogroup"
                  aria-describedby="nature-help"
                  aria-label="Nature sound"
                >
                  {NATURE_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={nature === o.id}
                      className={`min-h-11 rounded-full border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        nature === o.id
                          ? "border-accent bg-accent-soft text-ink"
                          : "border-hairline bg-surface text-ink-muted"
                      }`}
                      onClick={() => {
                        setNature(o.id)
                        setPref("natureSound", o.id)
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          }
          visualizer={(engine) => <BreathingRing engine={engine} />}
          hidePhaseLabel
          sessionCoach={(engine) => (
            <>
              <SessionStatsBar
                engine={engine}
                plannedCycles={plannedCycles}
              />
              <VoiceAndAmbienceSync
                engine={engine}
                voiceEnabled={voice}
                nature={nature}
              />
            </>
          )}
        />
      </div>
    </div>
  )
}
