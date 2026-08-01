import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getWellnessActivityBySlug } from "@/lib/wellness/wellnessActivityService"

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await context.params

    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    // Basic slug shape validation (lowercase kebab / alphanumeric)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug.trim())) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 })
    }

    const activity = await getWellnessActivityBySlug(slug)

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 })
    }

    return NextResponse.json({ activity })
  } catch (error) {
    console.error("GET /api/wellness-activities/[slug] error:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
