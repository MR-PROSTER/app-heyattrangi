"use client"

interface ExperienceControlsProps {
  onPrevious?: () => void
  onNext?: () => void
  onRestart?: () => void
  previousDisabled?: boolean
  nextDisabled?: boolean
  nextLabel?: string
  showPrevious?: boolean
  showNext?: boolean
  showRestart?: boolean
}

export default function ExperienceControls({
  onPrevious,
  onNext,
  onRestart,
  previousDisabled = false,
  nextDisabled = false,
  nextLabel = "Next",
  showPrevious = true,
  showNext = true,
  showRestart = false,
}: ExperienceControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {showPrevious && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={previousDisabled}
            className="flex-1 py-3.5 rounded-full text-sm font-bold text-white/90 bg-white/10 border border-white/20 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Previous
          </button>
        )}
        {showNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="flex-[1.4] py-3.5 rounded-full text-sm font-black uppercase tracking-widest text-slate-800 bg-white hover:bg-white/95 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {nextLabel}
          </button>
        )}
      </div>
      {showRestart && onRestart && (
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-2.5 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
        >
          Restart
        </button>
      )}
    </div>
  )
}
