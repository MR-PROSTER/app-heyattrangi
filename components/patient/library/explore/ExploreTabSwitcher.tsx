"use client"

import { motion } from "framer-motion"

export type ExploreTabId = "activities" | "read" | "listen" | "assessments"

const ALL_TABS: { id: ExploreTabId; label: string }[] = [
  { id: "activities", label: "Activities" },
  { id: "read", label: "Read" },
  { id: "listen", label: "Listen" },
  { id: "assessments", label: "Assessments" },
]

interface ExploreTabSwitcherProps {
  value: ExploreTabId
  onChange: (tab: ExploreTabId) => void
  /** Tabs to omit (e.g. hide Listen when no tracks) */
  hiddenTabs?: ExploreTabId[]
}

export default function ExploreTabSwitcher({
  value,
  onChange,
  hiddenTabs = [],
}: ExploreTabSwitcherProps) {
  const tabs = ALL_TABS.filter((tab) => !hiddenTabs.includes(tab.id))
  
  return (
    <>
      {/* Mobile Tab Switcher */}
      <div
        role="tablist"
        aria-label="Explore sections"
        className="flex md:hidden relative bg-[#EDE8E0] rounded-full p-1 items-center gap-0.5 w-full shadow-inner overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const active = value === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative z-[1] flex-1 py-2 px-1.5 min-[360px]:px-2.5 rounded-full text-[10px] min-[360px]:text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 text-center ${
                active
                  ? "text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="explore-tab-indicator-mobile"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-[1]">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Desktop Tab Switcher */}
      <div
        role="tablist"
        aria-label="Explore sections"
        className="hidden md:flex relative bg-[#EDE8E0] rounded-full p-1.5 items-center gap-0.5 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const active = value === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={`relative z-[1] flex-1 min-w-[4.5rem] px-3 sm:px-4 py-2.5 rounded-full text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                active
                  ? "text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="explore-tab-indicator"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-[1]">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}
