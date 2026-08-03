import articlesJson from "@/data/read/articles.json"
import {
  DEFAULT_COVER,
  READ_CATEGORIES,
  type ReadArticle,
  type ReadArticleCategory,
  type ReadArticleRecord,
  type ReadCoverIllustration,
} from "@/lib/read/types"

const FALLBACK_COVERS: ReadCoverIllustration[] = [
  "pause",
  "heart",
  "moon",
  "seed",
  "focus",
  "rest",
  "walk",
  "voice",
  "sunrise",
]

function isCategory(value: unknown): value is ReadArticleCategory {
  return (
    typeof value === "string" &&
    (READ_CATEGORIES as readonly string[]).includes(value)
  )
}

function isCover(value: unknown): value is ReadCoverIllustration {
  return (
    typeof value === "string" &&
    (FALLBACK_COVERS as readonly string[]).includes(value)
  )
}

function normalizeRecord(raw: ReadArticleRecord, index: number): ReadArticle | null {
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : ""
  const title = typeof raw.title === "string" ? raw.title.trim() : ""
  if (!slug || !title) return null

  const shortDescription =
    typeof raw.shortDescription === "string" ? raw.shortDescription.trim() : ""
  const body = typeof raw.body === "string" ? raw.body : ""
  const category = isCategory(raw.category) ? raw.category : "Breathing"
  const estimatedReadTime =
    typeof raw.estimatedReadTime === "string" && raw.estimatedReadTime.trim()
      ? raw.estimatedReadTime.trim()
      : "—"
  const phase = Number.isFinite(raw.phase) ? Number(raw.phase) : 1
  const displayOrder = Number.isFinite(raw.displayOrder)
    ? Number(raw.displayOrder)
    : index + 1
  const author =
    typeof raw.author === "string" && raw.author.trim()
      ? raw.author.trim()
      : "Hey Attrangi"
  const cover = isCover(raw.cover)
    ? raw.cover
    : FALLBACK_COVERS[index % FALLBACK_COVERS.length] || DEFAULT_COVER
  const coverImage =
    typeof raw.coverImage === "string" && raw.coverImage.trim()
      ? raw.coverImage.trim()
      : ""

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : slug,
    slug,
    title,
    shortDescription,
    body,
    category,
    estimatedReadTime,
    phase,
    displayOrder,
    author,
    cover,
    coverImage,
    description: shortDescription,
    readTime: estimatedReadTime,
  }
}

function loadAll(): ReadArticle[] {
  const rows = articlesJson as ReadArticleRecord[]
  return rows
    .map((row, index) => normalizeRecord(row, index))
    .filter((a): a is ReadArticle => a !== null)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title))
}

/** All articles ordered by displayOrder (asc). */
export function listReadArticles(options?: {
  category?: ReadArticleCategory
  phase?: number
}): ReadArticle[] {
  let items = loadAll()
  if (options?.category) {
    items = items.filter((a) => a.category === options.category)
  }
  if (options?.phase !== undefined) {
    items = items.filter((a) => a.phase === options.phase)
  }
  return items
}

export function getReadArticleBySlug(slug: string): ReadArticle | null {
  const normalized = slug.trim()
  if (!normalized) return null
  return loadAll().find((a) => a.slug === normalized) ?? null
}

export function getReadArticlesByIds(ids: string[]): ReadArticle[] {
  const map = new Map(loadAll().map((a) => [a.id, a]))
  return ids
    .map((id) => map.get(id))
    .filter((a): a is ReadArticle => Boolean(a))
}

export function getReadArticlesByCategory(
  category: ReadArticleCategory
): ReadArticle[] {
  return listReadArticles({ category })
}

export function splitReadBody(body: string): string[] {
  if (!body.trim()) return []
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}
