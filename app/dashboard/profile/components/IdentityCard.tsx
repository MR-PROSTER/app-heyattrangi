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
                className="relative w-[clamp(76px,22.5vw,96px)] h-[clamp(76px,22.5vw,96px)] sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-full
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
                        className="flex h-full w-full items-center justify-center bg-[var(--color-brand)] text-[clamp(26px,8.5vw,36px)] font-bold text-white"
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
                className="mt-[clamp(10px,3vw,16px)] max-w-[min(100%,20rem)] truncate text-[clamp(18px,5.2vw,22px)] font-bold
          leading-[var(--leading-tight)] tracking-tight text-[var(--color-text-primary)]"
            >
                {displayName}
            </h2>

            <div className="mt-[clamp(6px,2vw,12px)] flex w-full max-w-[min(100%,22rem)] items-center justify-center gap-1">
                <div className="w-10 min-[360px]:w-11 shrink-0" aria-hidden="true" />
                <p
                    title={email || undefined}
                    className="min-w-0 flex-1 text-center text-[clamp(11px,3.6vw,14px)] font-medium
            leading-none text-[var(--color-text-secondary)] whitespace-nowrap"
                >
                    {email || "—"}
                </p>
                {verified ? (
                    <span
                        className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-white"
                        title="Verified email"
                        aria-label="Email verified"
                    >
                        <svg className="size-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                ) : null}
                <Link
                    href={editHref}
                    aria-label="Edit personal details"
                    className="inline-flex min-h-10 min-w-10 min-[360px]:min-h-11 min-[360px]:min-w-11 shrink-0 items-center justify-center rounded-full
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

            <div className="mt-[clamp(8px,2.5vw,12px)] flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[clamp(10.5px,3.2vw,12px)] font-medium text-[var(--color-text-muted)] text-center">
                <span className="whitespace-nowrap">{memberSinceLabel}</span>
                <span className="text-[var(--color-border-strong)] max-[340px]:hidden" aria-hidden="true">
                    ·
                </span>
                <span className="whitespace-nowrap">{planLabel} plan</span>
            </div>
        </section>
    )
}
