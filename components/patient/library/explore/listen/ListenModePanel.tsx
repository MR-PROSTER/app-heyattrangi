"use client"

import { useMemo, useState } from "react"
import { Source_Serif_4 } from "next/font/google"
import type { ListenTrack, ListenCategory } from "@/data/listenContent"
import ListenCover from "@/components/patient/library/explore/listen/ListenCover"
import ListenGrid from "@/components/patient/library/explore/listen/ListenGrid"

const shelfSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

const LISTEN_CATEGORIES: ListenCategory[] = [
  "Rain",
  "Ocean",
  "Nature",
  "Instrumental",
]

type FilterKey = "All" | ListenCategory

interface ListenModePanelProps {
  tracks: ListenTrack[]
  recentlyPlayed?: ListenTrack[]
  onSelectTrack: (track: ListenTrack) => void
}

function ListenShelfCard({
  track,
  onSelect,
  variant = "shelf",
}: {
  track: ListenTrack
  onSelect?: (track: ListenTrack) => void
  variant?: "shelf" | "row"
}) {
  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(track)}
        aria-label={`Play ${track.title}, ${track.duration || ""}`}
        className="group flex w-full items-center gap-4 text-left p-3.5 rounded-[22px] bg-white border border-slate-100/90 shadow-[0_6px_20px_rgba(40,30,20,0.03)] transition-all hover:translate-y-[-1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      >
        <div className="w-16 shrink-0">
          <ListenCover
            illustration={track.coverIllustration}
            size="portrait"
            title={track.title}
          />
        </div>
        <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between h-full">
          <div className="space-y-1">
            <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-[#1A1A1A] group-hover:text-slate-800">
              {track.title}
            </h3>
            {track.artist && (
              <p className="truncate text-[11px] font-bold text-slate-400">
                {track.artist}
              </p>
            )}
          </div>
          {track.duration && (
            <div className="mt-2.5 flex items-center gap-1 text-[10px] font-black text-orange-500 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{track.duration} listen</span>
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(track)}
      aria-label={`Play ${track.title}, ${track.duration}`}
      className="group flex w-full flex-col text-left
        transition-transform duration-200 ease-out
        hover:-translate-y-0.5 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2 rounded-[14px]"
    >
      <ListenCover
        illustration={track.coverIllustration}
        size="portrait"
        title={track.title}
      />
      <div className="mt-3 px-0.5">
        <h3
          className={`${shelfSerif.className} line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-[#1A1A1A]`}
        >
          {track.title}
        </h3>
        {track.artist ? (
          <p className="mt-1 truncate text-[12px] font-medium text-[#9A9A9A]">
            {track.artist}
          </p>
        ) : null}
      </div>
    </button>
  )
}

/**
 * Listen browse — mobile: image-1 shelves; desktop: cover grid.
 */
export default function ListenModePanel({
  tracks,
  onSelectTrack,
}: ListenModePanelProps) {
  const [filter, setFilter] = useState<FilterKey>("All")

  const chips: FilterKey[] = useMemo(() => ["All", ...LISTEN_CATEGORIES], [])

  const ordered = useMemo(
    () =>
      [...tracks].sort(
        (a, b) =>
          a.displayOrder - b.displayOrder || a.title.localeCompare(b.title)
      ),
    [tracks]
  )

  const sections = useMemo(() => {
    if (filter !== "All") {
      return [
        {
          category: filter,
          items: ordered.filter((t) => t.category === filter),
        },
      ]
    }
    return LISTEN_CATEGORIES.map((category) => ({
      category,
      items: ordered.filter((t) => t.category === category),
    })).filter((s) => s.items.length > 0)
  }, [ordered, filter])

  const showAllForCategory = filter !== "All"

  if (ordered.length === 0) {
    return (
      <div className="animate-in fade-in duration-200">
        <p className="py-10 text-center text-sm font-medium text-[#8A8A8A]">
          No tracks yet.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-200">
      <div className="md:hidden space-y-7">
        {sections.map(({ category, items }) => (
          <section
            key={category}
            aria-labelledby={`listen-mobile-${category}`}
            className="space-y-3"
          >
            <div className="flex items-end justify-between gap-3">
              <h2
                id={`listen-mobile-${category}`}
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
                {items.map((track) => (
                  <ListenShelfCard
                    key={track.id}
                    track={track}
                    onSelect={onSelectTrack}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar snap-x">
                {items.map((track) => (
                  <div key={track.id} className="snap-start shrink-0 w-[148px]">
                    <ListenShelfCard track={track} onSelect={onSelectTrack} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="hidden md:block">
        <ListenGrid tracks={ordered} onSelectTrack={onSelectTrack} />
      </div>
    </div>
  )
}
