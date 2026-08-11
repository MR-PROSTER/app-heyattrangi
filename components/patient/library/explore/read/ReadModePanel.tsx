"use client"

import { useMemo, useState } from "react"
import { Source_Serif_4 } from "next/font/google"
import { motion } from "framer-motion"
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
      {/* —— Mobile: Overlapping 3D card deck layout matching ActivityGrid —— */}
      <div className="flex md:hidden flex-col -space-y-[22px] min-[360px]:-space-y-[27px] min-[390px]:-space-y-8 pt-4 pb-20">
        {ordered.map((article, index) => (
          <motion.div
            key={article.id}
            style={{ zIndex: index + 1 }}
            whileHover={{ y: -16, scale: 1.02, zIndex: 50 }}
            whileTap={{ y: -24, scale: 0.97, zIndex: 100 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="w-full relative cursor-pointer"
          >
            <ArticleCard
              article={article}
              onSelect={onSelectArticle}
              index={index}
            />
          </motion.div>
        ))}
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
