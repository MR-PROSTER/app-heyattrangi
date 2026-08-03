/**
 * Explore URL state — single source of truth for hub routing.
 *
 * Supported query params on `/patient/library`:
 * - `mode`     — activities | read | listen | assessments
 * - `category` — all | breathing | grounding | relaxation | journaling | sleep
 * - `item`     — article/track slug (read/listen detail)
 *
 * Activity detail lives at `/dashboard/explore?item={slug}`.
 */

export const EXPLORE_MODES = [
  "activities",
  "read",
  "listen",
  "assessments",
] as const

export type ExploreMode = (typeof EXPLORE_MODES)[number]

export const EXPLORE_CATEGORIES = [
  "all",
  "breathing",
  "grounding",
  "relaxation",
  "journaling",
  "sleep",
] as const

export type ExploreCategory = (typeof EXPLORE_CATEGORIES)[number]

export interface ExploreUrlState {
  mode: ExploreMode
  category: ExploreCategory
  item: string | null
}

const MODE_SET = new Set<string>(EXPLORE_MODES)
const CATEGORY_SET = new Set<string>(EXPLORE_CATEGORIES)

/** Invalid mode → activities */
export function parseExploreMode(
  raw: string | null | undefined,
  options?: { hideRead?: boolean; hideListen?: boolean }
): ExploreMode {
  if (!raw || !MODE_SET.has(raw)) return "activities"
  const mode = raw as ExploreMode
  if (mode === "read" && options?.hideRead) return "activities"
  if (mode === "listen" && options?.hideListen) return "activities"
  return mode
}

/** Invalid category → all */
export function parseExploreCategory(
  raw: string | null | undefined
): ExploreCategory {
  if (!raw || !CATEGORY_SET.has(raw)) return "all"
  return raw as ExploreCategory
}

export function parseExploreUrlState(
  params: URLSearchParams | { get: (key: string) => string | null },
  options?: { hideRead?: boolean; hideListen?: boolean }
): ExploreUrlState {
  const mode = parseExploreMode(params.get("mode"), options)
  const category = parseExploreCategory(params.get("category"))
  const itemRaw = params.get("item")?.trim() || null
  // item only meaningful for read/listen detail
  const item =
    mode === "read" || mode === "listen" ? itemRaw : null

  return { mode, category, item }
}

export function buildExploreSearchParams(
  state: Partial<ExploreUrlState> & Pick<ExploreUrlState, "mode">,
  current?: URLSearchParams
): URLSearchParams {
  const next = new URLSearchParams(current?.toString() ?? "")

  if (state.mode === "activities") {
    next.delete("mode")
  } else {
    next.set("mode", state.mode)
  }

  const category = state.category ?? "all"
  if (category === "all" || state.mode !== "activities") {
    next.delete("category")
  } else {
    next.set("category", category)
  }

  if (state.item && (state.mode === "read" || state.mode === "listen")) {
    next.set("item", state.item)
  } else {
    next.delete("item")
  }

  return next
}

export function buildExploreHref(
  state: Partial<ExploreUrlState> & Pick<ExploreUrlState, "mode">
): string {
  const params = buildExploreSearchParams(state)
  const qs = params.toString()
  return qs ? `/patient/library?${qs}` : "/patient/library"
}

export function buildActivityDetailHref(slug: string): string {
  return `/dashboard/explore?item=${encodeURIComponent(slug)}`
}

export function buildReadItemHref(slug: string): string {
  return `/read/${encodeURIComponent(slug)}`
}

export function buildListenItemHref(slug: string): string {
  return `/listen/${encodeURIComponent(slug)}`
}
