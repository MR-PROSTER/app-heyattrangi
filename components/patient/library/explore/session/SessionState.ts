export type SessionPhase = "idle" | "running" | "paused" | "finished"

export interface SessionState {
  phase: SessionPhase
  elapsedMs: number
  activityId: string
  activitySlug: string
  activityTitle: string
}

export function createInitialSessionState(activity: {
  id: string
  slug: string
  title: string
}): SessionState {
  return {
    phase: "idle",
    elapsedMs: 0,
    activityId: activity.id,
    activitySlug: activity.slug,
    activityTitle: activity.title,
  }
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
