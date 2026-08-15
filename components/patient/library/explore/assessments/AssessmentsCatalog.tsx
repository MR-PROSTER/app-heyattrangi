"use client"

import { useMemo } from "react"
import Link from "next/link"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"
import { CLINICAL_ASSESSMENTS } from "@/data/clinicalAssessments"

interface AssessmentsCatalogProps {
  searchQuery?: string
  /** Kept for API compatibility with Explore hub */
  onNavigateLibraryTab?: (tab: string) => void
}

/**
 * Assessments hub — clinical assessments listed directly (no Self & Mind folder).
 */
export default function AssessmentsCatalog({ searchQuery = "", onNavigateLibraryTab }: AssessmentsCatalogProps) {
  const filtered = useMemo(() => {
    if (!searchQuery) return CLINICAL_ASSESSMENTS
    const q = searchQuery.toLowerCase()
    return CLINICAL_ASSESSMENTS.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.shortName && a.shortName.toLowerCase().includes(q))
    )
  }, [searchQuery])
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div 
        className="relative w-full rounded-[28px] overflow-hidden shadow-xl text-white h-auto md:h-64 flex items-center border border-white/10"
        style={{
          backgroundImage: "url('https://res.cloudinary.com/dxoiluua8/image/upload/v1786789037/Banner_bg_rrixld.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 w-full p-8 md:px-12 md:py-8 flex flex-col md:flex-row justify-between items-center h-full">
          <div className="max-w-md mb-4 md:mb-0">
            <h2 className="text-[24px] md:text-[30px] font-sans font-[1000] mb-3 tracking-[-0.5px] leading-tight text-black">
              Understand How You&apos;re Doing
            </h2>
            <p className="text-black/85 text-[14px] md:text-[15px] leading-relaxed mb-6 font-medium font-sans tracking-[-0.3px]">
              Take a closer look at your emotional, social, and everyday wellbeing through guided assessments.
            </p>
            <Link
              href="/patient/assessments/engine"
              className="inline-flex items-center gap-3 bg-black hover:bg-zinc-900 text-white text-sm px-6 py-3 rounded-full font-bold transition-all duration-150 group shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
            >
              Start an Assessment
              <div className="bg-white text-black rounded-full p-1 group-hover:translate-x-0.5 transition-transform">
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
        </div>
      </div>

      {/* Assessments listed directly */}
      <section aria-label="Assessments">
        <ExploreSectionHeader title="Assessments" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all"
            >
              <h4 className="font-bold text-lg sm:text-xl text-slate-700 mb-1 tracking-tight pr-2">
                {item.title}
              </h4>
              <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-3">
                {item.shortName}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
                {item.description}
              </p>

              <div className="flex items-center justify-between mt-auto pt-2">
                {/* Time Badge */}
                <div className="flex items-center gap-1.5 text-slate-400">
                  <svg
                    className="w-3.5 h-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-slate-500">{item.time}</span>
                </div>

                {/* Action Button */}
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-extrabold text-[11px] px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 uppercase tracking-wider"
                >
                  Take Assessment
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
