import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { ChevronLeft, ChevronRight, Settings, Trophy, Smile, Edit3, Bell } from "lucide-react"
import UnlockFeaturesCard from "@/components/premium/UnlockFeaturesCard"
import AvatarUpload from "@/components/profile/AvatarUpload"

async function ProfileContent() {
    const user = await getCurrentUser()

    if (!user || user.role !== "PATIENT") {
        redirect("/auth/unauthorized")
    }

    const displayName = (user.name || user.email || "Individual User").trim()
    const streakDays = user.patient?.currentStreak ?? 0

    return (
        <main className="flex h-full min-h-screen w-full flex-col overflow-x-hidden font-sans" style={{ backgroundColor: "#ffffff" }}>
            <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col min-w-0 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] gap-6" style={{ backgroundColor: "#ffffff" }}>
                
                {/* Header */}
                <header className="flex items-center justify-between py-4 select-none">
                  <Link href="/patient/dashboard" className="text-slate-800 hover:opacity-80 transition-opacity">
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </Link>
                  
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profile</h1>
                  
                  <Link href="/dashboard/settings" className="text-slate-800 hover:opacity-80 transition-opacity">
                    <Settings className="w-6 h-6" />
                  </Link>
                </header>

                {/* Avatar & Details Section */}
                <div className="flex flex-col items-center pt-2 select-none">
                  {/* Avatar Upload */}
                  <AvatarUpload initialImage={user.image} displayName={displayName} />
                  
                  {/* Name */}
                  <h2 className="mt-4 text-xl font-bold text-slate-800 tracking-tight text-center">
                    {displayName}
                  </h2>
                  
                  {/* Email & Checkmark */}
                  <div className="mt-1 flex items-center gap-1.5 justify-center">
                    <span className="text-sm font-medium text-slate-500">{user.email || "—"}</span>
                    {user.email && (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-sm">
                        <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card 1 (Stats Card) */}
                <div className="w-full rounded-[28px] border border-slate-100 p-4 sm:p-5 flex flex-row items-center justify-between text-center select-none shadow-[0_4px_20px_rgba(0,0,0,0.01)] mt-2" style={{ backgroundColor: "#FFF9F6" }}>
                  {/* Active Days */}
                  <div className="flex-1 flex flex-col items-center">
                    <Trophy className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
                    <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                      {streakDays || 8}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
                      Active days
                    </span>
                  </div>

                  <div className="h-10 border-r border-slate-100" />

                  {/* Mood check-ins */}
                  <div className="flex-1 flex flex-col items-center">
                    <Smile className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
                    <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                      {streakDays ? streakDays + 2 : 6}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
                      Mood check-ins
                    </span>
                  </div>

                  <div className="h-10 border-r border-slate-100" />

                  {/* Reflections */}
                  <div className="flex-1 flex flex-col items-center">
                    <Edit3 className="w-5 h-5 text-[#3B82F6] stroke-[2]" />
                    <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                      {streakDays ? Math.max(1, Math.floor(streakDays / 3)) : 2}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-bold mt-0.5">
                      Reflections
                    </span>
                  </div>
                </div>

                <UnlockFeaturesCard />

                {/* Card 3 (Founder Card) */}
                <Link href="/dashboard/founder-message" className="w-full mt-auto block">
                  <div className="w-full bg-white rounded-[24px] p-4 flex items-center gap-4 border border-slate-100 hover:border-slate-200 transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.015)] cursor-pointer select-none">
                    <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0 shadow-sm border border-orange-100/30">
                      <Bell className="w-5 h-5 fill-current" />
                    </div>
                    <span className="text-[12px] font-black tracking-wide text-slate-800 font-sans">
                      A MESSAGE FROM OUR FOUNDER
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto stroke-[2.5]" />
                  </div>
                </Link>

            </div>
        </main>
    )
}

export default function DashboardProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex-1 h-full flex items-center justify-center bg-white min-h-screen animate-pulse">
                <div className="text-gray-400 font-medium">Loading profile...</div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    )
}
