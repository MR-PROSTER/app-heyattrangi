"use client"

import { useState, useEffect, useMemo } from "react"
import {
  WELLNESS_CATEGORIES,
  WELLNESS_ACTIVITIES,
  getActivitiesByCategory,
  getCategoryById,
  type WellnessActivity,
  type WellnessCategoryId,
  type WellnessCategoryMeta,
} from "@/lib/data/wellnessActivities"
import { WELLNESS_COLOR_THEME } from "@/lib/data/wellnessTheme"
import WellnessCategoryCard from "@/components/patient/library/WellnessCategoryCard"
import WellnessCategorySection from "@/components/patient/library/WellnessCategorySection"
import WellnessActivityCard from "@/components/patient/library/WellnessActivityCard"
import ActivityDetail from "@/components/patient/library/ActivityDetail"
import ActivityExperienceRouter from "@/components/patient/library/wellness/ActivityExperienceRouter"
import type { ExploreCategoryChipId } from "@/components/patient/library/explore/ExploreCategoryChips"

type ViewMode = "browse" | "detail" | "player"

interface WellnessActivitiesSectionProps {
  /** Compact layout when nested under Explore Activities tab */
  embedded?: boolean
  /** Chip filter from Explore (replaces All categories grid when embedded) */
  categoryFilter?: ExploreCategoryChipId
  /** Open a specific activity detail from a parent (e.g. Recommended cards) */
  externalActivity?: WellnessActivity | null
  onExternalActivityHandled?: () => void
}

export default function WellnessActivitiesSection({
  embedded = false,
  categoryFilter = "all",
  externalActivity = null,
  onExternalActivityHandled,
}: WellnessActivitiesSectionProps) {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<WellnessCategoryId | null>(null)
  const [selectedActivity, setSelectedActivity] =
    useState<WellnessActivity | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("browse")

  useEffect(() => {
    if (!externalActivity) return
    setSelectedActivity(externalActivity)
    setViewMode("detail")
    onExternalActivityHandled?.()
  }, [externalActivity, onExternalActivityHandled])

  // Sync chip filter → category browse (embedded mode)
  useEffect(() => {
    if (!embedded) return
    if (categoryFilter === "all") {
      setSelectedCategoryId(null)
    } else {
      setSelectedCategoryId(categoryFilter)
    }
  }, [embedded, categoryFilter])

  const selectedCategory: WellnessCategoryMeta | undefined = selectedCategoryId
    ? getCategoryById(selectedCategoryId)
    : undefined

  const selectedColor = selectedActivity
    ? getCategoryById(selectedActivity.categoryId)?.color ?? "teal"
    : "teal"

  const filteredActivities = useMemo(() => {
    if (categoryFilter === "all") return WELLNESS_ACTIVITIES
    return getActivitiesByCategory(categoryFilter)
  }, [categoryFilter])

  const openDetail = (activity: WellnessActivity) => {
    setSelectedActivity(activity)
    setViewMode("detail")
  }

  const closeOverlays = () => {
    setSelectedActivity(null)
    setViewMode("browse")
  }

  const showLegacyCategoryGrid = !embedded && !selectedCategory
  const showEmbeddedActivityGrid = embedded && categoryFilter === "all"
  const showCategoryDetail =
    (!embedded && !!selectedCategory) ||
    (embedded && categoryFilter !== "all" && !!selectedCategory)

  return (
    <section
      className={embedded ? "" : "mt-16 pt-12 border-t border-slate-100"}
      aria-labelledby="wellness-activities-heading"
    >
      {!embedded && !selectedCategory && (
        <div className="mb-10">
          <h3
            id="wellness-activities-heading"
            className="font-extrabold text-[28px] md:text-[32px] text-slate-800 tracking-tight mb-2"
          >
            Wellness Activities
          </h3>
          <p className="text-slate-500 font-medium text-sm max-w-2xl leading-relaxed">
            Explore guided wellness activities that can help you relax, reflect,
            and build healthy habits.
          </p>
        </div>
      )}

      {showLegacyCategoryGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
          {WELLNESS_CATEGORIES.map((category, index) => (
            <div
              key={category.id}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              style={{
                animationDelay: `${index * 40}ms`,
                animationDuration: "400ms",
              }}
            >
              <WellnessCategoryCard
                category={category}
                activityCount={getActivitiesByCategory(category.id).length}
                onSelect={(c) => setSelectedCategoryId(c.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showEmbeddedActivityGrid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 animate-in fade-in duration-200">
          {filteredActivities.map((activity) => {
            const color =
              getCategoryById(activity.categoryId)?.color ?? "teal"
            return (
              <WellnessActivityCard
                key={activity.id}
                activity={activity}
                color={color}
                onSelect={openDetail}
              />
            )
          })}
        </div>
      )}

      {showCategoryDetail && selectedCategory && (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-6">
          {!embedded && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`text-[11px] font-black transition-colors uppercase tracking-widest inline-flex items-center gap-1.5 rounded-full px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${WELLNESS_COLOR_THEME[selectedCategory.color].ring} ${WELLNESS_COLOR_THEME[selectedCategory.color].accentText} hover:opacity-80`}
            >
              ← Back to categories
            </button>
          )}

          <WellnessCategorySection
            category={selectedCategory}
            activities={getActivitiesByCategory(selectedCategory.id)}
            onSelectActivity={openDetail}
          />
        </div>
      )}

      {selectedActivity && viewMode === "detail" && (
        <ActivityDetail
          activity={selectedActivity}
          color={selectedColor}
          onClose={closeOverlays}
          onStart={() => setViewMode("player")}
        />
      )}

      {selectedActivity && viewMode === "player" && (
        <ActivityExperienceRouter
          activity={selectedActivity}
          color={selectedColor}
          onExit={closeOverlays}
          onDone={closeOverlays}
        />
      )}
    </section>
  )
}
