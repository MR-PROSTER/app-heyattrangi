"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { ReadArticle } from "@/data/readArticles"
import { formatReadPublishedDate } from "@/data/readArticles"
import ReadingProgress from "@/components/patient/library/explore/read/ReadingProgress"
import ReadTimeBadge from "@/components/patient/library/explore/read/ReadTimeBadge"
import ActivityBadge from "@/components/patient/library/explore/ActivityBadge"

interface ArticleDetailProps {
  article: ReadArticle
  onBack: () => void
  onRead?: (article: ReadArticle) => void
}

function splitBody(body: string): string[] {
  return body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function ArticleDetail({
  article,
  onBack,
  onRead,
}: ArticleDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const markedRef = useRef(false)

  useEffect(() => {
    if (!markedRef.current) {
      onRead?.(article)
      markedRef.current = true
    }
  }, [article, onRead])

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const update = () => {
      const el = articleRef.current
      if (!el || !scroller) return
      const scrollerRect = scroller.getBoundingClientRect()
      const articleRect = el.getBoundingClientRect()
      const articleTop =
        articleRect.top - scrollerRect.top + scroller.scrollTop
      const articleHeight = el.offsetHeight
      const viewport = scroller.clientHeight
      const readable = Math.max(articleHeight - viewport * 0.35, 1)
      const advanced = scroller.scrollTop + viewport * 0.25 - articleTop
      const pct = (advanced / readable) * 100
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    update()
    scroller.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scroller.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [article.id])

  const paragraphs = splitBody(article.body)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex-1 h-full min-h-0 w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans"
    >
      <ReadingProgress progress={progress} />

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-6 md:px-8 py-6 md:py-8 w-full max-w-[700px] mx-auto pb-16">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Read"
            className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Back
          </button>

          <motion.article
            ref={articleRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-labelledby={`article-title-${article.id}`}
          >
            <header className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <ActivityBadge label={article.category} />
                <ReadTimeBadge readTime={article.readTime} />
              </div>
              <h1
                id={`article-title-${article.id}`}
                className="font-extrabold text-[28px] md:text-[34px] text-slate-800 tracking-tight leading-[1.2]"
              >
                {article.title}
              </h1>
              <p className="text-slate-400 text-sm font-medium">
                Published {formatReadPublishedDate(article.publishedDate)}
              </p>
            </header>

            <div className="space-y-5 text-[16px] md:text-[17px] text-slate-600 font-medium leading-[1.75]">
              {paragraphs.map((paragraph, i) => (
                <p key={`${article.id}-p-${i}`}>{paragraph}</p>
              ))}
            </div>
          </motion.article>
        </div>
      </div>
    </motion.div>
  )
}
