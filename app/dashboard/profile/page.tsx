import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import {
    formatMemberSince,
    formatPlanLabel,
} from "@/components/profile/identity/identityUtils"
import ProfileHeader from "./components/ProfileHeader"
import IdentityCard from "./components/IdentityCard"
import StreakCard from "./components/StreakCard"
import ProfileLoading from "./loading"

/**
 * Display-only Profile page.
 * Edit → /dashboard/settings/personal-details
 * Settings icon → /dashboard/settings
 */
async function ProfileContent() {
    const user = await getCurrentUser()

    if (!user || user.role !== "PATIENT") {
        redirect("/")
    }

    const memberSinceLabel = formatMemberSince(user.createdAt)
    const planLabel = formatPlanLabel(user.plan)
    const streakDays = user.patient?.currentStreak ?? 0

    return (
        <main className="flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-bg)]">
            <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col min-w-0">
                <ProfileHeader />

                <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 min-[360px]:px-5 pb-[max(2rem,env(safe-area-inset-bottom))]">
                    <div className="rounded-[var(--radius-xl)] bg-gradient-to-b from-[var(--color-accent-light)] via-[var(--color-bg)] to-[var(--color-bg)] px-4 pb-5 pt-[14px] min-[360px]:pb-6 min-[360px]:pt-4">
                        <IdentityCard
                            name={user.name || ""}
                            email={user.email}
                            image={user.image}
                            emailVerified={user.emailVerified}
                            memberSinceLabel={memberSinceLabel}
                            planLabel={planLabel}
                        />

                        <div className="mt-5 min-[360px]:mt-6">
                            <StreakCard streakDays={streakDays} />
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}

export default function DashboardProfilePage() {
    return (
        <Suspense fallback={<ProfileLoading />}>
            <ProfileContent />
        </Suspense>
    )
}
