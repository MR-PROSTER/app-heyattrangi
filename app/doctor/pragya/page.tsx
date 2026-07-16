import Image from "next/image"

export default function DoctorPragyaPlaceholder() {
  return (
    <div className="flex-1 h-full w-full bg-[#fafdfc] flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full text-center">
        {/* Sparkle Header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm uppercase tracking-wider mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Clinical AI Assistant
        </div>

        {/* Image Container */}
        <div className="relative w-64 h-64 mx-auto mb-10 group">
          <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full group-hover:bg-blue-500/30 transition-all duration-700" />
          <div className="relative w-full h-full rounded-[40px] overflow-hidden border-4 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transform transition-transform duration-700 group-hover:scale-105">
            <Image
              src="/new_bot/neutral.png"
              alt="Pragya AI"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-black shadow-xl whitespace-nowrap">
            Pragya v2.0
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">
          Coming Soon
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
          We are building a powerful, specialized AI companion designed to help you draft clinical notes, brainstorm case studies, and streamline your practice.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 mt-12 text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Smart Notes</h3>
            <p className="text-xs text-gray-500">Automated session summaries and structured clinical drafts.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Case Analysis</h3>
            <p className="text-xs text-gray-500">Brainstorm differential diagnoses and treatment strategies.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
