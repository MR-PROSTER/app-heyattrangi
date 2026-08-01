"use client"

import Link from "next/link"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"

interface AssessmentCategory {
  title: string
  count: string
  color: string
  iconPath: string
  hasPopular?: boolean
  onClick?: () => void
  image?: string
}

const CATEGORY_COLORS: Record<
  string,
  { soft: string; text: string; ring: string; bar: string; iconBg: string }
> = {
  blue: {
    soft: "bg-blue-50",
    text: "text-blue-600",
    ring: "border-blue-200",
    bar: "bg-blue-600",
    iconBg: "bg-blue-50/80 text-blue-500",
  },
  teal: {
    soft: "bg-teal-50",
    text: "text-teal-600",
    ring: "border-teal-200",
    bar: "bg-teal-500",
    iconBg: "bg-teal-50/80 text-teal-500",
  },
  purple: {
    soft: "bg-purple-50",
    text: "text-purple-600",
    ring: "border-purple-200",
    bar: "bg-purple-600",
    iconBg: "bg-purple-50/80 text-purple-500",
  },
  green: {
    soft: "bg-green-50",
    text: "text-green-600",
    ring: "border-green-200",
    bar: "bg-green-500",
    iconBg: "bg-green-50/80 text-green-500",
  },
  orange: {
    soft: "bg-orange-50",
    text: "text-orange-600",
    ring: "border-orange-200",
    bar: "bg-orange-400",
    iconBg: "bg-orange-50/80 text-orange-500",
  },
  rose: {
    soft: "bg-rose-50",
    text: "text-rose-600",
    ring: "border-rose-200",
    bar: "bg-rose-500",
    iconBg: "bg-rose-50/80 text-rose-500",
  },
  cyan: {
    soft: "bg-cyan-50",
    text: "text-cyan-600",
    ring: "border-cyan-200",
    bar: "bg-cyan-400",
    iconBg: "bg-cyan-50/80 text-cyan-500",
  },
}

interface AssessmentsCatalogProps {
  /** Navigate to legacy library modules (self_assignments, breathing, …) */
  onNavigateLibraryTab: (tab: string) => void
}

/**
 * Previous Assessments hero + category catalog (preserved alongside Mind Matrix).
 */
export default function AssessmentsCatalog({
  onNavigateLibraryTab,
}: AssessmentsCatalogProps) {
  const categories: AssessmentCategory[] = [
    {
      title: "Self & Mind",
      count: "8 Assessments",
      color: "blue",
      iconPath:
        "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      onClick: () => onNavigateLibraryTab("self_assignments"),
      image: "/assessments/depression.png",
    },
    {
      title: "Breathing",
      count: "3 Levels",
      color: "teal",
      iconPath:
        "M12 3c-1.5 3-4 5-4 8a4 4 0 008 0c0-3-2.5-5-4-8z M4.5 12.5c1.5-.5 3 0 4.5 1.5M19.5 12.5c-1.5-.5-3 0-4.5 1.5 M8 18.5c1.2.8 2.5 1.5 4 1.5s2.8-.7 4-1.5",
      hasPopular: true,
      onClick: () => onNavigateLibraryTab("breathing"),
      image: "/assessments/anxiety.png",
    },
    {
      title: "Academic Life",
      count: "6 Assessments",
      color: "purple",
      iconPath:
        "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
      image: "/assessments/adhd.png",
    },
    {
      title: "Lifestyle & Health",
      count: "7 Assessments",
      color: "green",
      iconPath:
        "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      image: "/assessments/ocd.png",
    },
    {
      title: "Personal Growth",
      count: "6 Assessments",
      color: "orange",
      iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
      image: "/assessments/ptsd.png",
    },
    {
      title: "Relationships",
      count: "5 Assessments",
      color: "rose",
      iconPath:
        "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      image: "/assessments/anxiety.png",
    },
    {
      title: "Habits & Routine",
      count: "6 Assessments",
      color: "cyan",
      iconPath:
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      image: "/assessments/depression.png",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero — previous Assessments banner */}
      <div className="relative w-full rounded-[28px] overflow-hidden bg-[#161434] shadow-xl text-white h-auto md:h-64 flex items-center border border-[#2a2656]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] bg-pink-500/30 blur-[90px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[40%] w-[40%] h-[50%] bg-purple-500/30 blur-[100px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[50%] bg-blue-500/20 blur-[80px] rounded-full mix-blend-screen" />
          <svg
            className="absolute bottom-0 w-full h-full mix-blend-screen opacity-40"
            viewBox="0 0 1000 300"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0,300 C300,180 400,100 600,160 C800,220 900,120 1000,0 L1000,300 Z"
              fill="url(#assessmentsExploreGrad1)"
              opacity="0.3"
            />
            <path
              d="M0,300 C200,230 300,120 500,170 C700,220 800,90 1000,0 L1000,300 Z"
              fill="url(#assessmentsExploreGrad2)"
              opacity="0.2"
            />
            <defs>
              <linearGradient
                id="assessmentsExploreGrad1"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <linearGradient
                id="assessmentsExploreGrad2"
                x1="0%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 w-full p-6 md:px-12 md:py-0 flex flex-col md:flex-row justify-between items-center h-full">
          <div className="max-w-md mb-6 md:mb-0">
            <h2 className="text-[24px] md:text-[28px] font-bold mb-3 tracking-tight text-white/95">
              Know Yourself, Grow Yourself
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
              Explore scientifically designed assessments to understand your
              mental, emotional, and lifestyle well-being.
            </p>
            <Link
              href="/patient/assessments/engine"
              className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/90 text-sm px-5 py-2.5 rounded-full font-semibold transition-all group shadow-[0_0_15px_rgba(255,255,255,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Start Dynamic Assessment
              <div className="bg-white text-[#161434] rounded-full p-1 group-hover:translate-x-0.5 transition-transform">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center md:mr-6">
            <div className="relative w-[130px] h-[130px] md:w-[150px] md:h-[150px] flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 120 120"
                aria-hidden
              >
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#60A5FA"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={326.7 * (1 - 0.72)}
                  className="drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                <span className="text-3xl font-bold tracking-tight text-white">
                  72%
                </span>
                <span className="text-[10px] text-white/60 font-semibold tracking-wide mt-0.5">
                  Overall Progress
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 tracking-wide">
              <svg
                className="w-3.5 h-3.5 drop-shadow-[0_0_3px_rgba(253,224,71,0.5)]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
              </svg>
              Keep going!
            </div>
          </div>
        </div>
      </div>

      {/* Category catalog */}
      <section aria-label="Assessment categories">
        <ExploreSectionHeader title="Assessments" />

        <div className="grid grid-cols-2 gap-3 md:hidden">
          {categories.map((item) => {
            const colors = CATEGORY_COLORS[item.color] || CATEGORY_COLORS.blue
            return (
              <article
                key={item.title}
                role={item.onClick ? "button" : undefined}
                tabIndex={item.onClick ? 0 : undefined}
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (!item.onClick) return
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    item.onClick()
                  }
                }}
                className={`bg-white rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.04)] border border-slate-100/80 ${
                  item.onClick
                    ? "cursor-pointer active:scale-[0.98] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                    : "opacity-90"
                }`}
              >
                <div
                  className={`aspect-[4/3] m-2.5 mb-0 rounded-[14px] overflow-hidden flex items-center justify-center relative ${colors.soft}`}
                >
                  {item.hasPopular && (
                    <span className="absolute top-2 left-2 bg-orange-50 text-orange-500 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-100 z-10">
                      Popular
                    </span>
                  )}
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <svg
                      className={`w-10 h-10 ${colors.text}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.3}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={item.iconPath}
                      />
                    </svg>
                  )}
                </div>
                <div className="p-3 pt-2.5">
                  <h4 className="font-bold text-[14px] text-slate-800 tracking-tight leading-snug mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-slate-400 font-medium">
                    {item.count}
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="relative group px-14 hidden md:block">
          <button
            type="button"
            aria-label="Scroll categories left"
            className="absolute left-0 top-1/2 -translate-y-[70%] w-11 h-11 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex justify-between items-end gap-2 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((item) => {
              const colors = CATEGORY_COLORS[item.color] || CATEGORY_COLORS.blue
              return (
                <div
                  key={item.title}
                  onClick={item.onClick}
                  onKeyDown={(e) => {
                    if (!item.onClick) return
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      item.onClick()
                    }
                  }}
                  role={item.onClick ? "button" : undefined}
                  tabIndex={item.onClick ? 0 : undefined}
                  className={`flex flex-col items-center flex-1 min-w-[120px] group ${
                    item.onClick
                      ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 rounded-xl"
                      : "pointer-events-none opacity-80"
                  }`}
                >
                  <div className="relative mb-6 w-full flex justify-center">
                    {item.hasPopular && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-50 text-orange-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap border border-orange-100 shadow-sm z-10">
                        Popular
                      </div>
                    )}
                    <div
                      className={`w-[100px] h-[100px] rounded-full relative flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 ${colors.iconBg} shadow-[0_10px_30px_rgba(0,0,0,0.08)]`}
                    >
                      <div
                        className={`absolute inset-2 rounded-full border-2 opacity-20 ${colors.ring}`}
                      />
                      <svg
                        className="w-[42px] h-[42px] opacity-90 stroke-[1.2]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={item.iconPath}
                        />
                      </svg>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-[15px] mb-1 text-center whitespace-nowrap">
                    {item.title}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-400 mb-3.5 tracking-wide">
                    {item.count}
                  </p>
                  <div className={`h-[3px] w-14 rounded-full ${colors.bar}`} />
                </div>
              )
            })}
          </div>

          <button
            type="button"
            aria-label="Scroll categories right"
            className="absolute right-0 top-1/2 -translate-y-[70%] w-11 h-11 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </section>
    </div>
  )
}
