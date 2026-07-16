/**
 * Utility to build a secure meet link from the main app.
 *
 * Usage (in a Server Component or API route):
 *   import { buildMeetLink } from "@/lib/meet-link"
 *   const link = await buildMeetLink("Therapy-Room-1")
 *   // → "https://meet-heyattrangi.vercel.app/Therapy-Room-1/lobby?token=<jwt>"
 *
 * Usage (in a Client Component):
 *   Call the /api/auth/meet-token endpoint, then redirect.
 */

const MEET_APP_URL = process.env.NEXT_PUBLIC_APP_URL || ""

/**
 * Server-side helper: fetches a meet token from the internal API and
 * returns the full lobby URL for a given room.
 *
 * Only call this from server components / route handlers where fetch is
 * available with the current auth cookie.
 */
export async function buildMeetLink(
  roomName: string,
  baseUrl: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/meet-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName }),
  })

  if (!res.ok) {
    throw new Error(`Failed to generate meet token: ${res.statusText}`)
  }

  const { token } = await res.json()
  return `${MEET_APP_URL}/meet/${encodeURIComponent(roomName)}?token=${token}`
}

/**
 * Client-side helper: calls the meet-token API and navigates to the meet app.
 * Call this in an onClick handler on a Client Component.
 */
export async function joinMeeting(roomName: string): Promise<void> {
  const res = await fetch("/api/auth/meet-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName }),
  })

  if (!res.ok) {
    throw new Error("Failed to generate meet token. Are you signed in?")
  }

  const { token } = await res.json()
  const meetUrl = `${MEET_APP_URL}/meet/${encodeURIComponent(roomName)}?token=${token}`
  window.open(meetUrl, "_blank")
}
