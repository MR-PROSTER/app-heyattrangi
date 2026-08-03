/**
 * Read content model — Excel/JSON/API-compatible fields.
 * Presentation fields (author, cover, coverImage) support the existing UI only.
 */

export type ReadArticleCategory =
  | "Breathing"
  | "Academic stress"
  | "Sleep"
  | "Transition"
  | "Calm"
  | "Habits"
  | "Feelings"
  | "Focus"
  | "Rest"

export type ReadCoverIllustration =
  | "pause"
  | "heart"
  | "moon"
  | "seed"
  | "focus"
  | "rest"
  | "walk"
  | "voice"
  | "sunrise"

export interface ReadArticleRecord {
  id: string
  slug: string
  title: string
  shortDescription: string
  body: string
  category: ReadArticleCategory
  estimatedReadTime: string
  phase: number
  displayOrder: number
  /** Existing card subtitle — presentation only */
  author?: string
  cover?: ReadCoverIllustration
  coverImage?: string
}

/** UI-facing article with aliases used by existing components. */
export interface ReadArticle extends ReadArticleRecord {
  /** Alias of shortDescription (existing UI) */
  description: string
  /** Alias of estimatedReadTime (existing UI) */
  readTime: string
  author: string
  cover: ReadCoverIllustration
  coverImage: string
}

export const READ_CATEGORIES: ReadArticleCategory[] = [
  "Breathing",
  "Academic stress",
  "Sleep",
  "Transition",
]

export const DEFAULT_COVER: ReadCoverIllustration = "pause"
