import type {
  BreathingEngineConfig,
  BreathingSnapshot,
  BreathPhase,
  EngineEvent,
  EngineEventType,
  SessionStatus,
} from "./types"

export const PHASE_SEQUENCE: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"]

export const PHASE_META: Record<
  BreathPhase,
  { instruction: string; voiceLabel: string; ariaLabel: string }
> = {
  inhale: {
    instruction: "Breathe In",
    voiceLabel: "Breathe in...",
    ariaLabel: "Inhale",
  },
  hold1: {
    instruction: "Hold",
    voiceLabel: "Hold...",
    ariaLabel: "Hold after inhale",
  },
  exhale: {
    instruction: "Exhale Slowly",
    voiceLabel: "Breathe out...",
    ariaLabel: "Exhale",
  },
  hold2: {
    instruction: "Hold",
    voiceLabel: "Hold...",
    ariaLabel: "Hold after exhale",
  },
}

function nextPhase(phase: BreathPhase): BreathPhase {
  const idx = PHASE_SEQUENCE.indexOf(phase)
  return PHASE_SEQUENCE[(idx + 1) % PHASE_SEQUENCE.length]
}

export type BreathingEngineListener = (snapshot: BreathingSnapshot, event: EngineEvent) => void

/**
 * Self-scheduling box-breathing state machine. Ticks once per second using an
 * absolute-timestamp schedule (not cumulative setTimeout adds), so it can't drift
 * even under tab throttling. Visual smoothing (the 60fps look) is left entirely to
 * CSS/Framer Motion transitions that key off phase changes with a duration equal
 * to phaseDurationSec — this class only owns the discrete truth of "what phase,
 * what cycle, how many seconds left."
 */
export class BoxBreathingEngine {
  private config: BreathingEngineConfig
  private status: SessionStatus = "idle"
  private phase: BreathPhase = "inhale"
  private cycle = 1
  private secondsRemaining: number
  private activeElapsedMs = 0
  private phaseEndAt = 0
  private lastResumeAt = 0
  private remainingMsWhenPaused = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private listeners = new Set<BreathingEngineListener>()

  constructor(config: BreathingEngineConfig) {
    this.config = config
    this.secondsRemaining = config.phaseDurationSec
  }

  subscribe(listener: BreathingEngineListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot(): BreathingSnapshot {
    return {
      status: this.status,
      phase: this.phase,
      cycle: this.cycle,
      totalCycles: this.config.totalCycles,
      secondsRemaining: this.secondsRemaining,
      phaseDurationSec: this.config.phaseDurationSec,
      activeElapsedMs: this.activeElapsedMs,
    }
  }

  start(): void {
    this.clearTimer()
    this.status = "running"
    this.phase = "inhale"
    this.cycle = 1
    this.activeElapsedMs = 0
    this.emit("status")
    this.beginPhase(this.config.phaseDurationSec * 1000)
  }

  pause(): void {
    if (this.status !== "running") return
    this.clearTimer()
    this.activeElapsedMs += performance.now() - this.lastResumeAt
    this.remainingMsWhenPaused = this.phaseEndAt - performance.now()
    this.status = "paused"
    this.emit("status")
  }

  resume(): void {
    if (this.status !== "paused") return
    this.status = "running"
    this.emit("status")
    this.lastResumeAt = performance.now()
    this.phaseEndAt = performance.now() + Math.max(0, this.remainingMsWhenPaused)
    this.scheduleNextSecond()
  }

  restart(): void {
    this.clearTimer()
    this.start()
  }

  /** Only takes effect for the next start()/restart() while a session is idle or already finished. */
  updateConfig(config: Partial<BreathingEngineConfig>): void {
    this.config = { ...this.config, ...config }
    if (this.status === "idle" || this.status === "completed") {
      this.secondsRemaining = this.config.phaseDurationSec
    }
  }

  destroy(): void {
    this.clearTimer()
    this.listeners.clear()
  }

  private beginPhase(durationMs: number): void {
    this.clearTimer()
    this.secondsRemaining = Math.ceil(durationMs / 1000)
    this.phaseEndAt = performance.now() + durationMs
    this.lastResumeAt = performance.now()
    this.emit("phase")
    this.scheduleNextSecond()
  }

  private scheduleNextSecond(): void {
    const msRemaining = this.phaseEndAt - performance.now()
    if (msRemaining <= 16) {
      this.completePhase()
      return
    }
    this.secondsRemaining = Math.max(1, Math.round(msRemaining / 1000))
    this.emit("tick")
    const msToNextWhole = msRemaining - (this.secondsRemaining - 1) * 1000
    this.timer = setTimeout(() => this.scheduleNextSecond(), Math.max(16, msToNextWhole))
  }

  private completePhase(): void {
    this.activeElapsedMs += performance.now() - this.lastResumeAt

    if (this.phase === "hold2") {
      if (this.cycle >= this.config.totalCycles) {
        this.status = "completed"
        this.emit("completed")
        this.emit("status")
        return
      }
      this.cycle += 1
      this.phase = nextPhase(this.phase)
      this.emit("cycle")
    } else {
      this.phase = nextPhase(this.phase)
    }

    this.beginPhase(this.config.phaseDurationSec * 1000)
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private emit(type: EngineEventType): void {
    const snapshot = this.getSnapshot()
    this.listeners.forEach((listener) => listener(snapshot, { type }))
  }
}
