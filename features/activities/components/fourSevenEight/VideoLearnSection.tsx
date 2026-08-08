"use client"

import { useEffect, useId, useState } from "react"
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion"

const VIDEOS = [
  {
    id: "YRPh_GaiL8s",
    title: "How To Perform the 4-7-8 Breathing Exercise",
    href: "https://www.youtube.com/watch?v=YRPh_GaiL8s",
  },
  {
    id: "gz4GFuJwWB8",
    title: "A short guided breathing practice",
    href: "https://www.youtube.com/watch?v=gz4GFuJwWB8",
  },
] as const

/**
 * Lazy YouTube learn-more section with accessible modal player.
 * Thumbnails only until the user opens a video — no eager iframe load.
 */
export function VideoLearnSection() {
  const [openId, setOpenId] = useState<string | null>(null)
  const titleId = useId()
  const reducedMotion = usePrefersReducedMotion()
  const open = VIDEOS.find((v) => v.id === openId) ?? null

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <section className="mt-10" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-sm font-semibold text-ink">
        Learn more
      </h2>
      <p className="mt-1 text-sm text-ink-subtle">
        Short videos if you want a visual walkthrough. Optional.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {VIDEOS.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              className="group flex w-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              onClick={() => setOpenId(v.id)}
              aria-label={`Play video: ${v.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt=""
                loading="lazy"
                width={480}
                height={360}
                className={`aspect-video w-full object-cover ${
                  reducedMotion ? "" : "transition-opacity group-hover:opacity-90"
                }`}
              />
              <span className="p-3 text-sm font-medium text-ink">{v.title}</span>
            </button>
          </li>
        ))}
      </ul>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(20,33,61,0.45)] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${titleId}-player`}
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-hairline bg-surface shadow-[0_1px_3px_rgba(20,33,61,0.06),0_8px_24px_-12px_rgba(20,33,61,0.10)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
              <h3
                id={`${titleId}-player`}
                className="text-sm font-semibold text-ink"
              >
                {open.title}
              </h3>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => setOpenId(null)}
                aria-label="Close video"
              >
                Close
              </button>
            </div>
            <div className="aspect-video w-full bg-ink">
              <iframe
                title={open.title}
                src={`https://www.youtube-nocookie.com/embed/${open.id}?autoplay=1&rel=0`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="px-4 py-3 text-xs text-ink-subtle">
              Opens via YouTube.{" "}
              <a
                href={open.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Watch on YouTube
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
