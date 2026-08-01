"use client"

import React, { useMemo, useState, memo } from "react"
import dynamic from "next/dynamic"
import { Search, SlidersHorizontal } from "lucide-react"
import ExploreTabSwitcher from "@/components/patient/library/explore/ExploreTabSwitcher"
import ExploreCategoryChips from "@/components/patient/library/explore/ExploreCategoryChips"
import RecommendedSection from "@/components/patient/library/explore/RecommendedSection"
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
  getRecommendedExploreActivities,
  type ExploreActivity,
} from "@/data/exploreActivities"
import { READ_ARTICLES, type ReadArticle } from "@/data/readArticles"
import {
  getBrowsableListenTracks,
  getListenTracksByIds,
  type ListenTrack,
} from "@/data/listenContent"
import type { ExploreMode } from "@/lib/explore/urlState"

const ReadModePanel = dynamic(
  () => import("@/components/patient/library/explore/read/ReadModePanel"),
  { loading: () => <ArticleGridSkeleton />, ssr: false }
)

const ListenModePanel = dynamic(
  () => import("@/components/patient/library/explore/listen/ListenModePanel"),
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
 */
function SelfExploreHome({ onNavigateLibraryTab }: SelfExploreHomeProps) {
  const {
    mode,
    category,
    hiddenTabs,
    recentlyRead,
    setMode,
    setCategory,
    openActivity,
    openArticle,
    openListenTrack,
  } = useExplore()
  const { recentlyPlayedIds, playTrack } = useListenPlayer()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const listenTracks = useMemo(() => getBrowsableListenTracks(), [])

  const recommendedActivities = useMemo(
    () => getRecommendedExploreActivities(),
    []
  )

  const filteredActivities = useMemo(
    () => filterExploreActivities(category),
    [category]
  )

  const recentlyPlayed = useMemo(
    () => getListenTracksByIds(recentlyPlayedIds),
    [recentlyPlayedIds]
  )

  const handleSelectActivity = (activity: ExploreActivity) => {
    openActivity(activity.slug)
  }

  const handleSelectArticle = (article: ReadArticle) => {
    openArticle(article.slug)
  }

  const handleSelectTrack = (track: ListenTrack) => {
    playTrack(track)
    openListenTrack(track.slug)
  }

  const handleTabChange = (tab: ExploreMode) => {
    setMode(tab)
  }

  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300 w-full pb-20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-extrabold text-[28px] md:text-[32px] text-slate-800 tracking-tight">
            Explore
          </h1>
          <p className="mt-1.5 text-slate-500 font-medium text-sm md:text-[15px] leading-relaxed max-w-md">
            Small things that might help, whenever you need them.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Search"
          aria-expanded={showSearch}
          className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
        >
          <Search className="w-5 h-5" strokeWidth={2.2} />
        </button>
      </div>

      {showSearch && (
        <div className="flex items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="search"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assessments, activities..."
              aria-label="Search Explore"
              className="pl-11 pr-4 py-2.5 rounded-full border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-orange-100 text-sm w-full bg-white font-medium text-slate-600 placeholder:text-slate-400 outline-none"
            />
          </div>
          <button
            type="button"
            className="p-2.5 border border-slate-200 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-slate-50 text-slate-500 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      )}

      <RecommendedSection
        activities={recommendedActivities}
        onSelectActivity={handleSelectActivity}
      />

      <ExploreTabSwitcher
        value={mode}
        onChange={handleTabChange}
        hiddenTabs={hiddenTabs}
      />

      <ExploreErrorBoundary
        title="This section couldn’t load"
        description="Try another tab, or refresh Explore."
      >
        {mode === "activities" && (
          <div className="space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
            <ExploreCategoryChips
              value={category}
              onChange={setCategory}
            />
            <ActivityGrid
              activities={filteredActivities}
              onSelectActivity={handleSelectActivity}
            />
          </div>
        )}

        {mode === "read" && READ_ARTICLES.length > 0 && (
          <ReadModePanel
            articles={READ_ARTICLES}
            recentlyRead={recentlyRead}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {mode === "listen" && listenTracks.length > 0 && (
          <ListenModePanel
            tracks={listenTracks}
            recentlyPlayed={recentlyPlayed}
            onSelectTrack={handleSelectTrack}
          />
        )}

        {mode === "assessments" && (
          <AssessmentsModePanel onNavigateLibraryTab={onNavigateLibraryTab} />
        )}
      </ExploreErrorBoundary>
    </div>
  )
}

export default memo(SelfExploreHome)
