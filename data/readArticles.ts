/**
 * Read articles facade — keeps existing import paths working.
 * Source of truth: data/read/articles.json via lib/read/readContentService.
 */

export type {
  ReadArticle,
  ReadArticleCategory,
  ReadCoverIllustration,
} from "@/lib/read/types"

export { READ_CATEGORIES, DEFAULT_COVER } from "@/lib/read/types"

export {
  listReadArticles,
  getReadArticleBySlug,
  getReadArticlesByIds,
  getReadArticlesByCategory,
  splitReadBody,
} from "@/lib/read/readContentService"

import { listReadArticles } from "@/lib/read/readContentService"

/** Ordered catalog for listing UIs (displayOrder asc). */
export const READ_ARTICLES = listReadArticles()

export function formatReadPublishedDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
