/**
 * Read-only Privacy & Consent presentation for Profile.
 * Consent is inferred from onboarding completion (patient record) — no APIs.
 */

export const LEGAL_VERSION = "2026.07.23"
export const LEGAL_EFFECTIVE_LABEL = "23 Jul 2026"

export const PRIVACY_POLICY_HREF = "/privacy"
export const TERMS_OF_SERVICE_HREF = "/terms"

export type ConsentStatusKind = "accepted" | "not_recorded"

export interface ConsentRecord {
  id: string
  title: string
  description: string
  status: ConsentStatusKind
  acceptedAt: Date | string | null
  version: string
}

export interface AccountDataRow {
  id: string
  label: string
  hint: string
}

export const ACCOUNT_DATA_ROWS: AccountDataRow[] = [
  {
    id: "profile",
    label: "Profile Information",
    hint: "Name, contact details, and basic account fields",
  },
  {
    id: "emergency",
    label: "Emergency Contact",
    hint: "Someone we can reach in urgent situations",
  },
  {
    id: "mind-matrix",
    label: "Mind Matrix History",
    hint: "Your check-in results and dates",
  },
  {
    id: "journal",
    label: "Journal Entries",
    hint: "Notes and reflections you choose to save",
  },
  {
    id: "conversations",
    label: "Conversation History",
    hint: "Messages with your companion and support tools",
  },
  {
    id: "preferences",
    label: "Preferences",
    hint: "Language, reminders, and accessibility choices",
  },
]

export const DATA_USAGE_COPY =
  "Your information is used to provide personalized conversations, save your preferences, and maintain your wellness history."

export function formatConsentDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/** Build read-only consent rows from account creation (onboarding acceptance). */
export function buildConsentRecords(input: {
  patientCreatedAt?: Date | string | null
  userCreatedAt?: Date | string | null
  hasPatient: boolean
}): ConsentRecord[] {
  const acceptedAt = input.patientCreatedAt || input.userCreatedAt || null
  const status: ConsentStatusKind = input.hasPatient ? "accepted" : "not_recorded"

  return [
    {
      id: "ai-assistance",
      title: "AI Assistance Consent",
      description: "Allows Attrangi to offer supportive AI conversations and check-ins.",
      status,
      acceptedAt: status === "accepted" ? acceptedAt : null,
      version: LEGAL_VERSION,
    },
    {
      id: "data-processing",
      title: "Data Processing Consent",
      description: "Allows us to process account data needed to run your wellness experience.",
      status,
      acceptedAt: status === "accepted" ? acceptedAt : null,
      version: LEGAL_VERSION,
    },
  ]
}
