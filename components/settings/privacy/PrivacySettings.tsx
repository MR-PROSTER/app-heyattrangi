import Link from "next/link"
import {
  PRIVACY_POLICY_HREF,
  TERMS_OF_SERVICE_HREF,
  buildConsentRecords,
  formatConsentDate,
} from "@/components/profile/privacy/privacyUtils"

interface PrivacySettingsProps {
  hasPatient: boolean
  patientCreatedAt: Date | string | null
  userCreatedAt: Date | string
}

/**
 * Read-only Privacy & Consent.
 * No revoke / withdraw. Deletion remains on Profile.
 */
export default function PrivacySettings({
  hasPatient,
  patientCreatedAt,
  userCreatedAt,
}: PrivacySettingsProps) {
  const consents = buildConsentRecords({
    hasPatient,
    patientCreatedAt,
    userCreatedAt,
  })

  return (
    <div className="space-y-3 pt-2">
      {consents.map((record) => (
        <article
          key={record.id}
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5"
        >
          <h2 className="text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
            {record.title}
          </h2>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Consent Date: {formatConsentDate(record.acceptedAt)}
          </p>
          <p className="mt-0.5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            Status: {record.status === "accepted" ? "Accepted" : "Not recorded"}
          </p>
        </article>
      ))}

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Link
          href={PRIVACY_POLICY_HREF}
          className="flex min-h-11 items-center px-4 py-3.5 text-[var(--text-base)] font-medium text-[var(--color-text-primary)]
            hover:bg-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]"
        >
          Privacy Policy
        </Link>
        <div className="h-px w-full bg-[var(--color-border)]" role="separator" />
        <Link
          href={TERMS_OF_SERVICE_HREF}
          className="flex min-h-11 items-center px-4 py-3.5 text-[var(--text-base)] font-medium text-[var(--color-text-primary)]
            hover:bg-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]"
        >
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  )
}
