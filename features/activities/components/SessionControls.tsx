"use client"

import type { ReactNode } from "react"
import { Pause, Play, RotateCcw, Square, Volume2, VolumeX, Vibrate } from "lucide-react"

interface SessionControlsProps {
  status: "idle" | "running" | "paused" | "complete"
  sound: boolean
  haptics: boolean
  onTogglePause: () => void
  onRestart: () => void
  onEnd: () => void
  onToggleSound: () => void
  onToggleHaptics: () => void
  dimmed?: boolean
  /** Never dimmed — always full opacity in tab order */
  stopAnytime?: ReactNode
}

const btn =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-hairline bg-surface text-ink shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-40"

export function SessionControls({
  status,
  sound,
  haptics,
  onTogglePause,
  onRestart,
  onEnd,
  onToggleSound,
  onToggleHaptics,
  dimmed = false,
  stopAnytime,
}: SessionControlsProps) {
  const paused = status === "paused"
  const running = status === "running"

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`flex flex-wrap items-center justify-center gap-3 transition-opacity duration-500 ${
          dimmed ? "opacity-40" : "opacity-100"
        }`}
      >
        <button
          type="button"
          className={btn}
          onClick={onTogglePause}
          disabled={!running && !paused}
          aria-label={paused ? "Resume session" : "Pause session"}
        >
          {paused ? (
            <Play className="h-5 w-5" aria-hidden />
          ) : (
            <Pause className="h-5 w-5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          className={btn}
          onClick={onRestart}
          aria-label="Restart session"
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
        </button>
        <button
          type="button"
          className={btn}
          onClick={onEnd}
          aria-label="End session"
        >
          <Square className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={btn}
          onClick={onToggleSound}
          aria-label={sound ? "Turn sound off" : "Turn sound on"}
          aria-pressed={sound}
        >
          {sound ? (
            <Volume2 className="h-5 w-5" aria-hidden />
          ) : (
            <VolumeX className="h-5 w-5" aria-hidden />
          )}
        </button>
        <button
          type="button"
          className={btn}
          onClick={onToggleHaptics}
          aria-label={haptics ? "Turn haptics off" : "Turn haptics on"}
          aria-pressed={haptics}
        >
          <Vibrate
            className={`h-5 w-5 ${haptics ? "" : "opacity-40"}`}
            aria-hidden
          />
        </button>
      </div>
      {stopAnytime}
    </div>
  )
}
