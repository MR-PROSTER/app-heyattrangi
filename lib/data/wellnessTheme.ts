import type { WellnessCategoryColor } from "@/lib/data/wellnessActivities"

export const WELLNESS_COLOR_THEME: Record<
  WellnessCategoryColor,
  {
    iconBg: string
    iconBorder: string
    badge: string
    accent: string
    accentText: string
    softGradient: string
    cardGradient: string
    playerGradient: string
    progress: string
    ring: string
    button: string
    selectedBorder: string
  }
> = {
  teal: {
    iconBg: "bg-gradient-to-br from-teal-50 to-cyan-100/80 text-teal-600",
    iconBorder: "border-teal-300/50",
    badge: "bg-teal-50 text-teal-700 border-teal-100",
    accent: "bg-teal-500",
    accentText: "text-teal-600",
    softGradient: "from-teal-50/90 via-white to-cyan-50/40",
    cardGradient: "bg-gradient-to-br from-white via-white to-teal-50/50",
    playerGradient: "from-[#0f766e] via-[#0d9488] to-[#14b8a6]",
    progress: "bg-gradient-to-r from-teal-400 to-cyan-400",
    ring: "ring-teal-300",
    button: "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-teal-200/60",
    selectedBorder: "border-teal-400 ring-2 ring-teal-200/80",
  },
  green: {
    iconBg: "bg-gradient-to-br from-green-50 to-emerald-100/80 text-green-600",
    iconBorder: "border-green-300/50",
    badge: "bg-green-50 text-green-700 border-green-100",
    accent: "bg-green-500",
    accentText: "text-green-600",
    softGradient: "from-green-50/90 via-white to-emerald-50/40",
    cardGradient: "bg-gradient-to-br from-white via-white to-green-50/50",
    playerGradient: "from-[#166534] via-[#16a34a] to-[#4ade80]",
    progress: "bg-gradient-to-r from-green-400 to-emerald-400",
    ring: "ring-green-300",
    button: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-200/60",
    selectedBorder: "border-green-400 ring-2 ring-green-200/80",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-50 to-violet-100/80 text-purple-600",
    iconBorder: "border-purple-300/50",
    badge: "bg-purple-50 text-purple-700 border-purple-100",
    accent: "bg-purple-500",
    accentText: "text-purple-600",
    softGradient: "from-purple-50/90 via-white to-violet-50/40",
    cardGradient: "bg-gradient-to-br from-white via-white to-purple-50/50",
    playerGradient: "from-[#5b21b6] via-[#7c3aed] to-[#a78bfa]",
    progress: "bg-gradient-to-r from-purple-400 to-violet-400",
    ring: "ring-purple-300",
    button: "bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-purple-200/60",
    selectedBorder: "border-purple-400 ring-2 ring-purple-200/80",
  },
  orange: {
    iconBg: "bg-gradient-to-br from-orange-50 to-amber-100/80 text-orange-600",
    iconBorder: "border-orange-300/50",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    accent: "bg-orange-400",
    accentText: "text-orange-600",
    softGradient: "from-orange-50/90 via-white to-amber-50/40",
    cardGradient: "bg-gradient-to-br from-white via-white to-orange-50/50",
    playerGradient: "from-[#c2410c] via-[#ea580c] to-[#fb923c]",
    progress: "bg-gradient-to-r from-orange-400 to-amber-400",
    ring: "ring-orange-300",
    button: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-200/60",
    selectedBorder: "border-orange-400 ring-2 ring-orange-200/80",
  },
  indigo: {
    iconBg: "bg-gradient-to-br from-indigo-50 to-sky-100/70 text-indigo-600",
    iconBorder: "border-indigo-300/50",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
    accent: "bg-indigo-500",
    accentText: "text-indigo-600",
    softGradient: "from-indigo-50/90 via-white to-slate-50/60",
    cardGradient: "bg-gradient-to-br from-white via-white to-indigo-50/50",
    playerGradient: "from-[#1e1b4b] via-[#312e81] to-[#4338ca]",
    progress: "bg-gradient-to-r from-indigo-400 to-sky-400",
    ring: "ring-indigo-300",
    button: "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-indigo-200/60",
    selectedBorder: "border-indigo-400 ring-2 ring-indigo-200/80",
  },
}

export const ENCOURAGING_MESSAGES = [
  "A calm moment well spent — thank you for showing up for yourself.",
  "Small practices add up. This one counts.",
  "You gave yourself a quiet pause. That matters.",
  "Nice work completing this practice at your own pace.",
]
