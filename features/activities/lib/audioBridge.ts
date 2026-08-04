"use client"

/** Shared AudioContext unlocked on Explore/quick-access tap before route. */
let sharedCtx: AudioContext | null = null
let unlocked = false

function getAC(): typeof AudioContext | null {
  if (typeof window === "undefined") return null
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext ||
    null
  )
}

/** Call from a user-gesture handler (card tap, Shift+B, FAB). */
export async function unlockSharedAudio(): Promise<boolean> {
  try {
    const AC = getAC()
    if (!AC) return false
    if (!sharedCtx) sharedCtx = new AC()
    if (sharedCtx.state === "suspended") {
      await sharedCtx.resume()
    }
    unlocked = sharedCtx.state === "running"
    return unlocked
  } catch {
    unlocked = false
    return false
  }
}

export function getSharedAudioContext(): AudioContext | null {
  return sharedCtx
}

export function isSharedAudioUnlocked(): boolean {
  return unlocked && !!sharedCtx && sharedCtx.state === "running"
}

export function adoptSharedAudioContext(ctx: AudioContext | null): void {
  if (ctx) {
    sharedCtx = ctx
    unlocked = ctx.state === "running"
  }
}
