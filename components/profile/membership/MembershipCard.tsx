"use client"

import { useMemo } from "react"
import { User, Patient } from "@prisma/client"
import ProfileCard from "../ui/ProfileCard"
import ProfileDivider from "../ui/ProfileDivider"
import { PROFILE_LABEL, PROFILE_SECTION_DESC, PROFILE_SECTION_TITLE } from "../ui/profileChrome"
import MembershipBadge from "./MembershipBadge"
import MembershipTimeline from "./MembershipTimeline"
import {
  formatMonthYear,
  getAccountStatus,
  getMembershipBadgeVariant,
  getMembershipTitle,
  inferAuthProvider,
} from "./membershipUtils"

interface MembershipCardProps {
  user: User & {
    patient?: Patient | null
    accounts?: { provider: string }[]
  }
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-1 py-2.5 transition-colors duration-150 hover:bg-gray-50/80">
      <p className={`${PROFILE_LABEL} mb-1.5`}>{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

export default function MembershipCard({ user }: MembershipCardProps) {
  const badge = getMembershipBadgeVariant(user.plan)
  const title = getMembershipTitle(user.plan)
  const memberSince = formatMonthYear(user.createdAt)
  const status = getAccountStatus(user.patient)
  const authProvider = inferAuthProvider(user)

  const lastProfileUpdate = useMemo(() => {
    const times = [user.updatedAt, user.patient?.updatedAt]
      .filter(Boolean)
      .map((d) => new Date(d as Date).getTime())
    return times.length ? new Date(Math.max(...times)) : user.createdAt
  }, [user.updatedAt, user.patient?.updatedAt, user.createdAt])

  const lastLogin = user.patient?.lastLoginDate || user.updatedAt || user.createdAt

  return (
    <ProfileCard id="membership" aria-labelledby="membership-heading">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5 sm:mb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 id="membership-heading" className={PROFILE_SECTION_TITLE}>
                {title}
              </h2>
              <MembershipBadge variant={badge} />
            </div>
            <p className={PROFILE_SECTION_DESC}>Your membership and account activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          <InfoRow label="Current Plan" value={title} />
          <InfoRow label="Member Since" value={memberSince} />
          <InfoRow label="Status" value={status} />
          <InfoRow label="Authentication" value={authProvider} />
        </div>

        <ProfileDivider className="my-5 sm:my-6" label="Activity" />

        <MembershipTimeline
          accountCreated={user.createdAt}
          lastLogin={lastLogin}
          lastProfileUpdate={lastProfileUpdate}
        />
      </div>
    </ProfileCard>
  )
}
