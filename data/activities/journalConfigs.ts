export interface JournalConfig {
  slug: string
  title: string
  prompt: string
  placeholder: string
}

export const JOURNAL_CONFIGS: Record<string, JournalConfig> = {
  "journal-reflection": {
    slug: "journal-reflection",
    title: "Journal Reflection",
    prompt: "What's on your mind today?",
    placeholder: "Write freely. There is no right or wrong here…",
  },
}

export function getJournalConfig(slug: string): JournalConfig | undefined {
  return JOURNAL_CONFIGS[slug]
}
