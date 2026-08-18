"use client"

import React, { useMemo, useState, useEffect, memo } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { Bell, Search, SlidersHorizontal } from "lucide-react"
import { Source_Serif_4 } from "next/font/google"
import ExploreTabSwitcher from "@/components/patient/library/explore/ExploreTabSwitcher"
import UsageSummary from "@/components/patient/library/explore/UsageSummary"
import PremiumLimitModal from "@/components/patient/library/explore/PremiumLimitModal"
import useSWR from "swr"
import ActivityGrid from "@/components/patient/library/explore/ActivityGrid"
import ExploreErrorBoundary from "@/components/patient/library/explore/ExploreErrorBoundary"
import { useExplore } from "@/components/patient/library/explore/ExploreProvider"
import {
  ArticleGridSkeleton,
  ListenGridSkeleton,
  AssessmentCardSkeleton,
} from "@/components/patient/library/explore/ExploreSkeletons"
import { useListenPlayer } from "@/components/patient/library/explore/listen/ListenPlayerContext"
import {
  filterExploreActivities,
  type ExploreActivity,
} from "@/data/exploreActivities"
import { READ_ARTICLES, type ReadArticle } from "@/data/readArticles"
import {
  getBrowsableListenTracks,
  getListenTracksByIds,
  type ListenTrack,
} from "@/data/listenContent"
import type { ExploreMode } from "@/lib/explore/urlState"

const exploreSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

const ReadModePanel = dynamic(
  () => import("@/components/patient/library/explore/read/ReadModePanel"),
  { loading: () => <ArticleGridSkeleton />, ssr: false }
)

const ListenTabPanel = dynamic(
  () => import("@/components/patient/library/explore/listen/ListenTabPanel"),
  { loading: () => <ListenGridSkeleton />, ssr: false }
)

const AssessmentsModePanel = dynamic(
  () =>
    import(
      "@/components/patient/library/explore/assessments/AssessmentsModePanel"
    ),
  { loading: () => <AssessmentCardSkeleton />, ssr: false }
)

interface SelfExploreHomeProps {
  onNavigateLibraryTab: (tab: string) => void
}

/**
 * Explore hub — tab/category state comes from ExploreProvider (URL).
 * Mobile Read/Listen uses image-1 literary shelf layout.
 */
function SelfExploreHome({ onNavigateLibraryTab }: SelfExploreHomeProps) {
  const { data: session } = useSession()
  const {
    mode,
    category,
    hiddenTabs,
    recentlyRead,
    setMode,
    openActivity,
    openArticle,
    openListenTrack,
  } = useExplore()
  const { recentlyPlayedIds, playTrack } = useListenPlayer()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dbListenTracks, setDbListenTracks] = useState<ListenTrack[]>([])
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null)
  
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const { data: limitsData } = useSWR("/api/patient/limits", (url: string) => fetch(url).then(res => res.json()))
  
  const isPremium = limitsData?.plan === "PREMIUM" || limitsData?.plan === "ORGANIZATION"
  const hasReachedFreeLimit = !isPremium && limitsData?.usage?.activities?.remaining === 0
  const activityCount = limitsData?.usage?.activities?.used || 0

  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || "there"
  const isShelfMode = mode === "read" || mode === "listen"

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch("/api/library/audio-tracks")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.tracks) && data.tracks.length > 0) {
            setDbListenTracks(data.tracks)
          }
        }
      } catch (err) {
        console.error("Failed to load audio tracks from DB", err)
      }
    }
    fetchTracks()
  }, [])

  const listenTracks = useMemo(() => {
    return dbListenTracks.length > 0 ? dbListenTracks : getBrowsableListenTracks()
  }, [dbListenTracks])

  const filteredActivities = useMemo(() => {
    const base = filterExploreActivities(category)
    if (!searchQuery) return base
    const q = searchQuery.toLowerCase()
    return base.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    )
  }, [category, searchQuery])

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return READ_ARTICLES
    const q = searchQuery.toLowerCase()
    return READ_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const filteredListenTracks = useMemo(() => {
    if (!searchQuery) return listenTracks
    const q = searchQuery.toLowerCase()
    return listenTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q)
    )
  }, [listenTracks, searchQuery])

  const recentlyPlayed = useMemo(() => {
    const map = new Map(listenTracks.map((t) => [t.id, t]))
    return recentlyPlayedIds
      .map((id) => map.get(id))
      .filter((t): t is ListenTrack => t != null && t.audioAvailable)
  }, [recentlyPlayedIds, listenTracks])

  const handleSelectActivity = (activity: ExploreActivity) => {
    if (hasReachedFreeLimit) {
      setIsPremiumModalOpen(true)
    } else {
      openActivity(activity.slug)
    }
  }

  const handleSelectArticle = (article: ReadArticle) => {
    openArticle(article.slug)
  }

  const handleSelectTrack = (track: ListenTrack) => {
    openListenTrack(track.slug)
  }

  const handleTabChange = (tab: ExploreMode) => {
    setMode(tab)
    setActiveCategoryName(null)
  }

  return (
    <div className="space-y-4 min-[360px]:space-y-5 min-[390px]:space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 w-full pb-28">
      {/* Mobile Title Header (image-1 design) */}
      {!activeCategoryName && (
        <div className="md:hidden pt-3 min-[360px]:pt-4 pb-1">
          <h1 className="text-[26px] min-[360px]:text-[29px] min-[390px]:text-[32px] font-black text-slate-900 tracking-tight">
            Explore
          </h1>
        </div>
      )}

      {/* Default / desktop Explore header */}
      {!activeCategoryName && (
        <div
          className={`flex items-start justify-between gap-4 ${
            isShelfMode ? "hidden md:flex" : "hidden md:flex"
          }`}
        >
          <div className="min-w-0">
            <h1 className="font-extrabold text-[28px] md:text-[32px] text-slate-800 tracking-tight">
              Explore
            </h1>
            <p className="mt-1.5 text-slate-500 font-medium text-sm md:text-[15px] leading-relaxed max-w-md">
              Small things that might help, whenever you need them.
            </p>
          </div>
        </div>
      )}



      {!activeCategoryName && (
        <ExploreTabSwitcher
          value={mode}
          onChange={handleTabChange}
          hiddenTabs={hiddenTabs}
        />
      )}

      <ExploreErrorBoundary
        title="This section couldn’t load"
        description="Try another tab, or refresh Explore."
      >
        {mode === "activities" && (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
            <ActivityGrid
              activities={filteredActivities}
              onSelectActivity={handleSelectActivity}
              isLimitReached={hasReachedFreeLimit}
            />
          </div>
        )}

        {mode === "read" && (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
            <ReadModePanel
              articles={filteredArticles}
              recentlyRead={recentlyRead}
              onSelectArticle={handleSelectArticle}
            />
          </div>
        )}

        {mode === "listen" && (
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
            <ListenTabPanel
              initialTracks={listenTracks}
              onCategorySelect={setActiveCategoryName}
            />
          </div>
        )}

        {mode === "assessments" && (
          <AssessmentsModePanel
            onNavigateLibraryTab={onNavigateLibraryTab}
            searchQuery={searchQuery}
          />
        )}
      </ExploreErrorBoundary>

      <PremiumLimitModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
        activityCount={activityCount}
      />
    </div>
  )
}

export default memo(SelfExploreHome)
