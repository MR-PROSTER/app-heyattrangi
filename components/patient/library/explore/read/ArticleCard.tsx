"use client"

import { ChevronRight } from "lucide-react"
import type { ReadArticle } from "@/data/readArticles"
import ReadTimeBadge from "@/components/patient/library/explore/read/ReadTimeBadge"
import ActivityBadge from "@/components/patient/library/explore/ActivityBadge"

interface ArticleCardProps {
  article: ReadArticle
  onSelect?: (article: ReadArticle) => void
  className?: string
}

export default function ArticleCard({
  article,
  onSelect,
  className = "",
}: ArticleCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(article)}
      aria-label={`${article.title}, ${article.readTime} read, ${article.category}`}
      className={`group relative flex flex-col h-full w-full text-left rounded-[22px] bg-white border border-slate-100/90 p-4 sm:p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <ActivityBadge label={article.category} />
        <ChevronRight
          className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5"
          aria-hidden
        />
      </div>

      <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-800 tracking-tight leading-snug mb-1.5">
        {article.title}
      </h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4 line-clamp-2 flex-grow">
        {article.description}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <ReadTimeBadge readTime={article.readTime} />
      </div>
    </button>
  )
}
