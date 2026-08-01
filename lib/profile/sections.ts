/**
 * Profile section IDs used for nav, deep links (`#identity`), and IntersectionObserver.
 */

export const PROFILE_SECTION_IDS = [
  "identity",
  "membership",
  "emergency",
  "mind-matrix",
  "preferences",
  "privacy",
  "account",
] as const

export type ProfileSectionId = (typeof PROFILE_SECTION_IDS)[number]

/** Sections always present in the scroll document (emergency is gated). */
export const PROFILE_ALWAYS_SECTIONS: ProfileSectionId[] = [
  "identity",
  "membership",
  "mind-matrix",
  "preferences",
  "privacy",
  "account",
]

export function isProfileSectionId(value: string | null | undefined): value is ProfileSectionId {
  return !!value && (PROFILE_SECTION_IDS as readonly string[]).includes(value)
}

/**
 * Parse location hash into a section id.
 * Invalid / empty → null (caller scrolls to top).
 */
export function parseProfileHash(hash: string | null | undefined): ProfileSectionId | null {
  if (!hash) return null
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  const id = raw.split("?")[0]?.trim().toLowerCase() || ""
  return isProfileSectionId(id) ? id : null
}

/** Whether a section is currently available given membership gating. */
export function isSectionAvailable(
  id: ProfileSectionId,
  opts: { showEmergency: boolean }
): boolean {
  if (id === "emergency") return opts.showEmergency
  return true
}

export function buildProfileHash(id: ProfileSectionId): string {
  return `#${id}`
}
