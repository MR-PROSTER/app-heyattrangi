"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { format, formatDistanceToNow } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import UpgradeOffersBanner from "./UpgradeOffersBanner"
import { useRouter } from "next/navigation"
import { DEFAULT_AVATAR } from "@/lib/avatar"
import ProfileAvatar from "@/components/patient/ProfileAvatar"
import MoodCheckInModal from "./MoodCheckInModal"

const BreathingModule = dynamic(() => import("./BreathingModule"), {
  ssr: false,
  loading: () => null,
})

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default function CenterColumn({
  displayName,
  plan,
  upcomingAppointments,
  dailyTasks = [],
}: {
  displayName: string
  plan?: string
  upcomingAppointments: any[]
  dailyTasks?: any[]
}) {
  const router = useRouter()
  const normalizedPlan = plan || "FREE"
  const planLabelMap: Record<string, string> = {
    FREE: "Free",
    ESSENTIAL: "Essential",
    PREMIUM: "Premium",
    ORGANIZATION: "Organization",
  }

  const moodOptions = [
    { name: "Great", score: 5, emoji: "🤩" },
    { name: "Good", score: 4, emoji: "😊" },
    { name: "Happy", score: 5, emoji: "😄" },
    { name: "Calm", score: 4, emoji: "😌" },
    { name: "Neutral", score: 3, emoji: "😐" },
    { name: "Tired", score: 3, emoji: "🥱" },
    { name: "Sad", score: 2, emoji: "😔" },
    { name: "Anxious", score: 2, emoji: "😟" },
    { name: "Stressed", score: 1, emoji: "😵‍💫" },
    { name: "Angry", score: 1, emoji: "😠" },
  ]

  const [moodData, setMoodData] = useState<{
    happy: number
    calm: number
    sad: number
    score: number
    message: string
    lastUpdated?: string | null
  }>({
    happy: 30,
    calm: 40,
    sad: 30,
    score: 60,
    message: "Start journaling or chatting to track your mood.",
  })
  const [isLoadingMood, setIsLoadingMood] = useState(true)
  const [timeFilter, setTimeFilter] = useState("All")
  const [selectedMood, setSelectedMood] = useState<string>("Good")
  const [isBreathingOpen, setIsBreathingOpen] = useState(false)

  // Saved mood state
  const [checkedInMood, setCheckedInMood] = useState<{ score: number; note: string } | null>(null)
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false)
  const [modalInitialScore, setModalInitialScore] = useState<number>(2)
  const [modalInitialNote, setModalInitialNote] = useState<string>("")

  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split("T")[0]
      const saved = localStorage.getItem(`attrangi_mood_${todayStr}`)
      if (saved) {
        setCheckedInMood(JSON.parse(saved))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const handleOpenMoodModal = (initialScore: number) => {
    if (checkedInMood) {
      setModalInitialScore(checkedInMood.score)
      setModalInitialNote(checkedInMood.note)
    } else {
      setModalInitialScore(initialScore)
      setModalInitialNote("")
    }
    setIsMoodModalOpen(true)
  }

  const handleSubmitMood = (score: number, note: string) => {
    const todayStr = new Date().toISOString().split("T")[0]
    const val = { score, note }
    setCheckedInMood(val)
    localStorage.setItem(`attrangi_mood_${todayStr}`, JSON.stringify(val))
  }

  useEffect(() => {
    const controller = new AbortController()
    setIsLoadingMood(true)

    fetch(`/api/patient/analytics/mood?filter=${timeFilter}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (controller.signal.aborted) return
        if (data && typeof data.score === "number") {
          setMoodData(data)
        }
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingMood(false)
      })

    return () => controller.abort()
  }, [timeFilter])

  const c = 251.2
  const happyLen = (moodData.happy / 100) * c
  const calmLen = (moodData.calm / 100) * c
  const sadLen = (moodData.sad / 100) * c
  const calmOffset = -happyLen
  const sadOffset = -(happyLen + calmLen)

  const firstName = useMemo(
    () => displayName?.trim().split(/\s+/)[0] || "there",
    [displayName]
  )

  const quickActions = [
    {
      href: "/patient/ai-bot",
      title: "Talk to Attrangi",
      subtitle: "AI companion, anytime",
      accent: "from-orange-500 to-amber-500",
      bg: "bg-orange-50 border-orange-100",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: "/patient/library",
      title: "Explore wellness",
      subtitle: "Breathing, grounding & more",
      accent: "from-teal-500 to-emerald-500",
      bg: "bg-teal-50 border-teal-100",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    // Book a session — temporarily hidden
    // {
    //   href: "/patient/therapists",
    //   title: "Book a session",
    //   subtitle: "Verified therapists",
    //   accent: "from-sky-500 to-blue-600",
    //   bg: "bg-sky-50 border-sky-100",
    //   icon: (
    //     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    //       <rect x="3" y="4" width="18" height="18" rx="2" />
    //       <line x1="16" y1="2" x2="16" y2="6" />
    //       <line x1="8" y1="2" x2="8" y2="6" />
    //       <line x1="3" y1="10" x2="21" y2="10" />
    //     </svg>
    //   ),
    // },
    {
      href: "/patient/journal",
      title: "Journal",
      subtitle: "Clear your mind",
      accent: "from-amber-500 to-orange-600",
      bg: "bg-amber-50 border-amber-100",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="flex-1 h-full overflow-y-auto w-full relative bg-[#fff8f4] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Soft atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% -10%, rgba(251,146,60,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 0%, rgba(251,191,36,0.12), transparent 50%), linear-gradient(180deg, #fffaf6 0%, #fff8f4 40%, #fafdfc 100%)",
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 md:px-8 xl:px-12 pt-12 pb-8 sm:pb-10 md:pt-8 md:pb-12 max-w-6xl mx-auto w-full">
        {/* Hero */}
        <motion.header
          {...fadeUp}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 mb-8 sm:mb-10"
        >
          <div className="relative shrink-0">
            <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-br from-orange-200/50 to-amber-100/30 blur-md" aria-hidden />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] overflow-hidden bg-white shadow-[0_8px_30px_rgba(234,88,12,0.12)] border border-orange-100/80">
              <img
                src={DEFAULT_AVATAR}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-orange-600/80 mb-1.5">
              {getGreeting()} · {format(new Date(), "EEEE, MMM d")}
            </p>
            <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-black text-slate-900 tracking-tight leading-[1.15] mb-2">
              Hello, {firstName}
            </h1>
            <p className="text-slate-500 font-medium text-[14px] sm:text-[15px] leading-relaxed max-w-xl">
              I&apos;m here to listen and support you between sessions. Small
              check-ins can make a real difference.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white border border-orange-100 text-orange-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                {planLabelMap[normalizedPlan] ?? normalizedPlan.replace(/_/g, " ")}{" "}
                plan
              </span>
              <span className="text-[12px] font-semibold text-slate-400">
                Let&apos;s track your health daily
              </span>
            </div>
          </div>

          <ProfileAvatar
            name={displayName}
            className="absolute top-3 right-4 sm:static sm:ml-auto sm:mt-1"
          />
        </motion.header>

        {/* Quick actions — fills space after right-rail removal */}
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8"
          aria-label="Quick actions"
        >
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative overflow-hidden rounded-[20px] border ${action.bg} p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2`}
            >
              <div
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${action.accent} text-white shadow-md`}
              >
                {action.icon}
              </div>
              <h3 className="font-black text-[14px] sm:text-[15px] text-slate-900 tracking-tight mb-0.5 group-hover:text-orange-700 transition-colors">
                {action.title}
              </h3>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-snug">
                {action.subtitle}
              </p>
            </Link>
          ))}
        </motion.section>

        {normalizedPlan === "FREE" && (
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-8 w-full"
          >
            <UpgradeOffersBanner />
          </motion.div>
        )}

        {/* Upcoming sessions commented out per user request
        <motion.section
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="mb-8 w-full"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Upcoming sessions
            </h2>
            <Link
              href="/patient/appointments"
              className="text-[13px] font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              View more →
            </Link>
          </div>

          <div className="flex flex-row gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {upcomingAppointments && upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt, index) => {
                const aptTime = new Date(apt.appointmentDate).getTime()
                const now = new Date().getTime()
                const diffMinutes = (aptTime - now) / (1000 * 60)
                const isJoinable = diffMinutes <= 15
                const isBlurred = index >= 2

                return (
                  <div
                    key={apt.id || index}
                    className="min-w-[280px] sm:min-w-[340px] md:min-w-[420px] bg-white shadow-[0_4px_24px_rgba(15,23,42,0.04)] border border-slate-100 relative overflow-hidden group rounded-[22px] shrink-0 flex min-h-[230px]"
                  >
                    <div
                      className={`flex-1 p-4 flex flex-col relative z-10 ${
                        isBlurred ? "blur-[3px] opacity-40 pointer-events-none" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#22c55e] flex items-center justify-center text-white shrink-0">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="w-[8px] h-[8px]"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-[#16a34a] font-extrabold text-[9px] tracking-wide uppercase">
                          Confirmed
                        </span>
                      </div>

                      <h3 className="text-[17px] font-black text-slate-900 mb-0.5 tracking-tight leading-tight">
                        Session scheduled
                      </h3>

                      <div className="flex items-center gap-1 text-[#2563eb] mb-3">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-[12px] h-[12px] shrink-0"
                        >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <span className="font-bold text-[11px]">
                          {apt.meetLink ? "Online Video" : "In-Person"}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5 flex items-center gap-3 mb-3 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="w-3.5 h-3.5 text-orange-600"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-slate-900 font-extrabold leading-tight">
                            {format(new Date(apt.appointmentDate), "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] text-orange-600 font-bold">
                            {format(new Date(apt.appointmentDate), "h:mm a")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="w-3 h-3 text-orange-500"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          with{" "}
                          <span className="text-slate-900 font-extrabold">
                            {apt.doctor?.user?.name || "Doctor"}
                          </span>
                        </span>
                      </div>

                      <div className="mt-auto flex items-center gap-2">
                        {isJoinable && apt.meetLink ? (
                          <Link
                            href={apt.meetLink}
                            target="_blank"
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold text-[11px] hover:bg-orange-600 shadow-md transition-all"
                          >
                            Join Session
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-lg font-bold text-[11px] cursor-not-allowed"
                          >
                            Join Session
                          </button>
                        )}
                        <Link
                          href={`/patient/appointments/${apt.id}`}
                          className="px-4 py-2 border border-orange-100 text-orange-600 rounded-lg font-bold text-[11px] hover:bg-orange-50 transition-all"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                    <div
                      className={`w-[130px] relative hidden md:block shrink-0 ${
                        isBlurred ? "blur-[4px] opacity-30" : ""
                      }`}
                    >
                      <Image
                        src={
                          apt.doctor?.user?.image || "/images/promo_doctor.png"
                        }
                        alt={apt.doctor?.user?.name || "Doctor"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {isBlurred && (
                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[4px]">
                        <Link
                          href="/patient/appointments"
                          className="flex flex-col items-center gap-3"
                        >
                          <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-100">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#ea580c"
                              strokeWidth="3.5"
                              className="w-5 h-5"
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-black text-orange-600 tracking-tight uppercase">
                            View all
                          </span>
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="w-full rounded-[24px] border border-dashed border-orange-200/80 bg-gradient-to-br from-white to-orange-50/60 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="w-16 h-16 rounded-[20px] bg-orange-100 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-8 h-8 text-orange-500"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h3 className="font-black text-[17px] text-slate-900 mb-1">
                    No sessions on the calendar yet
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-4 max-w-md">
                    When you&apos;re ready, book a verified therapist. You can
                    also talk to Attrangi anytime between sessions.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <Link
                      href="/patient/therapists"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 text-white text-[13px] font-bold hover:bg-orange-600 shadow-[0_8px_20px_rgba(249,115,22,0.25)] transition-all"
                    >
                      Find a therapist
                    </Link>
                    <Link
                      href="/patient/ai-bot"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-orange-100 text-orange-700 text-[13px] font-bold hover:bg-orange-50 transition-all"
                    >
                      Chat with Attrangi
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>
        */}

        {/* Mood + reflection grid */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 w-full"
        >
          {/* Left Column: Image 1 cards */}
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Card 1: Emojis check-in */}
            <div
              onClick={() => handleOpenMoodModal(2)}
              className="bg-white rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 shadow-[0_4px_28px_rgba(15,23,42,0.04)] border border-slate-100/90 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-shadow group"
            >
              <span className="font-extrabold text-[17px] sm:text-[18px] text-slate-800 tracking-tight leading-snug max-w-[150px] sm:max-w-none group-hover:text-slate-900 transition-colors">
                {checkedInMood ? (
                  checkedInMood.score === 0 ? "You're feeling sad today." :
                  checkedInMood.score === 1 ? "Today's a bit tough." :
                  checkedInMood.score === 2 ? "You're feeling okay today." :
                  checkedInMood.score === 3 ? "You're feeling Good today!" :
                  "You're feeling Happy today!"
                ) : (
                  "How’s today, so far?"
                )}
              </span>
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                {[
                  { name: "Stressed", emoji: "https://res.cloudinary.com/dbjv95prc/image/upload/v1786189447/emoji-target-4_qrmjbc.png", score: 1 },
                  { name: "Reflective", emoji: "https://res.cloudinary.com/dbjv95prc/image/upload/v1786189506/emoji-target-2_bxmloe.png", score: 2 },
                  { name: "Safety", emoji: "https://res.cloudinary.com/dbjv95prc/image/upload/v1786189540/emoji-target-3_hoyche.png", score: 3 },
                ].map((mood) => {
                  const isSelected = checkedInMood && checkedInMood.score === mood.score
                  const isAnySelected = checkedInMood !== null
                  return (
                    <button
                      key={mood.name}
                      type="button"
                      onClick={() => handleOpenMoodModal(mood.score)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden active:scale-95 transition-all shadow-sm shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
                        isAnySelected
                          ? isSelected
                            ? "scale-110 ring-2 ring-orange-500 shadow-md opacity-100"
                            : "opacity-25 scale-90"
                          : "hover:scale-105 opacity-100"
                      }`}
                      title={`Feel ${mood.name}`}
                    >
                      <Image
                        src={mood.emoji}
                        alt={mood.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 2: Location Notification */}
            <div className="bg-[#EBF2E5] rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 border border-[#DCE4D5] shadow-[0_4px_28px_rgba(15,23,42,0.02)] flex items-center justify-between gap-4 min-h-[170px]">
              <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                <div>
                  <h4 className="font-extrabold text-[17px] text-[#1A1A1A] leading-snug">
                    Notification
                  </h4>
                  <p className="text-[13px] text-[#555555] font-semibold leading-relaxed mt-1 max-w-[220px]">
                    Turn on location service to discover campsites closest to you
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Location services enabled (demo)")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4C6A3C] text-white text-[13px] font-bold hover:bg-[#3F5931] shadow-[0_4px_12px_rgba(76,106,60,0.2)] transition-all w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="w-4 h-4"
                  >
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Turn on location</span>
                </button>
              </div>

              {/* Campsite Map Illustration on the Right */}
              <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#9AD1D4] border border-[#85BAC0] shadow-inner flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 120" className="w-[84px] h-[100px] select-none pointer-events-none">
                  {/* Phone shell */}
                  <rect x="18" y="10" width="64" height="100" rx="12" fill="#FFFFFF" stroke="#2D3A37" strokeWidth="3" />
                  {/* Notch */}
                  <rect x="42" y="10" width="16" height="5" rx="2" fill="#2D3A37" />
                  {/* Map path (dotted line) */}
                  <path d="M 30,90 Q 40,55 58,50 T 62,25" fill="none" stroke="#E07A5F" strokeWidth="4" strokeLinecap="round" strokeDasharray="6 5" />
                  {/* Campsite tent */}
                  <polygon points="44,52 64,52 54,34" fill="#E07A5F" />
                  <polygon points="54,52 64,52 54,34" fill="#C35F44" />
                  {/* Start point circle */}
                  <circle cx="30" cy="90" r="6" fill="#4C6A3C" stroke="#FFFFFF" strokeWidth="1.5" />
                  {/* Pin mark */}
                  <path d="M 54,34 L 54,20" stroke="#2D3A37" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Recommendation header */}
            <div className="flex items-center justify-between gap-4 mt-2">
              <h3 className="font-extrabold text-[22px] text-slate-800 tracking-tight leading-none">
                Recommendation
              </h3>
              <Link
                href="/patient/library"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-[#222222] text-white text-[13px] font-bold rounded-full hover:bg-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <span>Explore</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-3.5 h-3.5"
                >
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                  <line x1="9" y1="3" x2="9" y2="18" />
                  <line x1="15" y1="6" x2="15" y2="21" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Journal + quote */}
          <div className="flex flex-col gap-5">
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-[28px] p-6 sm:p-7 shadow-[0_4px_28px_rgba(15,23,42,0.04)] border border-orange-100/70 flex flex-col flex-1 min-h-[260px] relative overflow-hidden group">
              <div
                className="absolute right-0 top-0 w-40 h-40 bg-orange-200/25 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"
                aria-hidden
              />
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-orange-50 flex items-center justify-center text-orange-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <span className="bg-white/70 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Daily reflection
                </span>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="font-black text-[20px] sm:text-[22px] text-slate-900 mb-1.5 tracking-tight">
                  Start today&apos;s journal
                </h3>
                <p className="text-[12px] font-bold text-orange-600/80 mb-3 uppercase tracking-wide">
                  {format(new Date(), "EEEE, do MMMM yyyy")}
                </p>
                <p className="text-slate-500 font-medium text-[14px] leading-relaxed max-w-[92%]">
                  Write freely — a few lines is enough. Clear space for what
                  you&apos;re carrying today.
                </p>
              </div>

              <div className="mt-auto flex justify-end relative z-10 pt-4">
                <Link
                  href="/patient/journal"
                  className="px-7 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-[13px] rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:-translate-y-0.5"
                >
                  Open journal
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[24px] p-6 sm:p-7 border border-orange-100/60 relative overflow-hidden">
              <svg
                className="absolute top-2 left-3 w-14 h-14 text-orange-200/70"
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <p className="text-orange-900/85 font-bold text-[15px] sm:text-[16px] text-center leading-relaxed italic relative z-10 px-4 py-1">
                &ldquo;Your feelings are valid, and brighter days can begin with
                one small step.&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <BreathingModule
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <MoodCheckInModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        initialScore={modalInitialScore}
        initialNote={modalInitialNote}
        onSubmit={handleSubmitMood}
      />
    </div>
  )
}
