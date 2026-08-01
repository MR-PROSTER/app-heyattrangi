"use client"

import { signOut } from "next-auth/react"

export type ClientSignOutResult =
  | { ok: true }
  | { ok: false; error: string }

interface PerformClientSignOutOptions {
  /**
   * When true (default), fall back to /auth even if an error occurs.
   * Profile Sign Out sets this false so the UI can show a toast.
   */
  redirectOnError?: boolean
}

/**
 * Existing client logout / redirect flow used by Sign Out and post-delete success.
 */
export async function performClientSignOut(
  options: PerformClientSignOutOptions = {}
): Promise<ClientSignOutResult> {
  const { redirectOnError = true } = options

  try {
    await fetch("/api/auth/clear-session", { method: "POST" })

    document.cookie.split(";").forEach((c) => {
      const cookieName = c.split("=")[0].trim()
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname};`
    })

    await signOut({ callbackUrl: "/auth", redirect: false })
    await new Promise((resolve) => setTimeout(resolve, 100))
    window.location.href = "/auth"
    return { ok: true }
  } catch (error) {
    console.error("Sign out error:", error)
    if (redirectOnError) {
      window.location.href = "/auth"
      return { ok: true }
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Couldn't sign out. Please try again.",
    }
  }
}
