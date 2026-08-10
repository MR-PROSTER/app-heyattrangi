"use client"

import { motion } from "framer-motion"
import type { ReadArticle } from "@/data/readArticles"
import ArticleCard from "@/components/patient/library/explore/read/ArticleCard"

interface ArticleGridProps {
  articles: ReadArticle[]
  onSelectArticle?: (article: ReadArticle) => void
  layout?: "shelf" | "grid"
}

export default function ArticleGrid({
  articles,
  onSelectArticle,
  layout = "grid",
}: ArticleGridProps) {
  if (layout === "shelf") {
    return (
      <div className="flex gap-3.5 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
        {articles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.28,
              delay: Math.min(index * 0.04, 0.24),
              ease: [0.22, 1, 0.36, 1],
            }}
            className="snap-start"
          >
            <ArticleCard article={article} onSelect={onSelectArticle} index={index} />
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.28,
            delay: Math.min(index * 0.035, 0.28),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ArticleCard article={article} onSelect={onSelectArticle} index={index} />
        </motion.div>
      ))}
    </div>
  )
}
