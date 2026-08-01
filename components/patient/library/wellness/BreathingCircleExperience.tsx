"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { BreathPhase, BreathPattern, ExperiencePlayerProps } from "@/lib/data/wellnessExperienceConfig"
import ExperienceShell from "./ExperienceShell"
import ExperienceCompletion from "./ExperienceCompletion"
import ExperienceControls from "./ExperienceControls"

const PHASE_ORDER: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"]
const SCALE: Record<BreathPhase, number> = {
  inhale: 1.35,
  hold1: 1.35,
  exhale: 0.78,
  hold2: 0.78,
}

function durationOf(pattern: BreathPattern, phase: BreathPhase) {
  if (phase === "inhale") return pattern.inhale
  if (phase === "hold1") return pattern.hold1
  if (phase === "exhale") return pattern.exhale
  return pattern.hold2
}

function advance(pattern: BreathPattern, phase: BreathPhase) {
  const start = PHASE_ORDER.indexOf(phase)
  for (let i = 1; i <= PHASE_ORDER.length; i++) {
    const idx = start + i
    if (idx >= PHASE_ORDER.length) return { phase: "inhale" as BreathPhase, cycleComplete: true }
    const next = PHASE_ORDER[idx]
    if (durationOf(pattern, next) > 0) return { phase: next, cycleComplete: false }
  }
  return { phase: "inhale" as BreathPhase, cycleComplete: true }
}

interface BreathingCircleExperienceProps extends ExperiencePlayerProps {
  pattern: BreathPattern
  variant?: "circle" | "belly" | "sigh"
}

export default function BreathingCircleExperience({
  activityId,
  title,
  estimatedDuration,
  color,
  pattern,
  variant = "circle",
  onExit,
  onDone,
}: BreathingCircleExperienceProps) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<BreathPhase>("inhale")
  const [cycle, setCycle] = useState(1)
  const [completed, setCompleted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningRef = useRef(false)

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const fn = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [])

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const restart = () => {
    clearTimer()
    setRunning(false)
    setPhase("inhale")
    setCycle(1)
    setCompleted(false)
  }

  const skipCycle = () => {
    clearTimer()
    if (cycle >= pattern.cycles) {
      setRunning(false)
      setCompleted(true)
      return
    }
    setCycle((c) => c + 1)
    setPhase("inhale")
  }

  useEffect(() => {
    if (!running || completed) {
      clearTimer()
      return
    }
    const sec = durationOf(pattern, phase)
    if (sec <= 0) {
      const { phase: next, cycleComplete } = advance(pattern, phase)
      if (cycleComplete) {
        if (cycle >= pattern.cycles) {
          setRunning(false)
          setCompleted(true)
          return
        }
        setCycle((c) => c + 1)
      }
      setPhase(next)
      return
    }
    timerRef.current = setTimeout(() => {
      if (!runningRef.current) return
      const { phase: next, cycleComplete } = advance(pattern, phase)
      if (cycleComplete) {
        if (cycle >= pattern.cycles) {
          setRunning(false)
          setCompleted(true)
          return
        }
        setCycle((c) => c + 1)
      }
      setPhase(next)
    }, sec * 1000)
    return () => clearTimer()
  }, [running, phase, cycle, pattern, completed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit()
      if (completed) return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        setRunning((r) => !r)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onExit, completed])

  const label = pattern.labels[phase] ?? "Breathe"
  const isHold = phase === "hold1" || phase === "hold2"
  const transitionSec = reducedMotion || !running ? 0.35 : durationOf(pattern, phase) || 0.35
  const progress = completed ? 100 : ((cycle - 1) / pattern.cycles) * 100 + (1 / pattern.cycles) * 25

  const Visual = useCallback(() => {
    if (variant === "belly") {
      return (
        <div className="relative w-56 h-56 flex items-center justify-center">
          <div
            className="absolute w-40 h-28 rounded-[50%] bg-white/20 border border-white/30"
            style={{
              transform: reducedMotion ? undefined : `scale(${running ? SCALE[phase] : 0.9})`,
              transition: `transform ${transitionSec}s ease-in-out`,
            }}
          />
          <div
            className="relative z-10 w-28 h-36 rounded-[42%] bg-gradient-to-b from-white/35 to-white/10 border border-white/25 shadow-xl"
            style={{
              transform: reducedMotion ? undefined : `scaleY(${running ? (phase === "inhale" || phase === "hold1" ? 1.15 : 0.92) : 1})`,
              transition: `transform ${transitionSec}s ease-in-out`,
            }}
          />
        </div>
      )
    }
    if (variant === "sigh") {
      return (
        <div className="relative w-56 h-48 flex items-end justify-center gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="w-20 rounded-t-full bg-gradient-to-t from-white/15 to-white/40 border border-white/25"
              style={{
                height: running
                  ? phase === "inhale"
                    ? i === 0
                      ? 110
                      : 70
                    : phase === "hold1"
                      ? 130
                      : 55
                  : 80,
                transition: `height ${transitionSec}s ease-in-out`,
              }}
            />
          ))}
        </div>
      )
    }
    return (
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div
          className={`absolute inset-6 rounded-full border-2 border-white/20 ${
            running && isHold && !reducedMotion ? "animate-pulse" : ""
          }`}
        />
        <div
          className="w-36 h-36 rounded-full bg-gradient-to-br from-white/40 to-white/10 border border-white/30 shadow-[0_0_50px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-white"
          style={{
            transform: reducedMotion ? undefined : `scale(${running ? SCALE[phase] : 0.88})`,
            transition: reducedMotion
              ? "opacity 0.35s ease"
              : `transform ${transitionSec}s ease-in-out`,
          }}
        >
          <span className="text-lg font-extrabold tracking-tight">{running ? label : "Ready"}</span>
          {running && (
            <span className="text-[10px] uppercase tracking-widest opacity-70 mt-1">
              {durationOf(pattern, phase)}s
            </span>
          )}
        </div>
      </div>
    )
  }, [variant, running, phase, reducedMotion, transitionSec, isHold, label, pattern])

  if (completed) {
    return (
      <ExperienceShell title={title} color={color} progress={100} progressLabel="Done" onExit={onExit}>
        <ExperienceCompletion
          title={title}
          estimatedDuration={estimatedDuration}
          seed={activityId}
          onRestart={restart}
          onDone={onDone}
        />
      </ExperienceShell>
    )
  }

  return (
    <ExperienceShell
      title={title}
      color={color}
      progress={progress}
      progressLabel={`${cycle}/${pattern.cycles}`}
      onExit={onExit}
      footer={
        <ExperienceControls
          showPrevious={false}
          showNext
          nextLabel={running ? "Pause" : "Start"}
          onNext={() => setRunning((r) => !r)}
          showRestart
          onRestart={restart}
        />
      }
    >
      <div className="flex flex-col items-center text-center py-4 text-white">
        <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-6" aria-live="polite">
          {running ? label : "Press start when ready"}
        </p>
        <Visual />
        <p className="mt-8 text-white/70 text-sm font-medium">
          Cycle {cycle} of {pattern.cycles}
        </p>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={skipCycle}
            className="px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-white/80 bg-white/10 border border-white/20 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={restart}
            className="px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-white/80 bg-white/10 border border-white/20 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Restart
          </button>
        </div>
        <p className="text-white/40 text-[10px] mt-4">Space / Enter to start · Esc to exit</p>
      </div>
    </ExperienceShell>
  )
}
