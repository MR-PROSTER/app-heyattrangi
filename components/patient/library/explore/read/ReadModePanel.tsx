"use client"

import { useMemo, useState } from "react"
import { Source_Serif_4 } from "next/font/google"
import type { ReadArticle, ReadArticleCategory } from "@/data/readArticles"
import { READ_CATEGORIES } from "@/data/readArticles"
import ArticleGrid from "@/components/patient/library/explore/read/ArticleGrid"
import ArticleCard from "@/components/patient/library/explore/read/ArticleCard"

const shelfSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

type FilterKey = "All" | ReadArticleCategory

interface ReadModePanelProps {
  articles: ReadArticle[]
  recentlyRead?: ReadArticle[]
  onSelectArticle: (article: ReadArticle) => void
}

/**
 * Read browse — mobile: image-1 shelves (chips + genre rows).
 * Desktop (md+): multi-column cover grid.
 */
export default function ReadModePanel({
  articles,
  onSelectArticle,
}: ReadModePanelProps) {
  const [filter, setFilter] = useState<FilterKey>("All")

  const chips: FilterKey[] = useMemo(() => ["All", ...READ_CATEGORIES], [])

  const byOrder = (a: ReadArticle, b: ReadArticle) =>
    a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)

  const ordered = useMemo(() => [...articles].sort(byOrder), [articles])

  const sections = useMemo(() => {
    if (filter !== "All") {
      return [
        {
          category: filter,
          items: ordered.filter((a) => a.category === filter),
        },
      ]
    }
    return READ_CATEGORIES.map((category) => ({
      category,
      items: ordered.filter((a) => a.category === category),
    })).filter((s) => s.items.length > 0)
  }, [ordered, filter])

  const showAllForCategory = filter !== "All"

  if (ordered.length === 0) {
    return (
      <div className="animate-in fade-in duration-200">
        <p className="py-10 text-center text-sm font-medium text-[#8A8A8A]">
          No articles yet.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-200">
      {/* —— Mobile: image-1 literary shelves —— */}
      <div className="md:hidden space-y-7">
        {sections.map(({ category, items }) => (
          <section
            key={category}
            aria-labelledby={`read-mobile-${category}`}
            className="space-y-3"
          >
            <div className="flex items-end justify-between gap-3">
              <h2
                id={`read-mobile-${category}`}
                className={`${shelfSerif.className} text-[22px] font-bold tracking-tight text-[#1A1A1A]`}
              >
                {category}
              </h2>
              {!showAllForCategory ? (
                <button
                  type="button"
                  onClick={() => setFilter(category)}
                  className="shrink-0 text-[13px] font-semibold text-[#E8722A]
                    hover:text-[#D45F1A] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md px-1"
                >
                  See all
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="shrink-0 text-[13px] font-semibold text-[#E8722A]
                    hover:text-[#D45F1A] transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md px-1"
                >
                  Back
                </button>
              )}
            </div>

            {showAllForCategory ? (
              <div className="grid grid-cols-1 gap-4">
                {items.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSelect={onSelectArticle}
                    variant="shelf"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
                {items.map((article) => (
                  <div key={article.id} className="snap-start shrink-0 w-[280px]">
                    <ArticleCard
                      article={article}
                      onSelect={onSelectArticle}
                      variant="shelf"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {sections.length === 0 && (
          <p className="py-10 text-center text-sm font-medium text-[#8A8A8A]">
            No articles in this category yet.
          </p>
        )}
      </div>

      {/* —— Desktop: cover grid —— */}
      <div className="hidden md:block">
        <ArticleGrid
          articles={ordered}
          onSelectArticle={onSelectArticle}
          layout="grid"
        />
      </div>
    </div>
  )
}
