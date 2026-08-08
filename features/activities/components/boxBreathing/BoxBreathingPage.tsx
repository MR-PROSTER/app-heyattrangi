"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { Activity } from "../../types"
import {
  boxDurationOptions,
  patternFromBoxSeconds,
} from "../../data/patterns"
import { SessionShell } from "../SessionShell"
import { BreathingBox } from "../BreathingBox"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"
import { useSessionStore } from "../../store/useSessionStore"
import { useBoxSpeechGuide } from "../../hooks/useBoxSpeechGuide"
import {
  useNatureAmbience,
  type NatureSoundId,
} from "../../hooks/useNatureAmbience"
import type { BreathingEngineState } from "../../hooks/usePacedTimeline"
import { formatDuration } from "../../lib/formatDuration"
import { BoxIntroCard } from "./BoxIntroCard"
import { BoxInstructionText } from "./BoxInstructionText"
import { BoxSessionStats } from "./BoxSessionStats"
import { BoxAmbientBackdrop } from "./BoxAmbientBackdrop"
import {
  BoxHelp,
  SpeechVoiceLoader,
} from "./BoxHelp"
import { BoxCycleNudgeSync } from "./BoxCycleNudgeSync"
import { SubtleConfetti } from "./SubtleConfetti"

const BREATH_SECONDS_OPTIONS = [3, 4, 5, 6] as const

const NATURE_OPTIONS: { id: NatureSoundId; label: string }[] = [
  { id: "off", label: "Off" },
  { id: "rain", label: "Rain" },
  { id: "forest", label: "Forest" },
  { id: "ocean", label: "Ocean" },
  { id: "wind", label: "Wind" },
]

const BOX_HOW_IT_WORKS = [
  "Inhale as the square expands — four equal counts.",
  "Hold gently along the top.",
  "Exhale as it softens — let the breath leave slowly.",
  "Hold again at the bottom, then repeat.",
] as const

interface BoxBreathingSessionProps {
  activity: Activity
  backHref?: string
}

function BoxVoiceSync({
  engine,
  voiceEnabled,
  voiceRate,
  voiceVolume,
  voiceURI,
  nature,
}: {
  engine: BreathingEngineState
  voiceEnabled: boolean
  voiceRate: number
  voiceVolume: number
  voiceURI: string | null
  nature: NatureSoundId
}) {
  const { speakBegin, syncPhase, reset } = useBoxSpeechGuide({
    enabled: voiceEnabled,
    rate: voiceRate,
    volume: voiceVolume,
    voiceURI,
  })

  const active =
    engine.status === "running" || engine.status === "paused"
  useNatureAmbience(nature, active && nature !== "off")

  const beganRef = useRef(false)
  const lastRemainingRef = useRef<number | null>(null)

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
      lastRemainingRef.current = null
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
    lastRemainingRef.current = engine.phaseRemaining
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

function BoxSettingsPanel({
  breathSeconds,
  onBreathSeconds,
  voice,
  onVoice,
  voiceRate,
  onVoiceRate,
  voiceVolume,
  onVoiceVolume,
  voices,
  voiceURI,
  onVoiceURI,
  nature,
  onNature,
}: {
  breathSeconds: number
  onBreathSeconds: (s: number) => void
  voice: boolean
  onVoice: (v: boolean) => void
  voiceRate: number
  onVoiceRate: (r: number) => void
  voiceVolume: number
  onVoiceVolume: (v: number) => void
  voices: SpeechSynthesisVoice[]
  voiceURI: string | null
  onVoiceURI: (uri: string | null) => void
  nature: NatureSoundId
  onNature: (n: NatureSoundId) => void
}) {
  return (
    <div className="mb-6 space-y-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">
          Breath duration
        </legend>
        <p id="box-breath-help" className="mb-2 text-sm text-ink-subtle">
          Each side of the box — inhale, hold, exhale, hold.
        </p>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-describedby="box-breath-help"
          aria-label="Breath duration in seconds"
        >
          {BREATH_SECONDS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={breathSeconds === s}
              className={`min-h-11 rounded-full border px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                breathSeconds === s
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-hairline bg-surface text-ink-muted"
              }`}
              onClick={() => onBreathSeconds(s)}
            >
              {s}s
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">
          Voice guidance
        </legend>
        <p id="box-voice-help" className="mb-2 text-sm text-ink-subtle">
          Speaks each phase and counts through the side.
        </p>
        <button
          type="button"
          className="mb-3 inline-flex min-h-11 items-center rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-pressed={voice}
          aria-describedby="box-voice-help"
          onClick={() => onVoice(!voice)}
        >
          Voice: {voice ? "On" : "Off"}
        </button>
        {voice ? (
          <div className="space-y-3">
            <label className="block text-sm text-ink-muted">
              Speed
              <input
                type="range"
                min={0.7}
                max={1.1}
                step={0.05}
                value={voiceRate}
                onChange={(e) => onVoiceRate(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
                aria-label="Voice speed"
              />
            </label>
            <label className="block text-sm text-ink-muted">
              Volume
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.05}
                value={voiceVolume}
                onChange={(e) => onVoiceVolume(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
                aria-label="Voice volume"
              />
            </label>
            {voices.length > 0 ? (
              <label className="block text-sm text-ink-muted">
                Voice
                <select
                  className="mt-1 w-full min-h-11 rounded-2xl border border-hairline bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  value={voiceURI ?? ""}
                  onChange={(e) =>
                    onVoiceURI(e.target.value ? e.target.value : null)
                  }
                  aria-label="Voice selection"
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">
          Nature sounds
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="radiogroup"
          aria-label="Background nature sound"
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
              onClick={() => onNature(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

export function BoxBreathingSession({
  activity,
  backHref = "/patient/library",
}: BoxBreathingSessionProps) {
  const reducedMotion = usePrefersReducedMotion()
  const prefs = useSessionStore((s) => s.prefs)
  const setPref = useSessionStore((s) => s.setPref)

  const [breathSeconds, setBreathSeconds] = useState(
    prefs.boxBreathSeconds ?? 4
  )
  const [voice, setVoice] = useState(prefs.boxVoiceGuide ?? false)
  const [voiceRate, setVoiceRate] = useState(prefs.boxVoiceRate ?? 0.92)
  const [voiceVolume, setVoiceVolume] = useState(prefs.boxVoiceVolume ?? 0.85)
  const [voiceURI, setVoiceURI] = useState<string | null>(
    prefs.boxVoiceURI ?? null
  )
  const [nature, setNature] = useState<NatureSoundId>(
    (prefs.natureSound as NatureSoundId) ?? "off"
  )
  const [plannedCycles, setPlannedCycles] = useState(8)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const pattern = useMemo(
    () => patternFromBoxSeconds(breathSeconds),
    [breathSeconds]
  )
  const durationOptions = useMemo(
    () => boxDurationOptions(breathSeconds),
    [breathSeconds]
  )

  const estimatedLabel =
    plannedCycles <= 0
      ? "Until you stop"
      : `About ${formatDuration(plannedCycles * pattern.cycleSeconds * 1000)}`

  const onVoices = useCallback((v: SpeechSynthesisVoice[]) => {
    setVoices(v)
  }, [])

  const howItWorks = useMemo(
    () =>
      BOX_HOW_IT_WORKS.map((line, i) =>
        i === 0
          ? `Inhale as the square expands — ${breathSeconds} equal counts per side.`
          : line
      ),
    [breathSeconds]
  )

  return (
    <div className="relative min-h-[100dvh] bg-canvas pb-[env(safe-area-inset-bottom)]">
      <BoxAmbientBackdrop />
      <SpeechVoiceLoader onVoices={onVoices} />
      <div className="relative z-10">
        <SessionShell
          activity={activity}
          pattern={pattern}
          durationOptions={durationOptions}
          defaultCycles={8}
          firstSessionCycles={4}
          howItWorks={howItWorks}
          backHref={backHref}
          audioProfile="box"
          sessionSlug="box-breathing"
          title="Box Breathing"
          description="We'll breathe together. Follow the square — a steady rhythm to calm your mind and body."
          beginLabel="Start Exercise"
          footerNote={`${estimatedLabel}. Space to pause · Escape to exit.`}
          countdownLabel="Tap to skip"
          hidePhaseLabel
          completeHeadline={() => "Great job."}
          completeEncouragement="You completed your breathing exercise."
          completeCelebration
          onCyclesSelected={setPlannedCycles}
          teachingStep={
            <>
              <BoxIntroCard />
              <BoxHelp breathSeconds={breathSeconds} />
            </>
          }
          settingsExtras={
            <BoxSettingsPanel
              breathSeconds={breathSeconds}
              onBreathSeconds={(s) => {
                setBreathSeconds(s)
                setPref("boxBreathSeconds", s)
              }}
              voice={voice}
              onVoice={(next) => {
                setVoice(next)
                setPref("boxVoiceGuide", next)
              }}
              voiceRate={voiceRate}
              onVoiceRate={(r) => {
                setVoiceRate(r)
                setPref("boxVoiceRate", r)
              }}
              voiceVolume={voiceVolume}
              onVoiceVolume={(v) => {
                setVoiceVolume(v)
                setPref("boxVoiceVolume", v)
              }}
              voices={voices}
              voiceURI={voiceURI}
              onVoiceURI={(uri) => {
                setVoiceURI(uri)
                setPref("boxVoiceURI", uri)
              }}
              nature={nature}
              onNature={(id) => {
                setNature(id)
                setPref("natureSound", id)
              }}
            />
          }
          visualizer={(engine) => (
            <BreathingBox
              phase={engine.phase}
              phaseKind={engine.phaseSpec.kind}
              phaseSeconds={engine.phaseSpec.seconds}
              cycleProgressMv={engine.cycleProgressMv}
              phaseProgressMv={engine.phaseProgressMv}
              reducedMotion={reducedMotion}
              countdown={engine.phaseRemaining}
              immersive
            />
          )}
          sessionCoach={(engine) => (
            <>
              <BoxInstructionText engine={engine} />
              <BoxSessionStats
                engine={engine}
                plannedCycles={plannedCycles}
              />
              <BoxCycleNudgeSync engine={engine} />
              <BoxVoiceSync
                engine={engine}
                voiceEnabled={voice}
                voiceRate={voiceRate}
                voiceVolume={voiceVolume}
                voiceURI={voiceURI}
                nature={nature}
              />
            </>
          )}
        />
      </div>
    </div>
  )
}
