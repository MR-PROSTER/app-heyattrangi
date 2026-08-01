"use client"

import { motion } from "framer-motion"
import type { ReadArticle } from "@/data/readArticles"
import ArticleCard from "@/components/patient/library/explore/read/ArticleCard"

interface ArticleGridProps {
  articles: ReadArticle[]
  onSelectArticle?: (article: ReadArticle) => void
}

export default function ArticleGrid({
  articles,
  onSelectArticle,
}: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: Math.min(index * 0.04, 0.24),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ArticleCard article={article} onSelect={onSelectArticle} />
        </motion.div>
      ))}
    </div>
  )
}
