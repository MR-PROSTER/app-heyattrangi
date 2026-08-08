"use client"

import { useMemo, useState } from "react"
import { Source_Serif_4 } from "next/font/google"
import type { ReadArticle, ReadArticleCategory } from "@/data/readArticles"
import { READ_CATEGORIES } from "@/data/readArticles"
import type { ListenTrack, ListenCategory } from "@/data/listenContent"
import UnifiedCard from "./UnifiedCard"

const shelfSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

type FilterKey = "All" | ReadArticleCategory

interface ReadListenModePanelProps {
  articles: ReadArticle[]
  tracks: ListenTrack[]
  onSelectArticle: (article: ReadArticle) => void
  onSelectTrack: (track: ListenTrack) => void
}

function getCombinedCategory(item: { type: "read" | "listen"; category: string }): ReadArticleCategory {
  if (item.type === "read") {
    return item.category as ReadArticleCategory
  }
  
  const cat = item.category
  if (cat === "Instrumental") return "Breathing"
  if (cat === "Nature") return "Academic stress"
  if (cat === "Rain" || cat === "Ocean") return "Sleep"
  return "Breathing"
}

export default function ReadListenModePanel({
  articles,
  tracks,
  onSelectArticle,
  onSelectTrack,
}: ReadListenModePanelProps) {
  const [filter, setFilter] = useState<FilterKey>("All")

  const orderedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)
    )
  }, [articles])

  const orderedTracks = useMemo(() => {
    return [...tracks].sort(
      (a, b) => a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)
    )
  }, [tracks])

  // Grouped sections
  const sections = useMemo(() => {
    const combinedCats = READ_CATEGORIES
    
    const mapped = combinedCats.map((cat) => {
      const catArticles = orderedArticles
        .filter((a) => a.category === cat)
        .map((a) => ({ ...a, type: "read" as const }))

      const catTracks = orderedTracks
        .filter((t) => getCombinedCategory({ type: "listen", category: t.category }) === cat)
        .map((t) => ({ ...t, type: "listen" as const }))

      // Merge and sort by displayOrder
      const items = [...catArticles, ...catTracks].sort((a, b) => a.displayOrder - b.displayOrder)

      return {
        category: cat,
        items,
      }
    })

    if (filter !== "All") {
      return mapped.filter((s) => s.category === filter)
    }

    return mapped.filter((s) => s.items.length > 0)
  }, [orderedArticles, orderedTracks, filter])

  const showAllForCategory = filter !== "All"

  return (
    <div className="animate-in fade-in duration-200">
      <div className="space-y-7">
        {sections.map(({ category, items }) => (
          <section
            key={category}
            aria-labelledby={`readlisten-mobile-${category}`}
            className="space-y-3.5"
          >
            <div className="flex items-end justify-between gap-3">
              <h2
                id={`readlisten-mobile-${category}`}
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
              <div className="grid grid-cols-2 gap-x-3.5 gap-y-5">
                {items.map((item) => (
                  <UnifiedCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    type={item.type}
                    onSelect={item.type === "read" ? onSelectArticle : onSelectTrack}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
                {items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="snap-start shrink-0 w-[156px]">
                    <UnifiedCard
                      item={item}
                      type={item.type}
                      onSelect={item.type === "read" ? onSelectArticle : onSelectTrack}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        {sections.length === 0 && (
          <p className="py-10 text-center text-sm font-medium text-[#8A8A8A]">
            No items in this category yet.
          </p>
        )}
      </div>
    </div>
  )
}
