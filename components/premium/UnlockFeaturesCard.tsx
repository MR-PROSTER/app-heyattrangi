import Link from "next/link"

export default function UnlockFeaturesCard() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF8D6] to-[#FFF1BE] rounded-3xl p-4 min-[360px]:p-6 border border-amber-200/50 shadow-sm flex items-center justify-between gap-3 min-[360px]:gap-4">
      <div className="space-y-2.5 min-[360px]:space-y-3.5 max-w-[72%]">
        <h2 className="text-zinc-900 font-extrabold text-[clamp(16px,4.8vw,20px)] tracking-tight whitespace-nowrap">
          Unlock All Features
        </h2>
        <p className="text-zinc-600 text-[clamp(11.5px,3.6vw,13px)] font-semibold leading-relaxed">
          AI Insights, Weekly Summaries, Advanced Dashboard, Longer Recordings and more.
        </p>
        <Link
          href="/dashboard/settings/subscription"
          className="inline-block bg-[#1A1A1A] hover:bg-[#333333] active:scale-[0.98] text-white text-[clamp(12px,3.8vw,13px)] font-extrabold px-4 py-2.5 min-[360px]:px-6 min-[360px]:py-3 rounded-xl min-[360px]:rounded-2xl shadow-sm transition-all text-center whitespace-nowrap"
          aria-label="Upgrade to Premium"
        >
          Upgrade to Premium
        </Link>
      </div>
      <div className="w-[clamp(44px,15vw,64px)] h-[clamp(44px,15vw,64px)] shrink-0 text-amber-500/80 drop-shadow-md pr-1">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.2L18.8 12 12 18.8 5.2 12 12 5.2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    </div>
  )
}
