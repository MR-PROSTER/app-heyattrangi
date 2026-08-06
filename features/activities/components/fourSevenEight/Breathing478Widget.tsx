"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"

/**
 * Self-contained 4-7-8 breathing widget — single pulsing circle, restyled
 * with the site's own design tokens (cream canvas, teal accent, brand CTA).
 */

type PhaseName = "Inhale" | "Hold" | "Exhale"
type Status = "ready" | "running" | "paused" | "done"

interface Phase {
  name: PhaseName
  seconds: number
  scale: number
  freq: number
}

const PHASES: readonly Phase[] = [
  { name: "Inhale", seconds: 4, scale: 1.6, freq: 440 },
  { name: "Hold", seconds: 7, scale: 1.6, freq: 550 },
  { name: "Exhale", seconds: 8, scale: 1.0, freq: 330 },
]

interface GuideStep {
  title: string
  points: readonly string[]
}

// One-time prep, done once before the timer starts — kept separate from
// the repeating Inhale → Hold → Exhale cycle so the numbering below always
// matches what the timer actually cycles through.
const PREP_STEPS: readonly GuideStep[] = [
  {
    title: "Get Comfortable",
    points: [
      "Sit upright or lie down.",
      "Relax your shoulders and jaw.",
      "Place the tip of your tongue behind your upper front teeth (keep it there throughout the exercise).",
    ],
  },
  {
    title: "Exhale Completely",
    points: [
      "Breathe out gently through your mouth.",
      'Make a soft "whoosh" sound as you exhale.',
      "Empty your lungs completely.",
    ],
  },
]

// The repeating cycle — same order as the PHASES array driving the timer.
const CYCLE_STEPS: readonly GuideStep[] = [
  {
    title: "Inhale for 4 Seconds",
    points: ["Close your mouth.", "Slowly breathe in through your nose for 4 seconds."],
  },
  {
    title: "Hold for 7 Seconds",
    points: ["Hold your breath for 7 seconds.", "Stay relaxed. Don't tense your shoulders."],
  },
  {
    title: "Exhale for 8 Seconds",
    points: [
      "Slowly exhale through your mouth for 8 seconds.",
      'Make a gentle "whoosh" sound.',
      "Let all the air leave your lungs.",
    ],
  },
]

const CYCLE_SUMMARY: readonly { icon: string; label: string; duration: string }[] = [
  { icon: "🌬", label: "Inhale (Nose)", duration: "4 seconds" },
  { icon: "⏸", label: "Hold Breath", duration: "7 seconds" },
  { icon: "💨", label: "Exhale (Mouth)", duration: "8 seconds" },
]

interface Breathing478WidgetProps {
  defaultCycles?: number
  onBack?: () => void
}

export function Breathing478Widget({ defaultCycles = 4, onBack }: Breathing478WidgetProps) {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [cycleNum, setCycleNum] = useState(0)
  const [totalCycles, setTotalCycles] = useState(defaultCycles)
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds)
  const [status, setStatus] = useState<Status>("ready")

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const beep = useCallback((freq: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!AudioCtx) return
        audioCtxRef.current = new AudioCtx()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.06, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.start()
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // audio unavailable, ignore
    }
  }, [])

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const start = useCallback(() => {
    setStatus("running")
    setRunning(true)
    setPhaseIndex(0)
    setCycleNum(0)
    setSecondsLeft(PHASES[0].seconds)
    beep(PHASES[0].freq)
  }, [beep])

  const pause = useCallback(() => {
    setRunning(false)
    setStatus("paused")
  }, [])

  const resume = useCallback(() => {
    setRunning(true)
    setStatus("running")
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setRunning(false)
    setStatus("ready")
    setPhaseIndex(0)
    setCycleNum(0)
    setSecondsLeft(PHASES[0].seconds)
  }, [])

  useEffect(() => {
    if (!running) {
      clearTimer()
      return
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1

        setPhaseIndex((prevPhase) => {
          const nextPhase = prevPhase + 1
          if (nextPhase >= PHASES.length) {
            setCycleNum((prevCycle) => {
              const nextCycle = prevCycle + 1
              if (nextCycle >= totalCycles) {
                clearTimer()
                setRunning(false)
                setStatus("done")
              } else {
                beep(PHASES[0].freq)
              }
              return nextCycle
            })
            return 0
          } else {
            beep(PHASES[nextPhase].freq)
            return nextPhase
          }
        })

        return 0
      })
    }, 1000)

    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, totalCycles])

  useEffect(() => {
    if (status === "running" || status === "ready") {
      setSecondsLeft(PHASES[phaseIndex].seconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIndex])

  const phase = PHASES[phaseIndex]
  const isDone = status === "done"
  const isHolding = status === "running" && phase.name === "Hold"

  return (
    <div style={styles.page} role="timer" aria-live="polite">
      <style>{`
        @keyframes b478HoldPulse {
          0%, 100% { box-shadow: 0 0 40px color-mix(in srgb, var(--color-accent) 35%, transparent); }
          50% { box-shadow: 0 0 62px color-mix(in srgb, var(--color-accent) 60%, transparent); }
        }
        .b478-hold-pulse { animation: b478HoldPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .b478-hold-pulse { animation: none; }
        }
      `}</style>
      <div style={styles.widget}>
        {onBack && (
          <div style={styles.topRow}>
            <button type="button" onClick={onBack} style={styles.backLink}>
              ← BACK
            </button>
          </div>
        )}
        <h2 style={styles.title}>4-7-8 Breathing</h2>
        <p style={styles.subtitle}>Inhale 4 &middot; Hold 7 &middot; Exhale 8</p>

        <div style={styles.stage}>
          <div style={styles.ring} />
          <div
            className={isHolding ? "b478-hold-pulse" : undefined}
            style={{
              ...styles.circle,
              transform: `scale(${isDone ? 1.3 : phase.scale})`,
              transitionDuration: `${isDone ? 1 : phase.seconds}s`,
            }}
          />
          <div style={styles.overlay}>
            <div style={styles.phaseLabel}>
              {isDone ? "Complete" : status === "ready" ? "Ready" : phase.name}
            </div>
            <div style={styles.count}>
              {isDone ? "✓" : status === "ready" ? "" : secondsLeft}
            </div>
          </div>
        </div>

        <div style={styles.cycleLabel}>
          Cycle{" "}
          {Math.min(
            cycleNum + (status === "running" || status === "paused" ? 1 : 0),
            totalCycles
          )}{" "}
          of {totalCycles}
        </div>

        <div style={styles.controls}>
          {status === "ready" || status === "done" ? (
            <button type="button" style={styles.startBtn} onClick={start}>
              Start
            </button>
          ) : status === "running" ? (
            <button type="button" style={styles.startBtn} onClick={pause}>
              Pause
            </button>
          ) : (
            <button type="button" style={styles.startBtn} onClick={resume}>
              Resume
            </button>
          )}
          <button type="button" style={styles.resetBtn} onClick={reset}>
            Reset
          </button>
        </div>

        <div style={styles.settings}>
          <label style={styles.settingsLabel}>
            Cycles:{" "}
            <input
              type="number"
              min={1}
              max={12}
              value={totalCycles}
              onChange={(e) => {
                const v = Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1))
                setTotalCycles(v)
                if (status !== "running") reset()
              }}
              style={styles.numberInput}
            />
          </label>
        </div>

        {/* Guide removed per user request */}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    width: "100%",
    background: "var(--color-canvas)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  widget: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    padding: "32px 24px 40px",
    textAlign: "center",
    color: "var(--color-ink)",
    fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
  },
  title: { fontSize: "1.25rem", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.01em" },
  subtitle: { color: "var(--color-ink-subtle)", fontSize: "0.9rem", margin: "0 0 32px" },
  stage: {
    position: "relative",
    width: "clamp(200px, 62vw, 260px)",
    height: "clamp(200px, 62vw, 260px)",
    margin: "0 auto 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: "92%",
    height: "92%",
    borderRadius: "50%",
    border: "1px solid var(--color-hairline)",
  },
  circle: {
    position: "absolute",
    width: "46%",
    height: "46%",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-accent) 55%, white), var(--color-accent))",
    boxShadow: "0 0 40px color-mix(in srgb, var(--color-accent) 35%, transparent)",
    transitionProperty: "transform",
    transitionTimingFunction: "ease-in-out",
  },
  overlay: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  phaseLabel: {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#ffffff",
    textShadow: "0 1px 6px rgba(0,0,0,0.25)",
  },
  count: {
    fontSize: "2.4rem",
    fontWeight: 300,
    marginTop: 4,
    color: "#ffffff",
    textShadow: "0 1px 6px rgba(0,0,0,0.25)",
    minHeight: "2.8rem",
  },
  cycleLabel: { color: "var(--color-ink-subtle)", fontSize: "0.85rem", marginBottom: 24 },
  controls: { display: "flex", gap: 12, justifyContent: "center" },
  startBtn: {
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: "12px 28px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: "var(--color-brand)",
    color: "#ffffff",
  },
  resetBtn: {
    fontFamily: "inherit",
    fontSize: "0.95rem",
    fontWeight: 600,
    padding: "12px 28px",
    borderRadius: 999,
    border: "1px solid var(--color-hairline)",
    cursor: "pointer",
    background: "var(--color-surface)",
    color: "var(--color-ink-subtle)",
  },
  settings: { marginTop: 28, fontSize: "0.85rem", color: "var(--color-ink-subtle)" },
  settingsLabel: { display: "inline-flex", alignItems: "center", gap: 8 },
  numberInput: {
    width: 48,
    background: "var(--color-surface)",
    border: "1px solid var(--color-hairline)",
    color: "var(--color-ink)",
    borderRadius: 6,
    padding: "4px 6px",
    fontSize: "0.85rem",
    textAlign: "center",
  },
  guide: {
    marginTop: 40,
    textAlign: "left",
    background: "var(--color-surface)",
    border: "1px solid var(--color-hairline)",
    borderRadius: 24,
    padding: "24px 22px",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)",
  },
  guideTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--color-ink)",
    margin: "0 0 18px",
    textAlign: "center",
  },
  guideSubheading: {
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--color-ink-subtle)",
    margin: "0 0 10px",
  },
  prepList: {
    listStyle: "none",
    margin: "0 0 22px",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  prepMarker: {
    flexShrink: 0,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-ink-subtle)",
    fontSize: "1rem",
  },
  stepList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  stepItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--color-accent-soft)",
    color: "var(--color-accent)",
    fontSize: "0.8rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: { flex: 1 },
  stepTitle: {
    margin: "0 0 4px",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "var(--color-ink)",
  },
  stepPoints: {
    margin: 0,
    padding: "0 0 0 18px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  stepPoint: {
    fontSize: "0.85rem",
    lineHeight: 1.5,
    color: "var(--color-ink-subtle)",
  },
  summaryCard: {
    marginTop: 22,
    paddingTop: 18,
    borderTop: "1px solid var(--color-hairline)",
  },
  summaryTitle: {
    margin: "0 0 10px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--color-ink)",
    textAlign: "center",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 0",
  },
  summaryIcon: { fontSize: "1.1rem", width: 22, textAlign: "center" },
  summaryLabel: {
    flex: 1,
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--color-ink)",
  },
  summaryDuration: {
    fontSize: "0.8rem",
    color: "var(--color-ink-subtle)",
  },
  topRow: {
    display: "flex",
    width: "100%",
    marginBottom: "20px",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "var(--color-ink-subtle)",
    fontSize: "12px",
    fontWeight: 800,
    cursor: "pointer",
    padding: "0",
    letterSpacing: "0.05em",
    alignSelf: "flex-start",
  },
}
