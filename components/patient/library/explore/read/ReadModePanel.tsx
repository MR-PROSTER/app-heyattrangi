"use client"

import type { ReadArticle } from "@/data/readArticles"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"
import ArticleGrid from "@/components/patient/library/explore/read/ArticleGrid"
import ArticleCard from "@/components/patient/library/explore/read/ArticleCard"

interface ReadModePanelProps {
  articles: ReadArticle[]
  recentlyRead: ReadArticle[]
  onSelectArticle: (article: ReadArticle) => void
}

export default function ReadModePanel({
  articles,
  recentlyRead,
  onSelectArticle,
}: ReadModePanelProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {recentlyRead.length > 0 && (
        <section aria-label="Picked up recently">
          <ExploreSectionHeader title="Picked up recently" />
          <div className="flex gap-3 sm:gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
            {recentlyRead.map((article) => (
              <div
                key={`recent-${article.id}`}
                className="snap-start shrink-0 w-[260px] sm:w-[280px]"
              >
                <ArticleCard
                  article={article}
                  onSelect={onSelectArticle}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="read-articles-heading">
        <h2 id="read-articles-heading" className="sr-only">
          Articles
        </h2>
        <ArticleGrid
          articles={articles}
          onSelectArticle={onSelectArticle}
        />
      </section>
    </div>
  )
}
