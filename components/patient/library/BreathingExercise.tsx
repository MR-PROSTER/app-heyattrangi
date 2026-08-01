"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"

const LEVELS = {
  beginner: {
    id: "beginner" as const,
    label: "Beginner",
    subtitle: "Box breathing",
    pattern: "4-4-4-2",
    desc: "Slow and forgiving — great for first-timers.",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 2,
    cycles: 5,
    color: "green" as const,
  },
  intermediate: {
    id: "intermediate" as const,
    label: "Intermediate",
    subtitle: "4-7-8 breathing",
    pattern: "4-7-8-0",
    desc: "Classic calm-down pattern with longer holds.",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 6,
    color: "orange" as const,
  },
  hard: {
    id: "hard" as const,
    label: "Hard",
    subtitle: "Extended holds",
    pattern: "4-8-6-4",
    desc: "Longer holds, steadier pace, more cycles.",
    inhale: 4,
    hold1: 8,
    exhale: 6,
    hold2: 4,
    cycles: 8,
    color: "purple" as const,
  },
}

type LevelId = keyof typeof LEVELS
type Phase = "inhale" | "hold1" | "exhale" | "hold2"
type Screen = "picker" | "session" | "complete"

const PHASE_ORDER: Phase[] = ["inhale", "hold1", "exhale", "hold2"]

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Breathe In",
  hold1: "Hold",
  exhale: "Breathe Out",
  hold2: "Hold",
}

const PHASE_SPEECH: Record<Phase, string> = {
  inhale: "Breathe in",
  hold1: "Hold",
  exhale: "Breathe out",
  hold2: "Hold",
}

const CIRCLE_SCALE: Record<Phase, number> = {
  inhale: 1.35,
  hold1: 1.35,
  exhale: 0.75,
  hold2: 0.75,
}

function getPhaseDuration(level: (typeof LEVELS)[LevelId], phase: Phase): number {
  if (phase === "inhale") return level.inhale
  if (phase === "hold1") return level.hold1
  if (phase === "exhale") return level.exhale
  return level.hold2
}

/** Advance phase; cycleComplete when we wrap back to inhale */
function advancePhase(
  level: (typeof LEVELS)[LevelId],
  phase: Phase
): { phase: Phase; cycleComplete: boolean } {
  const start = PHASE_ORDER.indexOf(phase)
  for (let i = 1; i <= PHASE_ORDER.length; i++) {
    const idx = start + i
    if (idx >= PHASE_ORDER.length) {
      return { phase: "inhale", cycleComplete: true }
    }
    const candidate = PHASE_ORDER[idx]
    if (getPhaseDuration(level, candidate) > 0) {
      return { phase: candidate, cycleComplete: false }
    }
  }
  return { phase: "inhale", cycleComplete: true }
}

export default function BreathingExercise() {
  const [screen, setScreen] = useState<Screen>("picker")
  const [levelId, setLevelId] = useState<LevelId | null>(null)
  const [phase, setPhase] = useState<Phase>("inhale")
  const [cycle, setCycle] = useState(1)
  const [isRunning, setIsRunning] = useState(false)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  const level = levelId ? LEVELS[levelId] : null
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressRafRef = useRef<number | null>(null)
  const phaseStartRef = useRef<number>(0)
  const phaseDurationMsRef = useRef<number>(0)
  const remainingMsRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const voiceMutedRef = useRef(false)
  const announcedPhaseRef = useRef<string>("")
  const phaseProgressRef = useRef(0)

  useEffect(() => {
    isRunningRef.current = isRunning
  }, [isRunning])

  useEffect(() => {
    voiceMutedRef.current = voiceMuted
  }, [voiceMuted])

  useEffect(() => {
    setSpeechSupported(typeof window.speechSynthesis !== "undefined")
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const clearTimers = useCallback(() => {
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current)
      phaseTimerRef.current = null
    }
    if (progressRafRef.current) {
      cancelAnimationFrame(progressRafRef.current)
      progressRafRef.current = null
    }
  }, [])

  const stopSpeech = useCallback(() => {
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } catch {
      /* ignore */
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (voiceMutedRef.current) return
    try {
      if (typeof window === "undefined" || !window.speechSynthesis) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    } catch {
      /* voice unavailable — visual still works */
    }
  }, [])

  const resetSession = useCallback(() => {
    clearTimers()
    stopSpeech()
    setIsRunning(false)
    setPhase("inhale")
    setCycle(1)
    setPhaseProgress(0)
    phaseProgressRef.current = 0
    remainingMsRef.current = null
    announcedPhaseRef.current = ""
  }, [clearTimers, stopSpeech])

  const goToPicker = useCallback(() => {
    resetSession()
    setLevelId(null)
    setScreen("picker")
  }, [resetSession])

  const selectLevel = (id: LevelId) => {
    resetSession()
    setLevelId(id)
    setScreen("session")
  }

  const toggleRunning = useCallback(() => {
    setIsRunning((running) => {
      if (running) {
        const elapsed = performance.now() - phaseStartRef.current
        remainingMsRef.current = Math.max(
          0,
          (phaseDurationMsRef.current || 0) - elapsed
        )
        stopSpeech()
        return false
      }
      return true
    })
  }, [stopSpeech])

  // Phase runner
  useEffect(() => {
    if (!isRunning || !level || screen !== "session") {
      clearTimers()
      return
    }

    const fullDurationMs = getPhaseDuration(level, phase) * 1000
    if (fullDurationMs <= 0) {
      const { phase: next, cycleComplete } = advancePhase(level, phase)
      if (cycleComplete) {
        if (cycle >= level.cycles) {
          setIsRunning(false)
          setScreen("complete")
          speak("Session complete")
          return
        }
        setCycle((c) => c + 1)
      }
      remainingMsRef.current = null
      setPhase(next)
      setPhaseProgress(0)
      phaseProgressRef.current = 0
      return
    }

    const announceKey = `${cycle}-${phase}`
    if (announcedPhaseRef.current !== announceKey) {
      announcedPhaseRef.current = announceKey
      speak(PHASE_SPEECH[phase])
      remainingMsRef.current = null
    }

    const durationMs =
      remainingMsRef.current != null ? remainingMsRef.current : fullDurationMs
    remainingMsRef.current = null
    const alreadyElapsed = fullDurationMs - durationMs

    phaseStartRef.current = performance.now() - alreadyElapsed
    phaseDurationMsRef.current = fullDurationMs

    const tick = () => {
      if (!isRunningRef.current) return
      const elapsed = performance.now() - phaseStartRef.current
      const pct = Math.min(100, (elapsed / fullDurationMs) * 100)
      phaseProgressRef.current = pct
      setPhaseProgress(pct)
      if (elapsed < fullDurationMs) {
        progressRafRef.current = requestAnimationFrame(tick)
      }
    }
    progressRafRef.current = requestAnimationFrame(tick)

    phaseTimerRef.current = setTimeout(() => {
      if (!isRunningRef.current) return
      const { phase: next, cycleComplete } = advancePhase(level, phase)
      if (cycleComplete) {
        if (cycle >= level.cycles) {
          setIsRunning(false)
          setPhaseProgress(100)
          phaseProgressRef.current = 100
          setScreen("complete")
          speak("Session complete")
          return
        }
        setCycle((c) => c + 1)
      }
      remainingMsRef.current = null
      setPhase(next)
      setPhaseProgress(0)
      phaseProgressRef.current = 0
    }, durationMs)

    return () => clearTimers()
  }, [isRunning, phase, cycle, level, screen, clearTimers, speak])

  // Keyboard: Space / Enter toggles start-pause on session screen
  useEffect(() => {
    if (screen !== "session") return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON") return
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        toggleRunning()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [screen, toggleRunning])

  useEffect(() => () => {
    clearTimers()
    stopSpeech()
  }, [clearTimers, stopSpeech])

  const sessionProgress =
    level && screen !== "picker"
      ? Math.min(100, ((cycle - 1) / level.cycles) * 100 + phaseProgress / level.cycles)
      : 0

  const ringRadius = 78
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - phaseProgress / 100)

  const displayScale =
    !level || (!isRunning && phaseProgress === 0 && cycle === 1 && phase === "inhale")
      ? 0.85
      : CIRCLE_SCALE[phase]
  const transitionSec =
    reducedMotion || !isRunning
      ? 0.35
      : (level ? getPhaseDuration(level, phase) : 0.35) || 0.35
  const isHold = phase === "hold1" || phase === "hold2"

  const liveMessage =
    screen === "complete"
      ? `Session complete — ${level?.cycles ?? 0} cycles`
      : screen === "session" && level
        ? isRunning
          ? `${PHASE_LABELS[phase]}. Cycle ${cycle} of ${level.cycles}.`
          : `Paused. Cycle ${cycle} of ${level.cycles}.`
        : "Choose a breathing level to begin."

  return (
    <div className="w-full animate-in fade-in duration-300 pb-16">
      <style>{`
        @keyframes breath-pulse {
          0%, 100% { opacity: 0.85; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .breath-circle-motion {
            transition: opacity 0.35s ease !important;
            transform: scale(1) !important;
          }
          .breath-pulse-active {
            animation: none !important;
            opacity: 0.95 !important;
          }
        }
        .breath-focus:focus-visible {
          outline: 2px solid #6366f1;
          outline-offset: 3px;
        }
      `}</style>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h3 className="font-extrabold text-[32px] text-slate-800 tracking-tight mb-2">
          Breathing Exercise
        </h3>
        <p className="text-slate-500 font-medium text-sm max-w-xl">
          Guided inhale, hold, and exhale with voice cues — pick a level that
          matches your pace.
        </p>
      </div>

      {/* —— Level picker —— */}
      {screen === "picker" && (
        <div className="space-y-8">
          <div className="relative w-full rounded-[28px] overflow-hidden bg-[#161434] shadow-xl text-white border border-[#2a2656] px-8 py-10 md:px-12">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-[-20%] left-[15%] w-[50%] h-[70%] bg-cyan-500/25 blur-[90px] rounded-full mix-blend-screen" />
              <div className="absolute top-[-10%] right-[10%] w-[40%] h-[50%] bg-blue-500/30 blur-[80px] rounded-full mix-blend-screen" />
              <div className="absolute bottom-[-30%] right-[30%] w-[35%] h-[50%] bg-teal-400/20 blur-[70px] rounded-full mix-blend-screen" />
            </div>
            <div className="relative z-10 max-w-lg">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/80 mb-3">
                Self &amp; Mind · Calm practice
              </p>
              <h4 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
                Find your rhythm
              </h4>
              <p className="text-white/70 text-sm leading-relaxed font-medium">
                Choose Beginner, Intermediate, or Hard. Each level has a fixed
                pattern, spoken phase cues, and a soft animated circle to follow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {(Object.values(LEVELS) as (typeof LEVELS)[LevelId][]).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => selectLevel(lvl.id)}
                className="breath-focus group bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all text-left flex flex-col items-center"
              >
                <div
                  className={`w-[88px] h-[88px] rounded-full relative flex items-center justify-center mb-5 transition-transform duration-300 group-hover:-translate-y-1 ${
                    lvl.color === "green"
                      ? "bg-green-50/60 text-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.18)]"
                      : lvl.color === "orange"
                        ? "bg-orange-50/60 text-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.18)]"
                        : "bg-purple-50/60 text-purple-500 shadow-[0_10px_30px_rgba(168,85,247,0.18)]"
                  }`}
                >
                  <div
                    className={`absolute inset-2 rounded-full border-2 opacity-20 ${
                      lvl.color === "green"
                        ? "border-green-400"
                        : lvl.color === "orange"
                          ? "border-orange-400"
                          : "border-purple-400"
                    }`}
                  />
                  <svg
                    className="w-9 h-9 opacity-90"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.4}
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M9.5 16.5c.5 1.5 1.5 2.5 2.5 3.5 1-1 2-2 2.5-3.5"
                    />
                  </svg>
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-0.5">{lvl.label}</h4>
                <p className="text-[11px] font-semibold text-slate-400 mb-2 tracking-wide">
                  {lvl.subtitle}
                </p>
                <span
                  className={`text-xs font-black tracking-widest mb-3 ${
                    lvl.color === "green"
                      ? "text-green-600"
                      : lvl.color === "orange"
                        ? "text-orange-500"
                        : "text-purple-600"
                  }`}
                >
                  {lvl.pattern}
                </span>
                <p className="text-slate-500 text-sm text-center leading-relaxed mb-4">
                  {lvl.desc}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 mt-auto">
                  {lvl.cycles} cycles ·{" "}
                  {lvl.inhale + lvl.hold1 + lvl.exhale + lvl.hold2}s each
                </p>
                <div
                  className={`h-[3px] w-14 rounded-full mt-4 ${
                    lvl.color === "green"
                      ? "bg-green-500"
                      : lvl.color === "orange"
                        ? "bg-orange-400"
                        : "bg-purple-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* —— Session —— */}
      {screen === "session" && level && (
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6 gap-3 flex-wrap">
            <button
              type="button"
              onClick={goToPicker}
              className="breath-focus text-[11px] font-black text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors"
            >
              ← Change level
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  level.color === "green"
                    ? "bg-green-50 text-green-600"
                    : level.color === "orange"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-purple-50 text-purple-600"
                }`}
              >
                {level.label} · {level.pattern}
              </span>
              {speechSupported && (
                <button
                  type="button"
                  onClick={() => {
                    setVoiceMuted((m) => {
                      if (!m) stopSpeech()
                      return !m
                    })
                  }}
                  className="breath-focus p-2.5 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                  aria-pressed={voiceMuted}
                  aria-label={voiceMuted ? "Unmute voice guidance" : "Mute voice guidance"}
                >
                  {voiceMuted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Session progress */}
          <div className="w-full mb-8">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>
                Cycle {cycle} of {level.cycles}
              </span>
              <span>{Math.round(sessionProgress)}%</span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(sessionProgress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Session progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-teal-400 transition-[width] duration-200 ease-out"
                style={{ width: `${sessionProgress}%` }}
              />
            </div>
          </div>

          {/* Animated circle + phase ring */}
          <div className="relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] flex items-center justify-center mb-10">
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 180 180"
              aria-hidden
            >
              <circle
                cx="90"
                cy="90"
                r={ringRadius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              <circle
                cx="90"
                cy="90"
                r={ringRadius}
                fill="none"
                stroke="url(#breathRingGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={isRunning ? ringOffset : ringCircumference}
                style={{
                  transition: reducedMotion
                    ? "none"
                    : "stroke-dashoffset 0.1s linear",
                  filter: "drop-shadow(0 0 6px rgba(56,189,248,0.45))",
                }}
              />
              <defs>
                <linearGradient id="breathRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#2dd4bf" />
                </linearGradient>
              </defs>
            </svg>

            <div
              className={`breath-circle-motion relative w-[140px] h-[140px] md:w-[160px] md:h-[160px] rounded-full flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(56,189,248,0.35)] ${
                isRunning && isHold && !reducedMotion ? "breath-pulse-active" : ""
              } ${reducedMotion && isRunning ? "opacity-100" : reducedMotion ? "opacity-70" : ""}`}
              style={{
                transform: reducedMotion ? undefined : `scale(${displayScale})`,
                transition: reducedMotion
                  ? "opacity 0.35s ease"
                  : `transform ${transitionSec}s ease-in-out, background ${transitionSec}s ease-in-out`,
                background:
                  phase === "exhale" || phase === "hold2"
                    ? "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)"
                    : "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                animation:
                  isRunning && isHold && !reducedMotion
                    ? "breath-pulse 2s ease-in-out infinite"
                    : undefined,
              }}
            >
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-center px-2">
                {!isRunning && phaseProgress === 0 && cycle === 1 && phase === "inhale"
                  ? "Ready"
                  : PHASE_LABELS[phase]}
              </span>
              {(isRunning || phaseProgress > 0) && (
                <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">
                  {isRunning
                    ? `${Math.max(
                        1,
                        Math.ceil(
                          (getPhaseDuration(level, phase) * (100 - phaseProgress)) / 100
                        )
                      )}s`
                    : "Paused"}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button
              type="button"
              onClick={toggleRunning}
              className="breath-focus inline-flex items-center gap-3 bg-[#161434] hover:bg-[#1f1b4a] text-white text-sm px-6 py-3 rounded-full font-semibold transition-all shadow-lg border border-[#2a2656]"
            >
              {isRunning ? "Pause" : "Start"}
              <span className="bg-white text-[#161434] rounded-full w-7 h-7 flex items-center justify-center">
                {isRunning ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                resetSession()
              }}
              className="breath-focus text-sm font-semibold text-slate-500 hover:text-slate-800 px-4 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-4 text-center">
            Press Space or Enter to start / pause
          </p>
        </div>
      )}

      {/* —— Complete —— */}
      {screen === "complete" && level && (
        <div className="max-w-md mx-auto text-center">
          <div className="relative w-full rounded-[28px] overflow-hidden bg-[#161434] shadow-xl text-white border border-[#2a2656] px-8 py-12 mb-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] bg-teal-500/30 blur-[90px] rounded-full mix-blend-screen" />
              <div className="absolute top-[-10%] right-[10%] w-[40%] h-[50%] bg-sky-500/25 blur-[80px] rounded-full mix-blend-screen" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-2xl font-extrabold tracking-tight mb-2">
                Session complete
              </h4>
              <p className="text-white/70 text-sm font-medium">
                {level.cycles} cycles · {level.label} ({level.pattern})
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                resetSession()
                setScreen("session")
              }}
              className="breath-focus inline-flex items-center gap-3 bg-[#161434] hover:bg-[#1f1b4a] text-white text-sm px-6 py-3 rounded-full font-semibold transition-all border border-[#2a2656]"
            >
              Repeat session
            </button>
            <button
              type="button"
              onClick={goToPicker}
              className="breath-focus text-sm font-semibold text-slate-600 hover:text-slate-900 px-6 py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              Pick a different level
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
