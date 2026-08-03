"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Source_Serif_4 } from "next/font/google"
import type { ReadArticle } from "@/data/readArticles"
import { splitReadBody } from "@/data/readArticles"
import ReadingProgress from "@/components/patient/library/explore/read/ReadingProgress"

const articleSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

interface ArticleDetailProps {
  article: ReadArticle
  onBack: () => void
  onRead?: (article: ReadArticle) => void
}

function formatReadTimeLabel(readTime: string): string {
  const t = readTime.trim()
  if (!t || t === "—") return "—"
  if (/read/i.test(t)) return t
  return `${t} read`
}

/**
 * Article reading view — image-3 editorial layout.
 * Cream canvas, serif title, quiet body, Back to Explore.
 */
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
      const articleTop = articleRect.top - scrollerRect.top + scroller.scrollTop
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

  const title = article.title?.trim() || "Untitled"
  const shortDescription =
    article.shortDescription?.trim() || article.description?.trim() || ""
  const category = article.category?.trim() || ""
  const readTime =
    article.estimatedReadTime?.trim() || article.readTime?.trim() || "—"
  const paragraphs = splitReadBody(article.body || "")
  const articleKey = article.id || article.slug || "article"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full min-h-0 w-full flex-1 flex-col bg-[#F9F8F3] text-[#1A1A1A]"
    >
      <ReadingProgress progress={progress} />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[680px] px-6 pb-20 pt-5 sm:px-8 sm:pt-7 md:px-10">
          {/* Top bar — Back to Explore */}
          <div className="mb-10 sm:mb-12">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to Explore"
              className="text-[14px] font-medium text-[#4A4A4A] transition-colors hover:text-[#1A1A1A]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-md"
            >
              ← Back to Explore
            </button>
          </div>

          <motion.article
            ref={articleRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-labelledby={`article-title-${articleKey}`}
          >
            <header className="mb-0">
              <h1
                id={`article-title-${articleKey}`}
                className={`${articleSerif.className} text-[32px] sm:text-[40px] md:text-[44px] font-bold leading-[1.15] tracking-tight text-[#111111]`}
              >
                {title}
              </h1>

              {shortDescription ? (
                <p className="mt-3 text-[15px] sm:text-[16px] font-normal leading-relaxed text-[#6B6B6B]">
                  {shortDescription}
                </p>
              ) : null}

              <div className="mt-4 mb-6 flex flex-wrap items-center gap-2">
                {category ? (
                  <span className="inline-flex items-center rounded-full border border-[#D8D4CC] bg-transparent px-3 py-1 text-[12px] font-medium text-[#6B6B6B]">
                    {category}
                  </span>
                ) : null}
                <span className="inline-flex items-center rounded-full border border-[#D8D4CC] bg-transparent px-3 py-1 text-[12px] font-medium text-[#6B6B6B]">
                  {formatReadTimeLabel(readTime)}
                </span>
              </div>

              <hr className="mb-8 border-0 border-t border-[#E4E0D8]" />
            </header>

            <div className="space-y-6 text-[16px] sm:text-[17px] font-normal leading-[1.8] text-[#333333]">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, i) => (
                  <p key={`${articleKey}-p-${i}`}>{paragraph}</p>
                ))
              ) : (
                <p className="text-[#8A8A8A]">This article has no content yet.</p>
              )}
            </div>

            {/* End marker */}
            <div className="mt-14 flex justify-center" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8C4BC]" />
            </div>
          </motion.article>
        </div>
      </div>
    </motion.div>
  )
}
