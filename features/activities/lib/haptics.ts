/** Capability-guarded haptic tick. Silently no-ops where unsupported. */
export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

export function hapticTick(enabled: boolean, ms = 12): void {
  if (!enabled || !canVibrate()) return
  try {
    navigator.vibrate(ms)
  } catch {
    // Private mode / denied — ignore
  }
}

/** Double-tap pattern for exhale start (4-7-8). */
export function hapticExhale(enabled: boolean): void {
  if (!enabled || !canVibrate()) return
  try {
    navigator.vibrate([10, 60, 10])
  } catch {
    // ignore
  }
}

/** Advisory-ring chime haptic for Micro Movement. */
export function hapticChime(enabled: boolean): void {
  if (!enabled || !canVibrate()) return
  try {
    navigator.vibrate([10, 70, 10])
  } catch {
    // ignore
  }
}
