"use client"

interface ActivitySessionPlaceholderProps {
  activityName: string
  isPaused: boolean
}

/**
 * Shared placeholder until activity-specific guided content is implemented.
 * Circle animation freezes while paused via animation-play-state.
 */
export default function ActivitySessionPlaceholder({
  activityName,
  isPaused,
}: ActivitySessionPlaceholderProps) {
  const pauseClass = isPaused ? "session-breathe-paused" : ""

  return (
    <div className="flex flex-col items-center text-center gap-8 max-w-sm w-full">
      <div
        className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center"
        aria-hidden
      >
        <div
          className={`absolute inset-0 rounded-full bg-orange-200/40 session-breathe-halo ${pauseClass}`}
        />
        <div
          className={`absolute inset-4 sm:inset-5 rounded-full bg-gradient-to-br from-orange-300/50 to-amber-200/40 border border-orange-200/60 session-breathe-ring ${pauseClass}`}
        />
        <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-[0_8px_28px_rgba(249,115,22,0.18)] border border-orange-100 flex items-center justify-center">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-400/90 session-breathe-core ${pauseClass}`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-extrabold text-xl sm:text-2xl text-slate-800 tracking-tight">
          {activityName}
        </h2>
        <p className="text-slate-500 font-medium text-sm sm:text-[15px] leading-relaxed">
          Interactive activity content will appear here.
        </p>
        {isPaused && (
          <p
            className="text-slate-400 text-xs font-semibold uppercase tracking-widest pt-1"
            role="status"
          >
            Paused
          </p>
        )}
      </div>
    </div>
  )
}
