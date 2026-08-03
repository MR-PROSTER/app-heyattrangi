import { NextResponse } from "next/server"
import { auth } from "@/auth.config"
import { getReadArticleBySlug } from "@/lib/read/readContentService"

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const article = getReadArticleBySlug(slug)
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    return NextResponse.json({ article })
  } catch (error) {
    console.error("GET /api/read/[slug] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
