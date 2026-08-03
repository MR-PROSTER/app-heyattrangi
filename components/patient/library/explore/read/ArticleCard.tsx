"use client"

import { Source_Serif_4 } from "next/font/google"
import type { ReadArticle } from "@/data/readArticles"
import ArticleCover from "@/components/patient/library/explore/read/ArticleCover"

const cardSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

interface ArticleCardProps {
  article: ReadArticle
  onSelect?: (article: ReadArticle) => void
  className?: string
  /** shelf = image-1 mobile card (title + author); grid = title only */
  variant?: "shelf" | "grid"
}

/**
 * Library browse card — portrait cover + title (+ author on shelf).
 */
export default function ArticleCard({
  article,
  onSelect,
  className = "",
  variant = "grid",
}: ArticleCardProps) {
  const readTime =
    article.estimatedReadTime?.trim() || article.readTime?.trim() || ""
  const author = article.author?.trim() || ""
  const isShelf = variant === "shelf"

  return (
    <button
      type="button"
      onClick={() => onSelect?.(article)}
      aria-label={[
        article.title,
        author ? `by ${author}` : "",
        readTime ? `${readTime} read` : "",
      ]
        .filter(Boolean)
        .join(", ")}
      className={`group flex w-full flex-col text-left
        transition-transform duration-200 ease-out
        hover:-translate-y-0.5 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[14px]
        ${className}`}
    >
      <ArticleCover
        illustration={article.cover}
        coverImage={article.coverImage}
        title={article.title}
      />
      <div className="mt-3 px-0.5">
        <h3
          className={`line-clamp-2 leading-snug tracking-tight text-[#1A1A1A]
            ${
              isShelf
                ? `${cardSerif.className} text-[15px] font-bold`
                : "text-[15px] sm:text-[16px] font-bold"
            }`}
        >
          {article.title}
        </h3>
        {isShelf && author ? (
          <p className="mt-1 truncate text-[12px] font-medium text-[#9A9A9A]">
            {author}
          </p>
        ) : null}
      </div>
    </button>
  )
}
