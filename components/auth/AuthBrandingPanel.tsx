export default function AuthBrandingPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`hidden lg:flex flex-1 relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-[#fafafa] ${className}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shine-sweep {
            0% { transform: translateX(-100vw) rotate(-15deg); }
            100% { transform: translateX(100vw) rotate(-15deg); }
          }
        ` }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fff4ec] to-[#ffe8d6] opacity-80" />
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[#ff6b00]/20 to-transparent rounded-full blur-[80px] animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#ff9800]/20 to-transparent rounded-full blur-[80px] animate-[pulse_5s_ease-in-out_infinite] [animation-delay:2s]" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[#ff5252]/10 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite] [animation-delay:1s]" />
        <div className="absolute top-[-50%] left-[0%] w-[15%] h-[200%] bg-white/30 -rotate-[15deg] mix-blend-overlay" />
        <div className="absolute top-[-50%] left-[25%] w-[8%] h-[200%] bg-white/40 -rotate-[15deg] mix-blend-overlay" />
        <div className="absolute top-[-50%] left-[45%] w-[12%] h-[200%] bg-white/20 -rotate-[15deg] mix-blend-overlay" />
        <div className="absolute top-[-50%] left-[70%] w-[20%] h-[200%] bg-white/30 -rotate-[15deg] mix-blend-overlay" />
        <div className="absolute top-[-50%] bottom-[-50%] w-[40%] h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-overlay animate-[shine-sweep_7s_infinite_linear]" />
        <div className="absolute top-[-50%] bottom-[-50%] w-[20%] h-[200%] bg-gradient-to-r from-transparent via-white/70 to-transparent mix-blend-overlay animate-[shine-sweep_11s_infinite_linear_3s]" />
      </div>

      <div className="relative z-10 w-fit flex items-center gap-3">
        <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-[2px]">
          <div className="bg-[#FFC107] rounded-tl-[4px]" />
          <div className="bg-[#FF5252] rounded-tr-[4px]" />
          <div className="bg-[#FF9800] rounded-bl-[4px]" />
          <div className="bg-[#E64A19] rounded-br-[4px]" />
        </div>
        <span className="font-extrabold text-2xl tracking-tighter text-gray-900">Hey Attrangi!</span>
      </div>

      <div className="relative z-10 mt-auto">
        <h2 className="text-2xl xl:text-[28px] font-bold text-[#14293f] leading-snug tracking-tight mb-6 max-w-2xl">
          Join the community with thousands of people already trusting the website
        </h2>
        <div className="flex flex-wrap items-center gap-8 text-[15px] font-semibold text-[#14293f]">
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> 24/7 AI Companion
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> Verified Therapists
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> Personalized Care
          </div>
        </div>
      </div>
    </div>
  )
}
