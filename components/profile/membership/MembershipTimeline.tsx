"use client"

import { useEffect, useState } from "react"
import { PROFILE_LABEL } from "../ui/profileChrome"
import { formatRelativeTime } from "./membershipUtils"

interface TimelineItem {
  id: string
  label: string
  date: Date | string | null | undefined
}

interface MembershipTimelineProps {
  accountCreated: Date | string | null | undefined
  lastLogin: Date | string | null | undefined
  lastProfileUpdate: Date | string | null | undefined
  className?: string
}

export default function MembershipTimeline({
  accountCreated,
  lastLogin,
  lastProfileUpdate,
  className = "",
}: MembershipTimelineProps) {
  const items: TimelineItem[] = [
    { id: "created", label: "Account Created", date: accountCreated },
    { id: "login", label: "Last Login", date: lastLogin },
    { id: "profile", label: "Last Profile Update", date: lastProfileUpdate },
  ]

  const [labels, setLabels] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, formatRelativeTime(item.date)]))
  )

  useEffect(() => {
    const refresh = () => {
      setLabels(
        Object.fromEntries(items.map((item) => [item.id, formatRelativeTime(item.date)]))
      )
    }
    refresh()
    const id = window.setInterval(refresh, 30_000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when source dates change
  }, [accountCreated, lastLogin, lastProfileUpdate])

  return (
    <ol className={`space-y-0 ${className}`} aria-label="Membership timeline">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="relative flex gap-4 pb-5 last:pb-0 animate-in fade-in duration-150 motion-reduce:animate-none"
          style={{ animationDelay: `${Math.min(index * 30, 90)}ms` }}
        >
          <div className="flex flex-col items-center" aria-hidden="true">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gray-900 ring-4 ring-gray-100" />
            {index < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-gray-200" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className={PROFILE_LABEL}>{item.label}</p>
            <p className="mt-1.5 text-sm font-semibold text-gray-900" aria-live="polite">
              {labels[item.id]}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
