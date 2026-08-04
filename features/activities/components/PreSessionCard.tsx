"use client"

import Link from "next/link"
import { ChevronLeft, Square, Clock } from "lucide-react"
import type { Activity, ActivityIcon } from "../types"
import type { ReactNode } from "react"
import type { BreathingModeOption } from "../data/breathingModes"

export interface DurationOption {
  cycles: number
  label: string
  recommend?: boolean
  /** Actual length when cycles are derived from minutes (e.g. belly) */
  detail?: string
}

interface PreSessionCardProps {
  activity: Activity
  /** Override heading when a mode is selected inside Breathing */
  title?: string
  description?: string
  cycles: number
  sound: boolean
  haptics: boolean
  durationOptions: readonly DurationOption[]
  howItWorks: readonly string[]
  onCyclesChange: (cycles: number) => void
  onSoundChange: (v: boolean) => void
  onHapticsChange: (v: boolean) => void
  onBegin: () => void
  backHref?: string
  safetyNotice?: ReactNode
  footerNote?: string
  modeOptions?: readonly BreathingModeOption[]
  mode?: string
  onModeChange?: (modeId: string) => void
  beginDisabled?: boolean
  beginLabel?: string
  teachingStep?: ReactNode
}

function ActivityIconTile({ icon }: { icon: ActivityIcon }) {
  const Icon = icon === "clock" ? Clock : Square
  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  )
}

export function PreSessionCard({
  activity,
  title,
  description,
  cycles,
  sound,
  haptics,
  durationOptions,
  howItWorks,
  onCyclesChange,
  onSoundChange,
  onHapticsChange,
  onBegin,
  backHref = "/patient/library",
  safetyNotice,
  footerNote = "You can stop whenever you like.",
  modeOptions,
  mode,
  onModeChange,
  beginDisabled = false,
  beginLabel = "Begin",
  teachingStep = null,
}: PreSessionCardProps) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 py-6">
      <Link
        href={backHref}
        className="mb-6 inline-flex min-h-11 min-w-11 items-center gap-1 self-start rounded-full text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label="Back to Explore"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
        <span className="text-sm">Explore</span>
      </Link>

      <div className="mb-6 flex items-start gap-4">
        <ActivityIconTile icon={activity.icon} />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {title ?? activity.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
            {description ?? activity.longDescription}
          </p>
        </div>
      </div>

      {modeOptions && modeOptions.length > 0 && onModeChange ? (
        <fieldset className="mb-6">
          <legend className="mb-3 text-sm font-semibold text-ink">Mode</legend>
          <div
            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:rounded-full sm:border sm:border-hairline sm:bg-surface sm:p-1"
            role="radiogroup"
            aria-label="Breathing mode"
          >
            {modeOptions.map((m) => {
              const selected = mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`min-h-11 flex-1 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                    selected
                      ? "bg-accent-soft text-ink"
                      : "border border-hairline text-ink-muted hover:text-ink sm:border-0"
                  }`}
                  onClick={() => onModeChange(m.id)}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mb-8 rounded-3xl border border-hairline bg-surface p-5 shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]">
        <h2 className="mb-3 text-sm font-semibold text-ink">How it works</h2>
        <ol className="space-y-2 text-[15px] leading-relaxed text-ink-muted">
          {howItWorks.map((step, i) => (
            <li key={step}>
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </div>

      {teachingStep}

      <fieldset className="mb-6">
        <legend className="mb-3 text-sm font-semibold text-ink">Duration</legend>
        <div
          className="flex flex-col gap-2 sm:flex-row sm:rounded-full sm:border sm:border-hairline sm:bg-surface sm:p-1"
          role="radiogroup"
          aria-label="Session duration"
        >
          {durationOptions.map((p) => {
            const selected = cycles === p.cycles
            return (
              <button
                key={p.cycles}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`relative min-h-11 flex-1 rounded-full px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                  selected
                    ? "bg-accent-soft text-ink"
                    : "border border-hairline text-ink-muted hover:text-ink sm:border-0"
                }`}
                onClick={() => onCyclesChange(p.cycles)}
              >
                {p.label}
                {p.recommend ? (
                  <span className="mt-1 block text-[11px] font-normal text-accent">
                    Recommended for your first time
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
        {durationOptions.find((p) => p.cycles === cycles)?.detail ? (
          <p className="mt-2 text-sm text-ink-subtle">
            {durationOptions.find((p) => p.cycles === cycles)?.detail}
          </p>
        ) : null}
      </fieldset>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-pressed={sound}
          aria-label={sound ? "Sound on" : "Sound off"}
          onClick={() => onSoundChange(!sound)}
        >
          Sound: {sound ? "On" : "Off"}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-pressed={haptics}
          aria-label={haptics ? "Haptics on" : "Haptics off"}
          onClick={() => onHapticsChange(!haptics)}
        >
          Haptics: {haptics ? "On" : "Off"}
        </button>
      </div>

      {safetyNotice}

      <div className="mt-auto flex flex-col items-center gap-3 pb-4 pt-6">
        <button
          type="button"
          onClick={onBegin}
          disabled={beginDisabled}
          className="inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-full bg-brand px-8 text-base font-semibold text-white shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-50"
        >
          {beginLabel}
        </button>
        <p className="text-center text-sm text-ink-subtle">{footerNote}</p>
      </div>
    </div>
  )
}
