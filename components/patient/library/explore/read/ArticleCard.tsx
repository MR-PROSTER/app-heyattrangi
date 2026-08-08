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
  variant?: "shelf" | "grid" | "row"
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

  if (variant === "row") {
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
        className={`group flex w-full items-center gap-4 text-left p-3.5 rounded-[22px] bg-white border border-slate-100/90 shadow-[0_6px_20px_rgba(40,30,20,0.03)] transition-all hover:translate-y-[-1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] ${className}`}
      >
        <div className="w-16 shrink-0">
          <ArticleCover
            illustration={article.cover}
            coverImage={article.coverImage}
            title={article.title}
          />
        </div>
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between h-full">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-[#1A1A1A] group-hover:text-slate-800">
              {article.title}
            </h3>
            {author && (
              <p className="truncate text-[11px] font-bold text-slate-400">
                {author}
              </p>
            )}
          </div>
          {readTime && (
            <div className="mt-2.5 flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{readTime} read</span>
            </div>
          )}
        </div>
      </button>
    )
  }

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
