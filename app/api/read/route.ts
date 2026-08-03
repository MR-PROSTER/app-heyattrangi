import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { listReadArticles } from "@/lib/read/readContentService"
import { READ_CATEGORIES, type ReadArticleCategory } from "@/lib/read/types"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoryParam = searchParams.get("category")
    const phaseParam = searchParams.get("phase")

    let category: ReadArticleCategory | undefined
    if (categoryParam) {
      if (!(READ_CATEGORIES as readonly string[]).includes(categoryParam)) {
        return NextResponse.json(
          { error: `Invalid category. Expected one of: ${READ_CATEGORIES.join(", ")}.` },
          { status: 400 }
        )
      }
      category = categoryParam as ReadArticleCategory
    }

    let phase: number | undefined
    if (phaseParam) {
      const n = Number(phaseParam)
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: "Invalid phase." }, { status: 400 })
      }
      phase = n
    }

    const articles = listReadArticles({ category, phase })
    return NextResponse.json({ articles })
  } catch (error) {
    console.error("GET /api/read error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
