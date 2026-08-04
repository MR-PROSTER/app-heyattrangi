"use client"

/**
 * Stable public entry for paced breathing sessions.
 * Implementation lives in session/PacedSession — call sites keep importing here.
 */
export {
  PacedSession as SessionShell,
  PacedSession,
  type SessionShellProps,
  type PacedSessionProps,
} from "./session/PacedSession"
