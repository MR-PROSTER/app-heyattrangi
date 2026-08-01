import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { listAvailableWellnessActivities } from "@/lib/wellness/wellnessActivityService"
import type { WellnessCategoryId } from "@/lib/wellness/presentation"

const VALID_CATEGORIES = new Set<WellnessCategoryId>([
  "breathing",
  "grounding",
  "relaxation",
  "journaling",
  "sleep",
])

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryParam = searchParams.get("category")

    let categoryId: WellnessCategoryId | undefined
    if (categoryParam) {
      const normalized = categoryParam.trim().toLowerCase() as WellnessCategoryId
      if (!VALID_CATEGORIES.has(normalized)) {
        return NextResponse.json(
          {
            error:
              "Invalid category. Expected one of: breathing, grounding, relaxation, journaling, sleep.",
          },
          { status: 400 }
        )
      }
      categoryId = normalized
    }

    const activities = await listAvailableWellnessActivities(categoryId)

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("GET /api/wellness-activities error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
