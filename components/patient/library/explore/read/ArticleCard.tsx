"use client"

import Image from "next/image"
import type { ReadArticle, ReadCoverIllustration } from "@/data/readArticles"
import ArticleCover from "@/components/patient/library/explore/read/ArticleCover"

interface ArticleCardProps {
  article: ReadArticle
  onSelect?: (article: ReadArticle) => void
  className?: string
  /** shelf = category shelf card; grid = default desktop grid card; row = list view row card */
  variant?: "shelf" | "grid" | "row"
}

function getIllustrationPath(illustration: ReadCoverIllustration): string {
  const paths: Record<ReadCoverIllustration, string> = {
    pause: "M12 6v6l4 2",
    heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
    moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
    seed: "M12 22c4-4 6-8 6-12a6 6 0 10-12 0c0 4 2 8 6 12z",
    focus: "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
    rest: "M3 12h18 M3 6h18 M3 18h12",
    walk: "M13 4a2 2 0 11-4 0 2 2 0 014 0z",
    voice: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z",
    sunrise: "M12 2v4 M12 10a6 6 0 016 6H6a6 6 0 016-6z",
  }
  return paths[illustration] || "M12 6v6l4 2"
}

function getArticleCardStyle(category: string) {
  switch (category) {
    case "Breathing":
      return {
        bg: "bg-[#CBEB7A]",
        text: "text-[#2C3A00]",
        labelBg: "bg-[#B5D965]",
        labelText: "text-[#2C3A00]",
        border: "border-[#B1D560]",
        circleBg: "bg-[#D9FA75]/70"
      }
    case "Academic stress":
      return {
        bg: "bg-[#85A3F0]",
        text: "text-[#001C5C]",
        labelBg: "bg-[#7192EA]",
        labelText: "text-[#001C5C]",
        border: "border-[#6E8FE6]",
        circleBg: "bg-[#6787DE]"
      }
    case "Sleep":
      return {
        bg: "bg-[#ED78D5]",
        text: "text-[#400030]",
        labelBg: "bg-[#D661BD]",
        labelText: "text-[#400030]",
        border: "border-[#D15DB8]",
        circleBg: "bg-[#D65FBC]"
      }
    case "Transition":
      return {
        bg: "bg-[#F4A462]",
        text: "text-[#733E0A]",
        labelBg: "bg-[#E59351]",
        labelText: "text-[#733E0A]",
        border: "border-[#D58544]",
        circleBg: "bg-[#F9B77E]"
      }
    default:
      // Calm, Habits, Feelings, Focus, Rest etc.
      return {
        bg: "bg-[#82EED4]",
        text: "text-[#003B2C]",
        labelBg: "bg-[#6FD8BF]",
        labelText: "text-[#003B2C]",
        border: "border-[#67D0B7]",
        circleBg: "bg-[#69CDB4]"
      }
  }
}

export default function ArticleCard({
  article,
  onSelect,
  className = "",
  variant = "grid",
}: ArticleCardProps) {
  const readTime =
    article.estimatedReadTime?.trim() || article.readTime?.trim() || ""
  const author = article.author?.trim() || ""

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

  const style = getArticleCardStyle(article.category)

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
      className={`group relative flex flex-col h-[200px] w-full text-left rounded-[32px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.04)] border ${style.bg} ${style.border} ${style.text} transition-all duration-300 ease-out overflow-hidden hover:scale-[1.02] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Glow overlay */}
      <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[32px] z-20" />

      {/* Title & Read Time */}
      <div className="flex items-start justify-between w-full z-10 gap-3">
        <span className="font-extrabold text-[20px] tracking-tight leading-tight line-clamp-3">
          {article.title}
        </span>
        <span className="text-[14px] font-bold opacity-80 shrink-0">
          {readTime}
        </span>
      </div>

      {/* Bottom Circle with Cover Image or illustration inside */}
      <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full ${style.circleBg} flex items-center justify-center z-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden`}>
        <div className="mb-18 w-24 h-24 relative rounded-full overflow-hidden border-2 border-white/60 shadow-md">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={getIllustrationPath(article.cover)} />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
