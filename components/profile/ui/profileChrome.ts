/**
 * Shared Profile visual tokens — polish only, no behavior.
 * Keep radius, shadow, type, and timing consistent across sections.
 */

/** Standard section / preference card surface */
export const PROFILE_CARD_SURFACE =
  "rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm " +
  "transition-[box-shadow,border-color] duration-150 ease-out " +
  "hover:shadow-md hover:border-gray-200 " +
  "focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-200"

/** Nested informational panels inside a section */
export const PROFILE_INNER_CARD =
  "rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm " +
  "transition-[box-shadow,border-color] duration-150 ease-out " +
  "hover:shadow-md hover:border-gray-200"

/** Soft inset panel (insights, data usage) */
export const PROFILE_SOFT_PANEL =
  "rounded-2xl border border-gray-100 bg-gray-50/80 p-5 sm:p-6"

export const PROFILE_SECTION_TITLE =
  "text-lg sm:text-xl font-bold text-gray-900 tracking-tight"

export const PROFILE_SECTION_DESC =
  "mt-1 text-sm font-medium text-gray-500 leading-relaxed max-w-prose"

export const PROFILE_SUBHEAD =
  "text-sm font-bold text-gray-900"

export const PROFILE_LABEL =
  "text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400"

export const PROFILE_BODY =
  "text-sm font-medium text-gray-600 leading-relaxed"

export const PROFILE_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

/** Minimum comfortable touch target (~44px) */
export const PROFILE_TOUCH = "min-h-11 min-w-11"

export const PROFILE_ICON_SM = "w-4 h-4 shrink-0"
export const PROFILE_ICON_MD = "w-5 h-5 shrink-0"

/** Framer / CSS motion budget */
export const PROFILE_MOTION_MS = 0.15

export const PROFILE_DIVIDER = "border-0 border-t border-gray-100 my-5 sm:my-6"

export const PROFILE_STACK = "space-y-5 sm:space-y-6"
export const PROFILE_FIELD_GRID = "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5"

/** Offset for sticky mobile section chips + desktop content padding */
export const PROFILE_SCROLL_MT = "scroll-mt-28 md:scroll-mt-10"

export const PROFILE_BTN_SECONDARY =
  "inline-flex items-center justify-center min-h-11 rounded-xl border border-gray-200 bg-white px-4 py-2.5 " +
  "text-sm font-semibold text-gray-800 transition-colors duration-150 " +
  "hover:bg-gray-50 hover:border-gray-300 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

export const PROFILE_BTN_PRIMARY =
  "inline-flex items-center justify-center min-h-11 rounded-xl bg-gray-900 px-4 py-2.5 " +
  "text-sm font-semibold text-white transition-colors duration-150 " +
  "hover:bg-black " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
