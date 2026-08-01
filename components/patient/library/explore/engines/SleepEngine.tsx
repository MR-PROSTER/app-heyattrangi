"use client"

import type { SleepConfig } from "@/data/activities/sleepConfigs"
import ActivityAnimation from "@/components/patient/library/explore/engines/ActivityAnimation"

interface SleepEngineProps {
  config: SleepConfig
  isPaused: boolean
}

export default function SleepEngine({ config, isPaused }: SleepEngineProps) {
  return (
    <ActivityAnimation
      animationKey="sleep"
      variant="float"
      isPaused={isPaused}
      className="w-full max-w-md mx-auto"
    >
      <div
        className="relative w-full overflow-hidden rounded-[28px] px-6 py-12 sm:px-10 sm:py-14 text-center"
        style={{
          background:
            "linear-gradient(160deg, #1e1b4b 0%, #312e81 45%, #1e3a5f 100%)",
        }}
      >
        {/* Soft ambient glow */}
        <div
          className="pointer-events-none absolute -top-10 right-6 w-40 h-40 rounded-full bg-indigo-300/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-4 w-48 h-32 rounded-full bg-violet-400/15 blur-3xl"
          aria-hidden
        />

        <div
          className={`relative mx-auto mb-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 shadow-[0_0_40px_rgba(253,224,71,0.35)] session-moon-float ${
            isPaused ? "session-breathe-paused" : ""
          }`}
          aria-hidden
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-50 to-yellow-100" />
          <div className="absolute top-3 right-4 w-6 h-6 rounded-full bg-indigo-900/10" />
          <div className="absolute bottom-5 left-5 w-3 h-3 rounded-full bg-indigo-900/10" />
        </div>

        <div className="relative space-y-4">
          <h2 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
            {config.headline}
          </h2>
          <div className="space-y-3">
            {config.lines.map((line) => (
              <p
                key={line}
                className="text-indigo-100/85 font-medium text-sm sm:text-[15px] leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>
          {isPaused && (
            <p
              className="text-indigo-200/70 text-xs font-semibold uppercase tracking-widest pt-2"
              role="status"
            >
              Paused
            </p>
          )}
        </div>
      </div>
    </ActivityAnimation>
  )
}
