"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { ExploreTabId } from "@/components/patient/library/explore/ExploreTabSwitcher"
import type { ExploreCategoryChipId } from "@/components/patient/library/explore/ExploreCategoryChips"
import {
  buildExploreHref,
  buildActivityDetailHref,
  buildListenItemHref,
  buildReadItemHref,
  parseExploreUrlState,
  type ExploreCategory,
  type ExploreMode,
} from "@/lib/explore/urlState"
import { READ_ARTICLES } from "@/data/readArticles"
import { getBrowsableListenTracks } from "@/data/listenContent"
import { getReadArticlesByIds } from "@/data/readArticles"
import type { ReadArticle } from "@/data/readArticles"
import {
  getRecentlyReadIds,
  markRecentlyReadId,
} from "@/lib/read/recentlyRead"

interface ExploreContextValue {
  mode: ExploreMode
  category: ExploreCategory
  item: string | null
  hiddenTabs: ExploreTabId[]
  recentlyReadIds: string[]
  recentlyRead: ReadArticle[]
  setMode: (mode: ExploreMode) => void
  setCategory: (category: ExploreCategoryChipId) => void
  openActivity: (slug: string) => void
  openArticle: (slug: string) => void
  openListenTrack: (slug: string) => void
  markArticleRead: (article: ReadArticle) => void
  goExploreHome: (mode?: ExploreMode) => void
}

const ExploreContext = createContext<ExploreContextValue | null>(null)

/**
 * Single Explore hub state source. Mode/category mirror the URL.
 */
export function ExploreProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [recentlyReadIds, setRecentlyReadIds] = useState<string[]>([])

  useEffect(() => {
    setRecentlyReadIds(getRecentlyReadIds())
  }, [])

  const hideRead = READ_ARTICLES.length === 0
  const hideListen = getBrowsableListenTracks().length === 0

  const parsed = useMemo(
    () =>
      parseExploreUrlState(searchParams, {
        hideRead,
        hideListen,
      }),
    [searchParams, hideRead, hideListen]
  )

  const hiddenTabs = useMemo(() => {
    const tabs: ExploreTabId[] = []
    if (hideRead) tabs.push("read")
    if (hideListen) tabs.push("listen")
    return tabs
  }, [hideRead, hideListen])

  const recentlyRead = useMemo(
    () => getReadArticlesByIds(recentlyReadIds),
    [recentlyReadIds]
  )

  const replaceExploreUrl = useCallback(
    (next: { mode: ExploreMode; category?: ExploreCategory; item?: string | null }) => {
      const href = buildExploreHref({
        mode: next.mode,
        category: next.category ?? (next.mode === "activities" ? parsed.category : "all"),
        item: next.item === undefined ? null : next.item,
      })
      // Only push when on library hub (detail early-returns still use router.push)
      if (pathname?.startsWith("/patient/library")) {
        router.replace(href, { scroll: false })
      } else {
        router.push(href)
      }
    },
    [pathname, router, parsed.category]
  )

  const setMode = useCallback(
    (mode: ExploreMode) => {
      replaceExploreUrl({
        mode,
        category: mode === "activities" ? parsed.category : "all",
        item: null,
      })
    },
    [replaceExploreUrl, parsed.category]
  )

  const setCategory = useCallback(
    (category: ExploreCategoryChipId) => {
      replaceExploreUrl({
        mode: "activities",
        category: category as ExploreCategory,
        item: null,
      })
    },
    [replaceExploreUrl]
  )

  const openActivity = useCallback(
    (slug: string) => {
      router.push(buildActivityDetailHref(slug))
    },
    [router]
  )

  const openArticle = useCallback(
    (slug: string) => {
      router.push(buildReadItemHref(slug))
    },
    [router]
  )

  const openListenTrack = useCallback(
    (slug: string) => {
      router.push(buildListenItemHref(slug))
    },
    [router]
  )

  const markArticleRead = useCallback((article: ReadArticle) => {
    markRecentlyReadId(article.id)
    setRecentlyReadIds(getRecentlyReadIds())
  }, [])

  const goExploreHome = useCallback(
    (mode: ExploreMode = "activities") => {
      router.push(buildExploreHref({ mode, category: "all", item: null }))
    },
    [router]
  )

  const value = useMemo(
    () => ({
      mode: parsed.mode,
      category: parsed.category,
      item: parsed.item,
      hiddenTabs,
      recentlyReadIds,
      recentlyRead,
      setMode,
      setCategory,
      openActivity,
      openArticle,
      openListenTrack,
      markArticleRead,
      goExploreHome,
    }),
    [
      parsed.mode,
      parsed.category,
      parsed.item,
      hiddenTabs,
      recentlyReadIds,
      recentlyRead,
      setMode,
      setCategory,
      openActivity,
      openArticle,
      openListenTrack,
      markArticleRead,
      goExploreHome,
    ]
  )

  return (
    <ExploreContext.Provider value={value}>{children}</ExploreContext.Provider>
  )
}

export function useExplore(): ExploreContextValue {
  const ctx = useContext(ExploreContext)
  if (!ctx) {
    throw new Error("useExplore must be used within ExploreProvider")
  }
  return ctx
}
