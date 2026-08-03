"use client"

import { useRouter } from "next/navigation"
import ArticleDetail from "@/components/patient/library/explore/read/ArticleDetail"
import type { ReadArticle } from "@/lib/read/types"
import { markRecentlyReadId } from "@/lib/read/recentlyRead"

interface ReadArticleClientProps {
  article: ReadArticle
}

/**
 * Client shell for /read/[slug] — reuses existing ArticleDetail UI unchanged.
 */
export default function ReadArticleClient({ article }: ReadArticleClientProps) {
  const router = useRouter()

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <ArticleDetail
        article={article}
        onBack={() => router.push("/patient/library?mode=read")}
        onRead={(a) => markRecentlyReadId(a.id)}
      />
    </div>
  )
}
