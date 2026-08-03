import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  getReadArticleBySlug,
  listReadArticles,
} from "@/lib/read/readContentService"
import ReadArticleClient from "./ReadArticleClient"

interface ReadArticlePageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return listReadArticles().map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: ReadArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getReadArticleBySlug(slug)
  if (!article) {
    return { title: "Article not found" }
  }
  return {
    title: article.title,
    description: article.shortDescription || undefined,
  }
}

export default async function ReadArticlePage({ params }: ReadArticlePageProps) {
  const { slug } = await params
  const article = getReadArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return <ReadArticleClient article={article} />
}
