import type { ExploreActivityCategory } from "@/data/exploreActivities"

export type CompletionKind = "standard" | "journal" | "sleep"

export const JOURNAL_CALM_SENTENCES = [
  "Sometimes writing it down is enough for today.",
  "You don't have to solve everything today.",
  "One small reflection is enough.",
] as const

export function resolveCompletionKind(
  category: ExploreActivityCategory
): CompletionKind {
  if (category === "journaling") return "journal"
  if (category === "sleep") return "sleep"
  return "standard"
}

export function getCompletionPrimaryMessage(
  kind: CompletionKind
): string {
  switch (kind) {
    case "journal":
      return "Saved to your journal."
    case "sleep":
      return "Hope that settles things a little."
    default:
      return "Hope that helped a little."
  }
}

export function getCompletionSecondaryMessage(
  kind: CompletionKind,
  randomIndex?: number
): string | null {
  if (kind === "sleep") return "Goodnight."
  if (kind === "journal") {
    const i =
      typeof randomIndex === "number"
        ? randomIndex % JOURNAL_CALM_SENTENCES.length
        : Math.floor(Math.random() * JOURNAL_CALM_SENTENCES.length)
    return JOURNAL_CALM_SENTENCES[i]
  }
  return null
}

export function pickJournalCalmSentence(): string {
  const i = Math.floor(Math.random() * JOURNAL_CALM_SENTENCES.length)
  return JOURNAL_CALM_SENTENCES[i]
}
