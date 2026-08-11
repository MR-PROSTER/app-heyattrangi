"use client"

import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { format, formatDistanceToNow } from "date-fns"
import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import UpgradeOffersBanner from "./UpgradeOffersBanner"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import TryPragyaChat from "@/components/ai-bot/TryPragyaChat"
import { DEFAULT_AVATAR } from "@/lib/avatar"
import ProfileAvatar from "@/components/patient/ProfileAvatar"
import MoodCheckInModal from "./MoodCheckInModal"
import { EXPLORE_ACTIVITIES } from "@/data/exploreActivities"
import { READ_ARTICLES } from "@/data/readArticles"
import { LISTEN_TRACKS } from "@/data/listenContent"
import { CLINICAL_ASSESSMENTS } from "@/data/clinicalAssessments"

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

function renderEmojiFace(name: string, isSelected: boolean) {
  const getImagePath = () => {
    switch (name) {
      case "Low":
        return "/images/moods/low.png"
      case "Heavy":
        return "/images/moods/heavy.png"
      case "Okay":
        return "/images/moods/okay.png"
      case "Good":
        return "/images/moods/good.png"
      case "Bright":
        return "/images/moods/bright.png"
      default:
        return "/images/moods/okay.png"
    }
  }

  const imagePath = getImagePath()
  
  return (
    <div 
      className={`w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 flex items-center justify-center transition-transform duration-200 ${
        isSelected ? "scale-110 rounded-xl min-[390px]:rounded-2xl shadow-md" : "hover:scale-105"
      }`}
    >
      <Image 
        src={imagePath} 
        alt={name} 
        width={48} 
        height={48} 
        className="w-full h-full object-contain rounded-xl min-[390px]:rounded-2xl"
      />
    </div>
  )
}

export default function CenterColumn({
  displayName,
  plan,
  upcomingAppointments,
  dailyTasks = [],
  userImage,
}: {
  displayName: string
  plan?: string
  upcomingAppointments: any[]
  dailyTasks?: any[]
  userImage?: string | null
}) {
  const router = useRouter()
  const { data: session } = useSession()
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
  const [mindText, setMindText] = useState("")
  const [suggestions, setSuggestions] = useState<{
    activity: any
    read: any
    listen: any
    assessment: any
  } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<"activity" | "read" | "listen" | "assessment" | null>(null)
  const [isChatExpanded, setIsChatExpanded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const randomActivity = EXPLORE_ACTIVITIES[Math.floor(Math.random() * EXPLORE_ACTIVITIES.length)]
      const randomRead = READ_ARTICLES[Math.floor(Math.random() * READ_ARTICLES.length)]
      const randomListen = LISTEN_TRACKS[Math.floor(Math.random() * LISTEN_TRACKS.length)]
      const randomAssessment = CLINICAL_ASSESSMENTS[Math.floor(Math.random() * CLINICAL_ASSESSMENTS.length)]
      
      setSuggestions({
        activity: randomActivity,
        read: randomRead,
        listen: randomListen,
        assessment: randomAssessment,
      })

      const categories: Array<"activity" | "read" | "listen" | "assessment"> = [
        "activity",
        "read",
        "listen",
        "assessment",
      ]
      const lastCategory = localStorage.getItem("attrangi_last_category")
      const availableCategories = lastCategory
        ? categories.filter((cat) => cat !== lastCategory)
        : categories
      const chosenCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)]
      setSelectedCategory(chosenCategory)
      localStorage.setItem("attrangi_last_category", chosenCategory)
    }
  }, [])

  const handleMindSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsChatExpanded(true)
  }

  const handleActivityClick = (activity: any) => {
    if (activity && activity.slug === "breathing") {
      setIsBreathingOpen(true)
    } else if (activity) {
      router.push(`/explore/activities/${activity.slug}`)
    } else {
      router.push("/patient/library?mode=activities")
    }
  }

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
    setModalInitialScore(initialScore)
    if (checkedInMood && checkedInMood.score === initialScore) {
      setModalInitialNote(checkedInMood.note)
    } else {
      setModalInitialNote("")
    }
    setIsMoodModalOpen(true)
  }

  const handleSubmitMood = async (score: number, note: string) => {
    const todayStr = new Date().toISOString().split("T")[0]
    const val = { score, note }

    // Map score to mood name for the API
    const moodMap: Record<number, string> = {
      0: "SAD",
      1: "BAD",
      2: "NOT BAD",
      3: "GOOD",
      4: "HAPPY",
    }
    const moodName = moodMap[score] || "Neutral"

    try {
      await fetch("/api/patient/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: moodName,
          mood_score: score,
          note,
        }),
      })
    } catch (err) {
      console.error("Failed to log mood check-in:", err)
    }

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
    },
  ]

  const desktopCalendarDays = [
    { type: "text", value: "1", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "2", bg: "#EBF0F2", color: "#64748B" },
    { type: "emoji", bg: "#FFE5C4", color: "#D97706" },
    { type: "text", value: "4", bg: "#EBF0F2", color: "#64748B" },
    { type: "wave", bg: "#C6F2D5", color: "#16A34A" },
    { type: "text", value: "6", bg: "#EBF0F2", color: "#64748B" },
    { type: "exercise", bg: "#FDD3D3", color: "#DC2626" },

    { type: "text", value: "8", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "9", bg: "#EBF0F2", color: "#64748B" },
    { type: "close", bg: "#D5CEEB", color: "#6B4FBB" },
    { type: "text", value: "11", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "12", bg: "#EBF0F2", color: "#64748B" },
    { type: "emoji", bg: "#FFE5C4", color: "#D97706" },
    { type: "text", value: "14", bg: "#EBF0F2", color: "#64748B" },

    { type: "text", value: "15", bg: "#EBF0F2", color: "#64748B" },
    { type: "wave", bg: "#C6F2D5", color: "#16A34A" },
    { type: "text", value: "17", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "18", bg: "#EBF0F2", color: "#64748B" },
    { type: "exercise", bg: "#FDD3D3", color: "#DC2626" },
    { type: "text", value: "20", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "21", bg: "#EBF0F2", color: "#64748B" },

    { type: "emoji", bg: "#FFE5C4", color: "#D97706" },
    { type: "text", value: "23", bg: "#EBF0F2", color: "#64748B" },
    { type: "text", value: "24", bg: "#EBF0F2", color: "#64748B" },
    { type: "close", bg: "#D5CEEB", color: "#6B4FBB" },
    { type: "text", value: "26", bg: "#EBF0F2", color: "#64748B" },
    { type: "wave", bg: "#C6F2D5", color: "#16A34A" },
    { type: "text", value: "28", bg: "#EBF0F2", color: "#64748B" },
  ]

  const renderCalendarCircle = (item: any, isMobile: boolean = false) => {
    const isText = item.type === "text"
    const circleStyle = (isText && isMobile)
      ? { borderColor: "#64748B", color: "#64748B", backgroundColor: "#ffffff" }
      : { backgroundColor: item.bg, color: item.color }

    const sizeClass = isMobile ? "w-6 h-6" : "w-7 h-7"
    const borderClass = (isText && isMobile) ? "border border-[#64748B]" : ""

    const handleClick = () => {
      if (item.type === "emoji") {
        handleOpenMoodModal(3)
      } else if (item.type === "wave") {
        setIsBreathingOpen(true)
      } else if (item.type === "exercise") {
        router.push("/explore/activities/progressive-muscle-relaxation")
      } else if (item.type === "close") {
        handleOpenMoodModal(2)
      }
    }

    return (
      <button 
        type="button"
        onClick={handleClick}
        style={circleStyle}
        className={`${sizeClass} rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm shrink-0 cursor-pointer focus-visible:outline-none ${borderClass}`}
      >
        {item.type === "text" && (
          <span className={`${isMobile ? "text-[10px]" : "text-[11px]"} font-bold leading-none`}>
            {item.value}
          </span>
        )}
        {item.type === "emoji" && (
          <svg className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="8" y1="14" x2="16" y2="14" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        )}
        {item.type === "wave" && (
          <svg className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M5 8c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 5 0" />
            <path d="M5 12c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 5 0" />
            <path d="M5 16c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 5 0" />
          </svg>
        )}
        {item.type === "exercise" && (
          <svg className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="6.5" y1="6.5" x2="17.5" y2="17.5" />
            <line x1="5" y1="9" x2="9" y2="5" />
            <line x1="15" y1="19" x2="19" y2="15" />
            <line x1="3.5" y1="7.5" x2="7.5" y2="3.5" />
            <line x1="16.5" y1="20.5" x2="20.5" y2="16.5" />
          </svg>
        )}
        {item.type === "close" && (
          <svg className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <circle cx="12" cy="12" r="8" />
            <line x1="9" y1="9" x2="15" y2="15" />
            <line x1="15" y1="9" x2="9" y2="15" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="flex-1 h-full w-full bg-[#FAF8F5] relative overflow-hidden">
      <AnimatePresence>
        {!isChatExpanded && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-28 md:pb-16"
          >
            {/* Phone container style on desktop, wider on larger screens */}
      <div className="w-full max-w-[480px] md:max-w-[1200px] mx-auto min-h-full flex flex-col bg-[#FAF8F5] relative px-0 md:px-6 md:py-8">
        
        {/* MOBILE VIEW (block md:hidden) */}
        <div className="block md:hidden w-full flex flex-col">
          {/* Blue Rounded Header Area */}
          <div className="w-full px-4 min-[360px]:px-5 min-[390px]:px-6 pt-[72px] min-[360px]:pt-[76px] min-[390px]:pt-20 pb-9 min-[360px]:pb-11 min-[390px]:pb-14 flex flex-col gap-4 min-[360px]:gap-5 min-[390px]:gap-6 relative">
            {/* Background & Robot Wrapper (Clipped by rounded bottom) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#8BDDEE] via-[#A6E8F6] to-[#D7F5FC] rounded-b-[32px] min-[360px]:rounded-b-[38px] min-[390px]:rounded-b-[42px] overflow-hidden pointer-events-none shadow-[0_8px_30px_rgba(139,221,238,0.12)]">
              {/* Peeking Robot Image */}
              <div className="absolute left-0 bottom-[32px] min-[360px]:bottom-8 min-[390px]:bottom-10 w-[55px] min-[360px]:w-[80px] min-[390px]:w-[95px] h-[78px] min-[360px]:h-[113px] min-[390px]:h-[135px] pointer-events-none">
                <Image
                  src="/images/robot_peeking.png"
                  alt="Peeking Robot"
                  fill
                  className="object-contain object-left-bottom"
                />
              </div>
            </div>

            {/* Header Row: Title & Avatar */}
            <div className="flex items-center justify-between w-full z-10 relative gap-2 min-[360px]:gap-3">
              <div className="flex flex-col pl-1 min-[360px]:pl-2.5 min-[390px]:pl-4 min-w-0 flex-1">
                <h1 className="text-[19px] min-[360px]:text-[24px] min-[390px]:text-[28px] font-black text-white tracking-tight leading-none whitespace-nowrap truncate">
                  Hello, {firstName}
                </h1>
              </div>
              <div className="shrink-0">
                <ProfileAvatar
                  name={displayName}
                  image={userImage}
                  className="w-[34px] h-[34px] min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-11 min-[390px]:h-11 border-2 border-white/80 shadow-sm"
                />
              </div>
            </div>

            {/* Spacing to push down the form */}
            <div className="h-1 min-[360px]:h-2.5 min-[390px]:h-4" />

            {/* Voice Input Chat Bar (overlapping bottom edge) */}
            <form onSubmit={handleMindSubmit} className="w-full bg-white rounded-full p-1 min-[390px]:p-1.5 pl-3.5 min-[360px]:pl-4 min-[390px]:pl-5 pr-1 min-[390px]:pr-1.5 shadow-[0_12px_24px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2 min-[360px]:gap-3 border border-white z-10 relative translate-y-9">
              <input
                type="text"
                value={mindText}
                onChange={(e) => setMindText(e.target.value)}
                onFocus={() => setIsChatExpanded(true)}
                placeholder="Tell me what's on your mind..."
                className="flex-1 bg-transparent border-none text-[11.5px] min-[360px]:text-[13px] min-[390px]:text-[14px] font-medium placeholder-slate-400 text-slate-700 focus:outline-none min-w-0"
              />
              <button
                type="submit"
                className="bg-[#F99254] hover:bg-[#E87E3E] text-white px-2.5 py-1.5 min-[360px]:px-4 min-[360px]:py-2.5 min-[390px]:px-5 rounded-full font-bold text-[10px] min-[360px]:text-[12px] min-[390px]:text-[13px] flex items-center gap-1 min-[360px]:gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <svg className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                  <line x1="7" y1="10" x2="7" y2="14" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <line x1="17" y1="10" x2="17" y2="14" />
                </svg>
                <span>Speak</span>
              </button>
            </form>
          </div>
          {/* Compensation spacing for the overlap */}
          <div className="h-6 min-[360px]:h-7 min-[390px]:h-8" />

          {/* Body content cards grid */}
          <div className="flex-1 px-3.5 min-[360px]:px-4 min-[390px]:px-5 pt-4 min-[360px]:pt-5 min-[390px]:pt-6 pb-8 min-[390px]:pb-12 flex flex-col gap-4 min-[360px]:gap-4.5 min-[390px]:gap-5">
            
            {/* Card 1: How's today, so far? */}
            <div className="bg-white rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)]">
              <h4 className="text-slate-800 text-[13.5px] min-[360px]:text-[14.5px] min-[390px]:text-[15px] font-extrabold mb-2.5 min-[360px]:mb-3 min-[390px]:mb-4 tracking-tight">How&apos;s today, so far?</h4>
              <div className="grid grid-cols-5 justify-items-center w-full gap-1 px-0.5">
                {[
                  { name: "Low", displayName: "Sad", score: 0 },
                  { name: "Heavy", displayName: "Bad", score: 1 },
                  { name: "Okay", displayName: "Not Bad", score: 2 },
                  { name: "Good", displayName: "Good", score: 3 },
                  { name: "Bright", displayName: "Happy", score: 4 },
                ].map((mood) => {
                  const isSelected = checkedInMood && checkedInMood.score === mood.score
                  return (
                    <button
                      key={mood.name}
                      type="button"
                      onClick={() => handleOpenMoodModal(mood.score)}
                      className="flex flex-col items-center focus-visible:outline-none transition-transform hover:scale-105"
                    >
                      {renderEmojiFace(mood.name, !!isSelected)}
                      <span className="text-[9.5px] min-[360px]:text-[10px] min-[390px]:text-[11px] font-bold mt-1.5 min-[390px]:mt-2 text-slate-400 whitespace-nowrap">{mood.displayName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 2: Your rhythm this week */}
            <div className="bg-white rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)]">
              <div className="grid grid-cols-7 justify-items-center w-full gap-1.5 px-0.5">
                {[
                  { day: "M", type: "text", value: "13", bg: "#EBF0F2", color: "#64748B" },
                  { day: "T", type: "text", value: "14", bg: "#EBF0F2", color: "#64748B" },
                  { day: "W", type: "emoji", bg: "#FFE5C4", color: "#D97706" },
                  { day: "T", type: "wave", bg: "#C6F2D5", color: "#16A34A" },
                  { day: "F", type: "text", value: "17", bg: "#EBF0F2", color: "#64748B" },
                  { day: "S", type: "exercise", bg: "#FDD3D3", color: "#DC2626" },
                  { day: "S", type: "close", bg: "#D5CEEB", color: "#6B4FBB" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-1.5 min-[360px]:gap-2">
                    {renderCalendarCircle(item, true)}
                    <span className="text-[9.5px] min-[360px]:text-[10px] min-[390px]:text-[11px] font-bold text-slate-400 uppercase">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Something I Noticed */}
            <div className="bg-[#FEF6F0] rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-4 min-[360px]:p-5 min-[390px]:p-6 border border-[#FBE6D8] shadow-[0_4px_24px_rgba(15,23,42,0.01)] flex flex-col gap-1.5 min-[360px]:gap-2">
              <span className="text-[10px] min-[360px]:text-[11px] min-[390px]:text-[11.5px] font-black uppercase tracking-[0.15em] text-[#E8722A]">
                Something I Noticed
              </span>
              <p className="text-[13.5px] min-[360px]:text-[14.5px] min-[390px]:text-[15px] font-medium text-slate-700 leading-relaxed">
                You&apos;ve mentioned exam stress a few times lately. If it helps, we can unpack what&apos;s weighing heaviest before it builds up.
              </p>
            </div>

            {/* What you can do now Section */}
            <div className="flex flex-col gap-3 min-[360px]:gap-3.5 min-[390px]:gap-4 mt-1 min-[360px]:mt-1.5 min-[390px]:mt-2">
              <h3 className="text-[16px] min-[360px]:text-[18px] min-[390px]:text-[19px] font-black text-slate-800 tracking-tight leading-none mb-0.5 min-[360px]:mb-1">
               What you can do now
              </h3>
              
              {suggestions && selectedCategory && (
                <div className="flex flex-col gap-3 min-[360px]:gap-3.5 min-[390px]:gap-4">
                  {/* Card 1: Activity */}
                  {selectedCategory === "activity" && (
                    <div 
                      onClick={() => handleActivityClick(suggestions.activity)}
                      className="bg-[#F0ECF8] rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-3.5 min-[360px]:p-4 min-[390px]:p-5 border border-[#E3DCF1] flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-[390px]:gap-4 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 text-[#6B4FBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-extrabold text-[14px] min-[390px]:text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                            {suggestions.activity.title}
                          </span>
                          <span className="text-[11.5px] min-[390px]:text-[12px] font-medium text-slate-500 leading-snug mt-0.5 min-[390px]:mt-1 line-clamp-2">
                            {suggestions.activity.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#6B4FBB] text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] font-bold shrink-0 pr-1">
                        <span>Try</span>
                        <svg className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Read */}
                  {selectedCategory === "read" && (
                    <Link 
                      href={`/read/${suggestions.read.slug}`}
                      className="bg-[#E6F4F8] rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-3.5 min-[360px]:p-4 min-[390px]:p-5 border border-[#CDE5EE] flex items-center justify-between hover:scale-[1.01] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-[390px]:gap-4 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 text-[#00829B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-extrabold text-[14px] min-[390px]:text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                            {suggestions.read.title}
                          </span>
                          <span className="text-[11.5px] min-[390px]:text-[12px] font-medium text-slate-500 leading-snug mt-0.5 min-[390px]:mt-1 line-clamp-2">
                            {suggestions.read.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#00829B] text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] font-bold shrink-0 pr-1">
                        <span>Read</span>
                        <svg className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )}

                  {/* Card 3: Listen */}
                  {selectedCategory === "listen" && (
                    <Link 
                      href={`/listen/${suggestions.listen.slug}`}
                      className="bg-[#EAF6EC] rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-3.5 min-[360px]:p-4 min-[390px]:p-5 border border-[#D2EBD7] flex items-center justify-between hover:scale-[1.01] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-[390px]:gap-4 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 text-[#1E8A37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-extrabold text-[14px] min-[390px]:text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                            {suggestions.listen.title}
                          </span>
                          <span className="text-[11.5px] min-[390px]:text-[12px] font-medium text-slate-500 leading-snug mt-0.5 min-[390px]:mt-1 line-clamp-2">
                            {suggestions.listen.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#1E8A37] text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] font-bold shrink-0 pr-1">
                        <span>Listen</span>
                        <svg className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )}

                  {/* Card 4: Assessment */}
                  {selectedCategory === "assessment" && (
                    <Link 
                      href={suggestions.assessment.href}
                      className="bg-[#FEF5ED] rounded-[24px] min-[360px]:rounded-[28px] min-[390px]:rounded-[32px] p-3.5 min-[360px]:p-4 min-[390px]:p-5 border border-[#FCE3CF] flex items-center justify-between hover:scale-[1.01] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-[390px]:gap-4 min-w-0 flex-1 pr-3">
                        <div className="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                          <svg className="w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-extrabold text-[14px] min-[390px]:text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                            {suggestions.assessment.title}
                          </span>
                          <span className="text-[11.5px] min-[390px]:text-[12px] font-medium text-slate-500 leading-snug mt-0.5 min-[390px]:mt-1 line-clamp-2">
                            {suggestions.assessment.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#D97736] text-[11px] min-[360px]:text-[12px] min-[390px]:text-[13px] font-bold shrink-0 pr-1">
                        <span>Check</span>
                        <svg className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* DESKTOP VIEW (hidden md:flex flex-col gap-6) */}
        <div className="hidden md:flex flex-col gap-6 w-full pb-16">
          {/* Blue Rounded Header Area (Desktop) */}
          <motion.div 
            style={{ borderRadius: 42 }}
            className="w-full bg-gradient-to-b from-[#8BDDEE] via-[#A6E8F6] to-[#D7F5FC] p-8 flex flex-col gap-6 shadow-[0_8px_30px_rgba(139,221,238,0.12)]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <motion.h1 
                  className="text-[36px] font-black text-white tracking-tight leading-none"
                >
                  Hello, {firstName}
                </motion.h1>
                <span className="text-[#00829B] text-[16px] font-semibold mt-4">
                  Wanna talk about the conversation that we left ??
                </span>
              </div>
              <motion.div 
                className="shrink-0"
              >
                <ProfileAvatar
                  name={displayName}
                  image={userImage}
                  className="w-14 h-14 border-2 border-white/80 shadow-sm"
                />
              </motion.div>
            </div>

            {/* Voice Input Chat Bar (Desktop) */}
            <motion.form 
              whileTap={{ scale: 0.96 }}
              onSubmit={handleMindSubmit} 
              className="w-full bg-white rounded-full p-2.5 pl-6 pr-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 border border-white"
            >
              <input
                type="text"
                value={mindText}
                onChange={(e) => setMindText(e.target.value)}
                onFocus={() => setIsChatExpanded(true)}
                placeholder="Tell me what's on your mind..."
                className="flex-1 bg-transparent border-none text-[15px] font-medium placeholder-slate-400 text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#F99254] hover:bg-[#E87E3E] text-white px-6 py-3 rounded-full font-bold text-[14px] flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                  <line x1="7" y1="10" x2="7" y2="14" />
                  <line x1="12" y1="6" x2="12" y2="18" />
                  <line x1="17" y1="10" x2="17" y2="14" />
                </svg>
                <span>Speak</span>
              </button>
            </motion.form>
          </motion.div>

          {/* Grid Layout (Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: How's today, so far? */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)] flex flex-col justify-between h-[230px]">
              <div>
                <h4 className="text-slate-800 text-[16px] font-extrabold tracking-tight">How&apos;s today, so far?</h4>
                <p className="text-[13px] font-medium text-slate-500 mt-2 leading-relaxed">
                  Select a mood below to log your daily check-in. Consistent tracking helps customize recommendations and session insights.
                </p>
              </div>
              <div className="flex justify-between items-center w-full px-0.5 mt-2">
                {[
                  { name: "Low", displayName: "Sad", score: 0 },
                  { name: "Heavy", displayName: "Bad", score: 1 },
                  { name: "Okay", displayName: "Not Bad", score: 2 },
                  { name: "Good", displayName: "Good", score: 3 },
                  { name: "Bright", displayName: "Happy", score: 4 },
                ].map((mood) => {
                  const isSelected = checkedInMood && checkedInMood.score === mood.score
                  return (
                    <button
                      key={mood.name}
                      type="button"
                      onClick={() => handleOpenMoodModal(mood.score)}
                      className="flex flex-col items-center focus-visible:outline-none transition-transform hover:scale-105"
                    >
                      {renderEmojiFace(mood.name, !!isSelected)}
                      <span className="text-[11px] font-bold mt-2 text-slate-400">{mood.displayName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card 2: Your Rhythm (Monthly Grid) */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100/90 shadow-[0_4px_24px_rgba(15,23,42,0.015)] h-[230px] flex flex-col justify-between">
              <div className="grid grid-cols-7 gap-y-2 gap-x-1.5 justify-items-center">
                {desktopCalendarDays.map((item, index) => (
                  <div key={index}>
                    {renderCalendarCircle(item)}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 justify-items-center mt-3 pt-2 border-t border-slate-100">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <span key={i} className="text-[11px] font-bold text-slate-400 uppercase">{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Something I Noticed (Desktop) */}
          <div className="bg-[#FEF6F0] rounded-[32px] p-8 border border-[#FBE6D8] shadow-[0_4px_24px_rgba(15,23,42,0.01)] flex flex-col gap-4">
            <span className="text-[12px] font-black uppercase tracking-[0.15em] text-[#E8722A]">
              Something I Noticed
            </span>
            <p className="text-[16px] font-medium text-slate-700 leading-relaxed">
              You&apos;ve mentioned exam stress a few times lately. If it helps, we can unpack what&apos;s weighing heaviest before it builds up.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link 
                href="/patient/ai-bot"
                onClick={(e) => {
                  e.preventDefault();
                  setIsChatExpanded(true);
                }}
                className="bg-[#F99254] hover:bg-[#E87E3E] text-white px-6 py-2.5 rounded-full font-bold text-[14px] shadow-sm transition-all active:scale-95"
              >
                Let&apos;s talk
              </Link>
              <Link 
                href="/patient/library"
                className="text-[#F99254] hover:underline font-bold text-[14px] flex items-center gap-1"
              >
                Know more &rarr;
              </Link>
            </div>
          </div>

          {/* What you can do now Section (Desktop) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[20px] font-black text-slate-800 tracking-tight leading-none mb-1">
              What you can do now
            </h3>
            
            {suggestions && selectedCategory && (
              <div className="flex flex-col gap-4">
                {/* Card 1: Activity */}
                {selectedCategory === "activity" && (
                  <div 
                    onClick={() => handleActivityClick(suggestions.activity)}
                    className="bg-[#F0ECF8] rounded-[32px] p-5 border border-[#E3DCF1] flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-6 h-6 text-[#6B4FBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                          {suggestions.activity.title}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500 leading-snug mt-1 line-clamp-2">
                          {suggestions.activity.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#6B4FBB] text-[13px] font-bold shrink-0 pr-1">
                      <span>Try</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Card 2: Read */}
                {selectedCategory === "read" && (
                  <Link 
                    href={`/read/${suggestions.read.slug}`}
                    className="bg-[#E6F4F8] rounded-[32px] p-5 border border-[#CDE5EE] flex items-center justify-between hover:scale-[1.01] transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-6 h-6 text-[#00829B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                          {suggestions.read.title}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500 leading-snug mt-1 line-clamp-2">
                          {suggestions.read.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#00829B] text-[13px] font-bold shrink-0 pr-1">
                      <span>Read</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )}

                {/* Card 3: Listen */}
                {selectedCategory === "listen" && (
                  <Link 
                    href={`/listen/${suggestions.listen.slug}`}
                    className="bg-[#EAF6EC] rounded-[32px] p-5 border border-[#D2EBD7] flex items-center justify-between hover:scale-[1.01] transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-6 h-6 text-[#1E8A37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                          {suggestions.listen.title}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500 leading-snug mt-1 line-clamp-2">
                          {suggestions.listen.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#1E8A37] text-[13px] font-bold shrink-0 pr-1">
                      <span>Listen</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )}

                {/* Card 4: Assessment */}
                {selectedCategory === "assessment" && (
                  <Link 
                    href={suggestions.assessment.href}
                    className="bg-[#FEF5ED] rounded-[32px] p-5 border border-[#FCE3CF] flex items-center justify-between hover:scale-[1.01] transition-all group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-6 h-6 text-[#D97736]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-extrabold text-[15px] sm:text-[16px] text-slate-900 leading-tight truncate">
                          {suggestions.assessment.title}
                        </span>
                        <span className="text-[12px] font-medium text-slate-500 leading-snug mt-1 line-clamp-2">
                          {suggestions.assessment.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[#D97736] text-[13px] font-bold shrink-0 pr-1">
                      <span>Check</span>
                      <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
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
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup>
        <AnimatePresence>
          {isChatExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }}
              exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
              className="fixed inset-0 z-[100] bg-gradient-to-b from-[#8BC8DF]/90 to-[#C8E2EF]/90 flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden"
              style={{
                borderRadius: 0
              }}
            >
              <TryPragyaChat 
                sessionId={session?.user?.id ? `patient_${session.user.id}` : ""}
                initialPlan={plan}
                initialChatCount={0}
                userName={displayName}
                onBack={() => setIsChatExpanded(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  )
}
