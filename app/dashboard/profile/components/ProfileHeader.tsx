"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const TOUCH =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full " +
    "text-[var(--color-text-primary)] transition-colors duration-150 " +
    "hover:bg-[var(--color-surface)]/80 active:scale-[0.98] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2";

interface ProfileHeaderProps {
    title?: string
    /** Used when history is empty */
    fallbackBackHref?: string
    settingsHref?: string
}

export default function ProfileHeader({
    title = "Profile",
    fallbackBackHref = "/patient/dashboard",
    settingsHref = "/dashboard/settings",
}: ProfileHeaderProps) {
    const router = useRouter()

    const goBack = () => {
        // Directly navigate to the fallback URL (dashboard) to avoid returning to settings.
        router.push(fallbackBackHref);
    }

    return (
        <header
            className="sticky top-0 z-20 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-[var(--text-xs)]
        px-[var(--text-xs)]
        pt-[max(0.5rem,env(safe-area-inset-top))]
        pb-[var(--text-xs)]
        bg-[color-mix(in_srgb,var(--color-bg)_92%,transparent)] backdrop-blur-sm"
        >
            <button type="button" onClick={goBack} aria-label="Go back" className={TOUCH}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <h1 className="self-center text-center text-[var(--text-lg)] font-bold leading-[var(--leading-tight)] tracking-tight text-[var(--color-text-primary)]">
                {title}
            </h1>

            <Link href={settingsHref} aria-label="Open settings" className={TOUCH}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </Link>
        </header>
    )
}
