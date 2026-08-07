import Image from "next/image"
import Link from "next/link"
import { isEmailVerified } from "../lib/profileDisplay"

export interface IdentityCardProps {
    name: string
    email: string | null
    image: string | null
    emailVerified: Date | string | null
    memberSinceLabel: string
    planLabel: string
    editHref?: string
}

function getInitial(name: string, email: string | null) {
    return (name || email || "U").trim().charAt(0).toUpperCase() || "U"
}

/**
 * Display-only identity hero. Pencil always routes to personal details.
 */
export default function IdentityCard({
    name,
    email,
    image,
    emailVerified,
    memberSinceLabel,
    planLabel,
    editHref = "/dashboard/settings/personal-details",
}: IdentityCardProps) {
    const displayName = (name || email || "Patient").trim()
    const initial = getInitial(name, email)
    const verified = isEmailVerified(emailVerified)

    return (
        <section
            aria-labelledby="profile-identity-heading"
            className="flex flex-col items-center text-center px-[var(--text-xs)]"
        >
            <div
                className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-full
          border-[3px] border-[var(--color-surface)] bg-[var(--color-border)]
          shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text-primary)_12%,transparent)]
          ring-1 ring-[color-mix(in_srgb,var(--color-text-primary)_5%,transparent)]"
            >
                {image ? (
                    <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                        priority
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center bg-[var(--color-brand)] text-[var(--text-3xl)] font-bold text-white"
                        aria-hidden="true"
                    >
                        {initial}
                    </div>
                )}
            </div>
            {/* Decorative avatar; name is announced via heading */}
            <span className="sr-only">Profile photo for {displayName}</span>

            <h2
                id="profile-identity-heading"
                title={displayName}
                className="mt-[var(--text-base)] max-w-[min(100%,20rem)] truncate text-[var(--text-xl)] font-bold
          leading-[var(--leading-tight)] tracking-tight text-[var(--color-text-primary)]"
            >
                {displayName}
            </h2>

            <div className="mt-[var(--text-xs)] flex w-full max-w-[min(100%,22rem)] items-start justify-center gap-[var(--text-xs)]">
                <p
                    title={email || undefined}
                    className="min-w-0 flex-1 break-words text-center text-[var(--text-sm)] font-medium
            leading-[var(--leading-base)] text-[var(--color-text-secondary)]
            [overflow-wrap:anywhere]"
                >
                    {email || "—"}
                </p>
                {verified ? (
                    <span
                        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white"
                        title="Verified email"
                        aria-label="Email verified"
                    >
                        <svg className="size-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                ) : null}
                <Link
                    href={editHref}
                    aria-label="Edit personal details"
                    className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full
            text-[var(--color-text-muted)] transition-colors duration-150
            hover:bg-[var(--color-surface)]/80 hover:text-[var(--color-text-primary)] active:scale-[0.98]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
                >
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                    </svg>
                </Link>
            </div>

            <p className="mt-[var(--text-xs)] text-[var(--text-xs)] font-medium text-[var(--color-text-muted)]">
                {memberSinceLabel}
                <span className="mx-[var(--text-xs)] text-[var(--color-border-strong)]" aria-hidden="true">
                    ·
                </span>
                {planLabel} plan
            </p>
        </section>
    )
}
