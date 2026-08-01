"use client"

import {
  WELLNESS_CATEGORIES,
  type WellnessCategoryId,
} from "@/lib/data/wellnessActivities"

export type ExploreCategoryChipId = "all" | WellnessCategoryId

const CHIPS: { id: ExploreCategoryChipId; label: string }[] = [
  { id: "all", label: "All" },
  ...WELLNESS_CATEGORIES.map((c) => ({ id: c.id as ExploreCategoryChipId, label: c.title })),
]

interface ExploreCategoryChipsProps {
  value: ExploreCategoryChipId
  onChange: (id: ExploreCategoryChipId) => void
}

export default function ExploreCategoryChips({
  value,
  onChange,
}: ExploreCategoryChipsProps) {
  return (
    <div
      role="listbox"
      aria-label="Activity categories"
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar snap-x"
    >
      {CHIPS.map((chip) => {
        const active = value === chip.id
        return (
          <button
            key={chip.id}
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => onChange(chip.id)}
            className={`snap-start shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 border ${
              active
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
