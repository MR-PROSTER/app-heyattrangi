import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] font-sans relative overflow-hidden">
      {/* Soft static background gradients for a cute but professional aesthetic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#fef3f2] rounded-full blur-[100px] opacity-80" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#f0f7f4] rounded-full blur-[80px] opacity-80" />

      <div className="relative z-10 w-full max-w-md p-12 bg-white/80 backdrop-blur-md rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mx-4 text-center">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#fff5f5] rounded-[24px] flex items-center justify-center rotate-3 border border-[#ffe5e5]">
            <svg className="w-8 h-8 text-[#ff8a8a] -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h1 className="text-[22px] font-bold text-[#2d3748] mb-3 tracking-tight">
          Restricted Access
        </h1>
        
        <p className="text-[#718096] mb-10 text-[15px] leading-relaxed font-medium">
          You don't have permission to view this content. Let's get you back to your familiar spaces.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full bg-[#2d3748] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-[#1a202c] transition-colors shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
