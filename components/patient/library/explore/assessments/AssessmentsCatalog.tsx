"use client"

import Link from "next/link"
import ExploreSectionHeader from "@/components/patient/library/explore/ExploreSectionHeader"
import { CLINICAL_ASSESSMENTS } from "@/data/clinicalAssessments"

interface AssessmentsCatalogProps {
  /** Kept for API compatibility with Explore hub */
  onNavigateLibraryTab?: (tab: string) => void
}

/**
 * Assessments hub — clinical assessments listed directly (no Self & Mind folder).
 */
export default function AssessmentsCatalog({}: AssessmentsCatalogProps) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative w-full rounded-[28px] overflow-hidden bg-[#161434] shadow-xl text-white h-auto md:h-64 flex items-center border border-[#2a2656]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] bg-pink-500/30 blur-[90px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[40%] w-[40%] h-[50%] bg-purple-500/30 blur-[100px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[50%] bg-blue-500/20 blur-[80px] rounded-full mix-blend-screen" />
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
        </div>
      </div>

      {/* Assessments listed directly */}
      <section aria-label="Assessments">
        <ExploreSectionHeader title="Assessments" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {CLINICAL_ASSESSMENTS.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-[24px] p-5 sm:p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all"
            >
              <h4 className="font-bold text-lg sm:text-xl text-slate-700 mb-1 tracking-tight pr-2">
                {item.title}
              </h4>
              <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-3">
                {item.shortName}
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-grow">
                {item.description}
              </p>

              <div className="flex items-end justify-between mt-auto gap-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <span className="text-xs font-semibold">{item.time}</span>
                  </div>
                  <Link
                    href={item.href}
                    className="text-[11px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest border-b-[1.5px] border-rose-200 hover:border-rose-500 pb-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-sm"
                  >
                    Take assessment
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
