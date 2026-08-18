"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

const rangeOptions = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
]

export default function AdminFilters({
  userName,
  organizations,
}: {
  userName?: string | null
  organizations: { id: string; name: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const range = searchParams.get("range") || "last7"
  const organizationId = searchParams.get("organizationId") || "all"
  const currentStart = searchParams.get("start") || ""
  const currentEnd = searchParams.get("end") || ""
  const [customStart, setCustomStart] = useState(currentStart)
  const [customEnd, setCustomEnd] = useState(currentEnd)

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === "all") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", "custom")
    params.set("start", customStart)
    params.set("end", customEnd)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none"
        value={range}
        onChange={(event) => {
          const nextRange = event.target.value
          if (nextRange !== "custom") {
            const params = new URLSearchParams(searchParams.toString())
            params.set("range", nextRange)
            params.delete("start")
            params.delete("end")
            router.replace(`${pathname}?${params.toString()}`)
            return
          }
          updateParams({ range: "custom" })
        }}
        aria-label="Date range"
      >
        {rangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {range === "custom" && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <input
            type="date"
            value={customStart}
            onChange={(event) => setCustomStart(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none"
            aria-label="Custom range start"
          />
          <span className="px-1 text-sm font-bold text-slate-400">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(event) => setCustomEnd(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 outline-none"
            aria-label="Custom range end"
          />
          <button
            type="button"
            onClick={applyCustomRange}
            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          >
            Apply
          </button>
        </div>
      )}

      <select
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none"
        value={organizationId}
        onChange={(event) => {
          updateParams({ organizationId: event.target.value })
        }}
        aria-label="Institution filter"
      >
        {[{ value: "all", label: "All institutions" }, ...organizations.map((org) => ({ value: org.id, label: org.name }))].map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
        {userName || "Admin"}
      </div>
    </div>
  )
}
