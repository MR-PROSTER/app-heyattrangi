"use client"

import { useAppearance } from "@/components/providers/AppearanceProvider"

export default function AppearanceSettings() {
  const {
    theme,
    textSize,
    contrast,
    setTheme,
    setTextSize,
    setContrast,
  } = useAppearance()

  const themeOptions = [
    { label: "Light", value: "light" as const },
    { label: "System default", value: "system" as const },
    { label: "Dark", value: "dark" as const },
  ]

  const textSizeOptions = [
    { label: "Small", value: "small" as const },
    { label: "Medium", value: "medium" as const },
    { label: "Large", value: "large" as const },
  ]

  const contrastOptions = [
    { label: "Standard", value: "standard" as const },
    { label: "High Contrast", value: "high" as const },
  ]

  return (
    <div className="w-full max-w-[430px] mx-auto select-none animate-in fade-in duration-300">
      {/* Main Appearance Card */}
      <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100 flex flex-col gap-6 text-left">
        
        {/* Card Header Text */}
        <h2 
          style={{ fontFamily: 'var(--font-geist-sans)' }}
          className="font-semibold text-[15.5381px] leading-[20px] text-[#1E1E2E] max-w-[316.57px] w-full"
        >
          Personalize your viewing experience instantly.
        </h2>

        {/* Theme Selector */}
        <div className="space-y-2">
          <span className="text-[12px] font-black text-zinc-400 tracking-[0.14em] uppercase ml-1">
            Theme
          </span>
          <div className="flex w-full bg-[#FAF9F6] p-1 rounded-[18px] overflow-hidden relative">
            {themeOptions.map((opt) => {
              const active = theme === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 py-3 text-center text-[12.5px] font-extrabold rounded-[14px] transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm shadow-zinc-800/10"
                      : "text-zinc-400 hover:text-zinc-600 bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Text Size Selector */}
        <div className="space-y-2">
          <span className="text-[12px] font-black text-zinc-400 tracking-[0.14em] uppercase ml-1">
            Text Size
          </span>
          <div className="flex w-full bg-[#FAF9F6] p-1 rounded-[18px] overflow-hidden relative">
            {textSizeOptions.map((opt) => {
              const active = textSize === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setTextSize(opt.value)}
                  className={`flex-1 py-3 text-center text-[12.5px] font-extrabold rounded-[14px] transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm shadow-zinc-800/10"
                      : "text-zinc-400 hover:text-zinc-600 bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Contrast Mode Selector */}
        <div className="space-y-2">
          <span className="text-[12px] font-black text-zinc-400 tracking-[0.14em] uppercase ml-1">
            Contrast Mode
          </span>
          <div className="flex w-full bg-[#FAF9F6] p-1 rounded-[18px] overflow-hidden relative">
            {contrastOptions.map((opt) => {
              const active = contrast === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setContrast(opt.value)}
                  className={`flex-1 py-3 text-center text-[12.5px] font-extrabold rounded-[14px] transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-white text-zinc-900 shadow-sm shadow-zinc-800/10"
                      : "text-zinc-400 hover:text-zinc-600 bg-transparent"
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
