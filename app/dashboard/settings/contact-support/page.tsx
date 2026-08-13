"use client"
 
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
 
export default function ContactSupportPage() {
  const router = useRouter()
 
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/dashboard/settings")
    }
  }
 
  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col justify-between px-4 min-[360px]:px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      {/* Header Area */}
      <header className="flex items-center justify-between w-full max-w-[430px] mx-auto py-2.5 shrink-0">
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white border border-[#EDE6DF] flex items-center justify-center text-zinc-700 shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
 
        <div className="flex flex-col items-center justify-center text-center px-2">
          <span className="text-[9px] min-[360px]:text-[10px] font-extrabold tracking-widest text-zinc-450 uppercase leading-none">A Message From</span>
          <span className="text-[12px] min-[360px]:text-[13px] font-black tracking-widest text-zinc-800 uppercase mt-1 leading-none">Our Founder</span>
        </div>
 
        <a
          href="mailto:support@heyattrangi.com?subject=Message for Sandesh"
          aria-label="Email support"
          className="w-10 h-10 rounded-xl bg-[#F0EAE3] border border-[#EDE6DF] flex items-center justify-center text-zinc-500 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Mail className="w-5 h-5" />
        </a>
      </header>
 
      {/* Message Card Content */}
      <main className="flex-1 w-full max-w-[430px] mx-auto flex flex-col justify-center py-4">
        <div className="bg-white rounded-[32px] border border-[#EDE6DF]/80 p-[clamp(20px,6vw,40px)] shadow-[0_2px_18px_-6px_rgba(0,0,0,0.03)] flex flex-col gap-5 min-[360px]:gap-6 w-full">
          <p className="text-[clamp(17px,5.2vw,22px)] font-black text-zinc-900 leading-snug tracking-tight">
            Hi, I'm Sandesh — I started Attrangi, and I still read everything that comes through here myself.
          </p>
 
          <p className="text-[clamp(13px,3.8vw,14.5px)] font-semibold text-zinc-500 leading-relaxed">
            If something felt confusing, or just didn't sit right while using Attrangi, I'd like to know. Not because we need to hear nice things — because we're building this for people who are already carrying a lot, and getting the small things right matters more here than it does for most apps.
          </p>
 
          <p className="text-[clamp(13px,3.8vw,14.5px)] font-semibold text-zinc-500 leading-relaxed">
            If you need support right now, this isn't the fastest way to reach someone — use the crisis option in the app instead. For everything else, take your time. I read every word.
          </p>
 
          <div className="border-t border-[#EDE6DF]/60 my-1" />
 
          <div className="space-y-1">
            <p className="text-[clamp(13px,3.8vw,14.5px)] font-semibold text-zinc-500">— Sandesh</p>
            <p className="text-[clamp(13px,3.8vw,14.5px)] font-black text-zinc-900">Founder, Attrangi</p>
          </div>
        </div>
      </main>
 
      {/* Action CTA Button */}
      <div className="w-full max-w-[430px] mx-auto mt-2 shrink-0">
        <Link
          href="/dashboard/settings/contact-support/write"
          className="flex items-center justify-center w-full bg-[#E8722A] hover:bg-[#C05C1A] text-white font-black text-[clamp(14px,4vw,16px)] py-4 rounded-3xl shadow-md active:scale-[0.98] transition-all text-center cursor-pointer select-none"
        >
          Write to Sandesh
        </Link>
      </div>
    </div>
  )
}
