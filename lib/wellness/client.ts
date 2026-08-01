import type { WellnessActivity } from "@/lib/wellness/presentation"

export class WellnessApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "WellnessApiError"
    this.status = status
  }
}

async function parseJson(res: Response) {
  try {
    return await res.json()
  } catch {
    throw new WellnessApiError("Invalid response from server", 500)
  }
}

export async function fetchWellnessActivities(): Promise<WellnessActivity[]> {
  const res = await fetch("/api/wellness-activities")
  const data = await parseJson(res)

  if (!res.ok) {
    throw new WellnessApiError(
      data?.error || "Failed to load wellness activities",
      res.status
    )
  }

  return Array.isArray(data.activities) ? data.activities : []
}

export async function fetchWellnessActivityBySlug(
  slug: string
): Promise<WellnessActivity> {
  const res = await fetch(`/api/wellness-activities/${encodeURIComponent(slug)}`)
  const data = await parseJson(res)

  if (res.status === 404) {
    throw new WellnessApiError("Activity not found", 404)
  }

  if (!res.ok) {
    throw new WellnessApiError(
      data?.error || "Failed to load wellness activity",
      res.status
    )
  }

  if (!data?.activity) {
    throw new WellnessApiError("Activity not found", 404)
  }

  return data.activity as WellnessActivity
}
