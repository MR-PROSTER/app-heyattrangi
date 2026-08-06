export type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2"

export type SessionStatus = "idle" | "running" | "paused" | "completed"

export interface BreathingEngineConfig {
  phaseDurationSec: number
  totalCycles: number
}

export interface BreathingSnapshot {
  status: SessionStatus
  phase: BreathPhase
  cycle: number
  totalCycles: number
  secondsRemaining: number
  phaseDurationSec: number
  activeElapsedMs: number
}

export type EngineEventType = "tick" | "phase" | "cycle" | "completed" | "status"

export interface EngineEvent {
  type: EngineEventType
}

export type AnimationIntensity = "calm" | "normal" | "lively"

export interface BreathingSettings {
  phaseDurationSec: 3 | 4 | 5 | 6
  totalCycles: number
  voiceEnabled: boolean
  voiceURI: string | null
  voiceRate: number
  voiceVolume: number
  ambientSoundEnabled: boolean
  ambientVolume: number
  animationIntensity: AnimationIntensity
  reducedMotion: boolean
  skipIntro: boolean
  hapticsEnabled: boolean
}

export const DEFAULT_SETTINGS: BreathingSettings = {
  phaseDurationSec: 4,
  totalCycles: 8,
  voiceEnabled: true,
  voiceURI: null,
  voiceRate: 0.95,
  voiceVolume: 1,
  ambientSoundEnabled: false,
  ambientVolume: 0.35,
  animationIntensity: "normal",
  reducedMotion: false,
  skipIntro: false,
  hapticsEnabled: true,
}

export const CYCLE_OPTIONS = [4, 6, 8, 10, 12] as const
export const DURATION_OPTIONS = [3, 4, 5, 6] as const
