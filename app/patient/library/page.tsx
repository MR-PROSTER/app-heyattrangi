"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Sparkles, BookOpen, Newspaper, ShieldCheck, ArrowRight, ExternalLink, Clock, Activity } from "lucide-react"


// --- TYPES ---
interface JournalEntry {
  id: string
  date: string
  mood: string
  text: string
}

// --- MOCK DASHBOARD DATA ---
// aiSummary is now a state variable

// mentalHealthNews and latestResearch are now state variables inside the component

const clinicalGuidelines = [
  {
    id: 1,
    org: "APA",
    title: "2026 Guidelines for the Treatment of Depression",
    status: "Updated",
    link: "#"
  },
  {
    id: 2,
    org: "NICE",
    title: "Management of Adult ADHD",
    status: "New Evidence",
    link: "#"
  },
  {
    id: 3,
    org: "WHO",
    title: "Global Protocol on Trauma Support",
    status: "Published",
    link: "#"
  }
]

function LibraryContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<string>("discover") // discover | wellness | distress | illness | stories | selfhelp | brainfood
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  useEffect(() => {
    const assessmentParam = searchParams.get("assessment")
    if (activeTab === "self_assignments" && assessmentParam) {
      const targetId = `card-${assessmentParam.toLowerCase()}`
      setHighlightedCard(targetId)
      
      // Delay slightly to wait for rendering to finish
      const timerScroll = setTimeout(() => {
        const element = document.getElementById(targetId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 500)

      // Clear the pulsing highlight outline after 5 seconds
      const timerHighlight = setTimeout(() => {
        setHighlightedCard(null)
      }, 5000)

      return () => {
        clearTimeout(timerScroll)
        clearTimeout(timerHighlight)
      }
    }
  }, [activeTab, searchParams])
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [news, setNews] = useState<any[]>([])
  const [research, setResearch] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Fetch live data
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [newsRes, researchRes, summaryRes] = await Promise.all([
          fetch('/api/library/news'),
          fetch('/api/library/research'),
          fetch('/api/library/summary')
        ])
        
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          setNews(newsData.news || [])
        }
        
        if (researchRes.ok) {
          const researchData = await researchRes.json()
          setResearch(researchData.research || [])
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json()
          setSummary(summaryData.summary)
        }
      } catch (error) {
        console.error("Failed to fetch library live data", error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchLiveData()
  }, [])

  // --- Interactive States ---
  // Breathing exercise
  const [breathState, setBreathState] = useState<"Inhale" | "Hold" | "Exhale">("Inhale")
  const [breathProgress, setBreathProgress] = useState<number>(0)
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false)

  // Grounding technique (5-4-3-2-1)
  const [groundingStep, setGroundingStep] = useState<number>(5)

  // Mood Journal
  const [journalText, setJournalText] = useState<string>("")
  const [selectedMood, setSelectedMood] = useState<string>("Calm")
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    { id: "1", date: "July 9, 2026", mood: "Peaceful", text: "Had a great walk outside. Feeling grounded and clear-headed today." },
    { id: "2", date: "July 8, 2026", mood: "Anxious", text: "A bit overwhelmed with work today, but took a few deep breaths to reset." }
  ])

  // Self Assessment Quiz
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})

  // Sudoku State (Brain Busters)
  const [sudokuGrid, setSudokuGrid] = useState<number[][]>([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ])
  const [sudokuInitial] = useState<boolean[][]>([
    [true, true, false, false, true, false, false, false, false],
    [true, false, false, true, true, true, false, false, false],
    [false, true, true, false, false, false, false, true, false],
    [true, false, false, false, true, false, false, false, true],
    [true, false, false, true, false, true, false, false, true],
    [true, false, false, false, true, false, false, false, true],
    [false, true, false, false, false, false, true, true, false],
    [false, false, false, true, true, true, false, false, true],
    [false, false, false, false, true, false, false, true, true]
  ])

  // --- Breath cycle logic ---
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathProgress((prev) => {
          if (prev >= 100) {
            setBreathState((currentState) => {
              if (currentState === "Inhale") return "Hold"
              if (currentState === "Hold") return "Exhale"
              return "Inhale"
            })
            return 0
          }
          return prev + 2.5
        })
      }, 100)
    } else {
      setBreathProgress(0)
      setBreathState("Inhale")
    }
    return () => clearInterval(timer)
  }, [isBreathingActive])

  // --- Handlers ---
  const handleSudokuChange = (row: number, col: number, val: string) => {
    if (sudokuInitial[row][col]) return
    const num = parseInt(val) || 0
    if (num >= 0 && num <= 9) {
      const newGrid = [...sudokuGrid]
      newGrid[row][col] = num
      setSudokuGrid(newGrid)
    }
  }

  const handleJournalSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!journalText.trim()) return
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      mood: selectedMood,
      text: journalText
    }
    setJournalEntries([newEntry, ...journalEntries])
    setJournalText("")
  }

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let score = 0
    Object.values(quizAnswers).forEach((val) => {
      score += val
    })
    setQuizScore(score)
  }

  return (
    <div className="flex-1 h-full overflow-y-auto w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans">
      


      <div className="p-6 md:p-8 flex-1 w-full max-w-6xl mx-auto">
        {activeTab !== "discover" && (
          <button
            onClick={() => setActiveTab("discover")}
            className="text-[11px] font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center gap-1 mb-6 group"
          >
            ← Back to Library
          </button>
        )}
        
        {/* --- DISCOVER HOME PAGE --- */}
        {activeTab === "discover" && (
          <div className="space-y-10 animate-in fade-in duration-300 w-full pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="font-extrabold text-[32px] text-slate-800 tracking-tight mb-2">Self-Assessments</h3>
                <p className="text-slate-500 font-medium text-sm">Discover. Reflect. Improve. Your journey to a better you starts here.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search assessments..." 
                    className="pl-11 pr-4 py-2.5 rounded-full border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] focus:ring-2 focus:ring-indigo-100 text-sm w-64 md:w-80 bg-white font-medium text-slate-600 placeholder:text-slate-400 outline-none"
                  />
                </div>
                <button className="p-2.5 border border-slate-200 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-slate-50 text-slate-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Banner */}
            <div className="relative w-full rounded-[28px] overflow-hidden bg-[#161434] shadow-xl text-white mb-16 h-auto md:h-64 flex items-center border border-[#2a2656]">
              {/* Abstract glowing backgrounds */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[60%] bg-pink-500/30 blur-[90px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[40%] w-[40%] h-[50%] bg-purple-500/30 blur-[100px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[50%] bg-blue-500/20 blur-[80px] rounded-full mix-blend-screen"></div>
                
                {/* Simulated Wave Lines */}
                <svg className="absolute bottom-0 w-full h-full mix-blend-screen opacity-40" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <path d="M0,300 C300,180 400,100 600,160 C800,220 900,120 1000,0 L1000,300 Z" fill="url(#grad1)" opacity="0.3"/>
                  <path d="M0,300 C200,230 300,120 500,170 C700,220 800,90 1000,0 L1000,300 Z" fill="url(#grad2)" opacity="0.2"/>
                  <path d="M0,300 C150,280 250,190 450,220 C650,250 850,150 1000,50 L1000,300 Z" fill="url(#grad3)" opacity="0.15"/>
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0EA5E9" />
                      <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Stars / Particles */}
                <div className="absolute top-[30%] left-[60%] w-1 h-1 bg-white rounded-full blur-[1px] opacity-70"></div>
                <div className="absolute top-[20%] left-[80%] w-1.5 h-1.5 bg-pink-300 rounded-full blur-[1px] opacity-50"></div>
                <div className="absolute top-[70%] left-[25%] w-1 h-1 bg-blue-200 rounded-full blur-[1px] opacity-60"></div>
              </div>

              {/* Banner Content */}
              <div className="relative z-10 w-full p-8 md:px-12 md:py-0 flex flex-col md:flex-row justify-between items-center h-full">
                <div className="max-w-md mb-8 md:mb-0">
                  <h2 className="text-[28px] font-bold mb-4 tracking-tight text-white/95">Know Yourself, Grow Yourself</h2>
                  <p className="text-white/70 text-sm leading-relaxed mb-7 font-medium">
                    Explore scientifically designed assessments to understand your mental, emotional, and lifestyle well-being.
                  </p>
                  <Link href="/patient/assessments/engine" className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 text-white/90 text-sm px-5 py-2.5 rounded-full font-semibold transition-all group shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    Start Dynamic Assessment
                    <div className="bg-white text-[#161434] rounded-full p-1 group-hover:translate-x-0.5 transition-transform">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                </div>

                {/* Progress Circle */}
                <div className="flex flex-col items-center mr-6">
                  <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                      {/* Glow for the active stroke */}
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round" strokeDasharray="326.7" strokeDashoffset={326.7 * (1 - 0.72)} className="drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-1">
                      <span className="text-3xl font-bold tracking-tight text-white">72%</span>
                      <span className="text-[10px] text-white/60 font-semibold tracking-wide mt-0.5">Overall Progress</span>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 tracking-wide">
                    <svg className="w-3.5 h-3.5 drop-shadow-[0_0_3px_rgba(253,224,71,0.5)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" />
                    </svg>
                    Keep going!
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Carousel */}
            <div className="relative group px-14">
              {/* Left Nav Button */}
              <button className="absolute left-0 top-1/2 -translate-y-[70%] w-11 h-11 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="flex justify-between items-end gap-2 overflow-x-auto pb-4 hide-scrollbar">
                {[
                  { title: "Self & Mind", count: "8 Assessments", color: "blue", iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", hasPopular: false, onClick: () => setActiveTab("self_assignments") },
                  { title: "Academic Life", count: "6 Assessments", color: "purple", iconPath: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", hasPopular: false },
                  { title: "Lifestyle & Health", count: "7 Assessments", color: "green", iconPath: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", hasPopular: false },
                  { title: "Personal Growth", count: "6 Assessments", color: "orange", iconPath: "M13 10V3L4 14h7v7l9-11h-7z", hasPopular: true },
                  { title: "Relationships", count: "5 Assessments", color: "rose", iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", hasPopular: false },
                  { title: "Habits & Routine", count: "6 Assessments", color: "cyan", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", hasPopular: false }
                ].map((item, idx) => (
                  <div key={idx} onClick={item?.onClick} className={`flex flex-col items-center flex-1 min-w-[120px] cursor-pointer group ${item.onClick ? '' : 'pointer-events-none'}`}>
                    <div className="relative mb-6 w-full flex justify-center">
                      {item.hasPopular && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-orange-50 text-orange-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap border border-orange-100 shadow-sm z-10">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          Popular
                        </div>
                      )}
                      
                      {/* Icon background with glow */}
                      <div className={`w-[100px] h-[100px] rounded-full relative flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1 ${
                        item.color === 'blue' ? 'bg-blue-50/60 text-blue-500 shadow-[0_10px_30px_rgba(59,130,246,0.15)]' :
                        item.color === 'purple' ? 'bg-purple-50/60 text-purple-500 shadow-[0_10px_30px_rgba(168,85,247,0.15)]' :
                        item.color === 'green' ? 'bg-green-50/60 text-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.15)]' :
                        item.color === 'orange' ? 'bg-orange-50/60 text-orange-500 shadow-[0_10px_30px_rgba(249,115,22,0.15)]' :
                        item.color === 'rose' ? 'bg-rose-50/60 text-rose-500 shadow-[0_10px_30px_rgba(244,63,94,0.15)]' :
                        'bg-cyan-50/60 text-cyan-500 shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      }`}>
                         {/* Faint border rings inside */}
                         <div className={`absolute inset-2 rounded-full border-2 opacity-20 ${
                            item.color === 'blue' ? 'border-blue-400' :
                            item.color === 'purple' ? 'border-purple-400' :
                            item.color === 'green' ? 'border-green-400' :
                            item.color === 'orange' ? 'border-orange-400' :
                            item.color === 'rose' ? 'border-rose-400' :
                            'border-cyan-400'
                         }`}></div>
                         <svg className="w-[42px] h-[42px] opacity-90 stroke-[1.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                         </svg>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 text-[15px] mb-1 group-hover:text-slate-900 transition-colors text-center whitespace-nowrap">{item.title}</h4>
                    <p className="text-[11px] font-semibold text-slate-400 mb-3.5 tracking-wide">{item.count}</p>
                    
                    {/* Bottom Line Indicator */}
                    <div className={`h-[3px] w-14 rounded-full ${
                      item.color === 'blue' ? 'bg-blue-600' :
                      item.color === 'purple' ? 'bg-purple-600' :
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'orange' ? 'bg-orange-400' :
                      item.color === 'rose' ? 'bg-rose-500' :
                      'bg-cyan-400'
                    }`}></div>
                  </div>
                ))}
              </div>
              
              {/* Right Nav Button */}
              <button className="absolute right-0 top-1/2 -translate-y-[70%] w-11 h-11 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors z-10 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            
            {/* Mental Health Research & News Dashboard */}
            <div className="mt-20 border-t border-slate-100 pt-16">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-600" /> Mental Health Dashboard
                  </h3>
                  <p className="text-slate-500 font-medium mt-1">Live updates on research, clinical guidelines, and news.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Live Feed
                </div>
              </div>

              {/* 1. AI Summary Hero */}
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-white shadow-lg mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-indigo-100" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-1">
                      AI Daily Summary • {summary ? summary.date : "Loading..."}
                    </h4>
                    {loadingData || !summary ? (
                      <div className="mt-4 space-y-3">
                        <div className="h-4 bg-indigo-800/50 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-indigo-800/50 rounded w-2/3 animate-pulse"></div>
                        <div className="h-4 bg-indigo-800/50 rounded w-5/6 animate-pulse"></div>
                      </div>
                    ) : (
                      <ul className="mt-4 space-y-3">
                        {summary.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-indigo-300 mt-1">●</span>
                            <span className="text-white/90 font-medium leading-relaxed">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* 3-Column Grid for Research, News, Guidelines */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Latest Research (PubMed) */}
                <div className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500" /> Latest Research
                    </h4>
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">PubMed</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    {loadingData ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">Loading latest research...</div>
                    ) : research.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">No research articles found.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {research.slice(0, 4).map((item, idx) => (
                          <div key={item.id} className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md p-5 rounded-2xl transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md truncate pr-2 max-w-[70%]">{item.journal}</span>
                              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 whitespace-nowrap"><Clock className="w-3 h-3"/> {item.date}</span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-[14px] leading-snug mb-4 group-hover:text-indigo-600 transition-colors flex-1">{item.title}</h5>
                            <div className="flex justify-between items-center mt-auto">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{item.tag}</span>
                              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 bg-slate-50 hover:bg-indigo-50 rounded-full">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="w-full mt-auto py-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1 shadow-sm">
                      View all research <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Column 2: Mental Health News */}
                <div className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-500" /> Health News
                    </h4>
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">NewsAPI</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    {loadingData ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">Loading news...</div>
                    ) : news.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center text-slate-400 text-xs flex-1 flex items-center justify-center">No news articles found.</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {news.slice(0, 4).map((item, idx) => (
                          <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className={`group cursor-pointer rounded-2xl p-5 transition-all border ${idx === 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:border-blue-300 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}`}>
                            <div className="flex flex-col h-full">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider truncate max-w-[60%] px-2 py-1 rounded-md ${idx === 0 ? 'text-blue-700 bg-blue-100/50' : 'text-blue-600 bg-blue-50'}`}>{item.source}</span>
                                <span className={`text-[10px] font-semibold whitespace-nowrap ${idx === 0 ? 'text-blue-400' : 'text-slate-400'}`}>{item.time}</span>
                              </div>
                              <h5 className={`font-bold text-[14px] leading-snug line-clamp-3 transition-colors ${idx === 0 ? 'text-blue-900 group-hover:text-blue-700' : 'text-slate-800 group-hover:text-blue-600'}`}>{item.title}</h5>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                    <button className="w-full mt-auto py-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors flex items-center justify-center gap-1 shadow-sm">
                      Load more stories <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Column 3: Clinical Guidelines */}
                <div className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" /> Guidelines
                    </h4>
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">Official</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-4">
                      {clinicalGuidelines.map((guideline) => (
                        <div key={guideline.id} className="bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md p-5 rounded-2xl transition-all group flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600 font-black text-xs border border-emerald-100 shadow-sm">
                              {guideline.org}
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                              guideline.status === 'Updated' ? 'bg-orange-50 text-orange-600' :
                              guideline.status === 'New Evidence' ? 'bg-blue-50 text-blue-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>{guideline.status}</span>
                          </div>
                          <h5 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-emerald-600 transition-colors mt-auto pr-2">{guideline.title}</h5>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-auto py-3 bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-colors flex items-center justify-center gap-1 shadow-sm">
                      View full directory <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* --- SELF ASSIGNMENTS MODULE --- */}
        {activeTab === "self_assignments" && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="space-y-6 mb-12">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10">
                <div className="max-w-2xl">
                  <h3 className="font-extrabold text-[32px] text-slate-700 mb-2 font-sans tracking-tight">Self Assignments</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Gain insight into your mental and emotional health and find ways to support yourself
                  </p>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search resources" 
                    className="pl-4 pr-10 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-rose-200 text-sm w-full md:w-64 bg-white font-medium text-slate-600 placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="w-5 h-5 text-rose-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: "card-asrs",
                    title: "Adult ADHD Self-Report Scale",
                    shortName: "ASRS-v1.1",
                    desc: "Start the assessment to know if your struggles with attention and focus might be more than occasional distractions.",
                    time: "3 mins quiz",
                    image: "/assessments/adhd.png",
                    link: "/patient/assessments/asrs"
                  },
                  {
                    id: "card-oci-r",
                    title: "How severe are my OCD symptoms?",
                    shortName: "OCI-R",
                    desc: "Start the assessment to understand whether your thoughts or behaviours might be signs of OCD.",
                    time: "5 mins quiz",
                    image: "/assessments/ocd.png",
                    link: "/patient/assessments/ocd"
                  },
                  {
                    id: "card-phq-9",
                    title: "Am I Sad or Depressed?",
                    shortName: "PHQ-9",
                    desc: "Start with the assessment to understand whether your feelings of sadness may be more than a temporary mood.",
                    time: "5 mins quiz",
                    image: "/assessments/depression.png",
                    link: "/patient/assessments/phq-9"
                  },
                  {
                    id: "card-gad-7",
                    title: "Am I Anxious?",
                    shortName: "GAD-7",
                    desc: "Take this quick assessment to understand if your feelings of worry or stress indicate anxiety.",
                    time: "3 mins quiz",
                    image: "/assessments/anxiety.png",
                    link: "/patient/assessments/gad-7"
                  },
                  {
                    id: "card-ptsd",
                    title: "Primary Care PTSD Screen",
                    shortName: "PC-PTSD-5",
                    desc: "Start the assessment to understand if you might be experiencing signs of Post-Traumatic Stress.",
                    time: "4 mins quiz",
                    image: "/assessments/ptsd.png",
                    link: "/patient/assessments/ptsd"
                  }
                ].filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase()) || item.shortName.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                  <div 
                    key={idx} 
                    id={item.id}
                    className={`bg-white rounded-[24px] p-6 shadow-sm border flex flex-col h-full hover:shadow-md transition-all ${
                      highlightedCard === item.id 
                        ? "border-rose-450 ring-4 ring-rose-100 animate-pulse shadow-lg scale-[1.02]" 
                        : "border-slate-100"
                    }`}
                  >
                    <h4 className="font-bold text-xl text-slate-700 mb-1 tracking-tight pr-4">{item.title}</h4>
                    <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest mb-4">{item.shortName}</p>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{item.desc}</p>
                    
                    <div className="flex items-end justify-between mt-auto">
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden shadow-sm">
                        <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                      </div>
                      
                      <div className="flex flex-col items-end gap-5">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-xs font-semibold">{item.time}</span>
                        </div>
                        <Link href={item.link} className="text-[11px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest border-b-[1.5px] border-rose-200 hover:border-rose-500 pb-0.5 transition-all">
                          TAKE ASSESSMENT
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- 1. MENTAL WELLNESS MODULE --- */}
        {activeTab === "wellness" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Interactive Breathing Tool */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center justify-center min-h-[380px] group">
                <div className="absolute inset-0 opacity-5 rounded-3xl" style={{backgroundImage: "radial-gradient(circle at 50% 50%, #3b82f6 0%, transparent 70%)"}}></div>
                <div className="relative z-10 text-center flex flex-col items-center h-full">
                  <div className="mb-2">
                    <h3 className="font-extrabold text-2xl text-slate-900">Guided Breath Calmer</h3>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mt-2">Breathing Exercise</span>
                  </div>

                  {/* Breathing Ball with enhanced animation */}
                  <div className="relative flex-1 w-48 flex items-center justify-center my-6">
                    <div
                      className={`absolute rounded-full transition-all duration-[4000ms] flex flex-col items-center justify-center font-black text-sm tracking-widest text-white ${
                        isBreathingActive && breathState === "Inhale"
                          ? "w-44 h-44 bg-gradient-to-br from-blue-400 to-blue-500 border-4 border-blue-300 shadow-xl shadow-blue-300/50"
                          : isBreathingActive && breathState === "Hold"
                          ? "w-44 h-44 bg-gradient-to-br from-emerald-400 to-emerald-500 border-4 border-emerald-300 shadow-xl shadow-emerald-300/50"
                          : "w-32 h-32 bg-gradient-to-br from-slate-300 to-slate-400 border-4 border-slate-300 shadow-lg"
                      }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">
                        {isBreathingActive ? breathState : "Ready"}
                      </span>
                      {isBreathingActive && <span className="text-[10px] mt-1 opacity-80">{Math.round(breathProgress)}%</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className={`px-10 py-3.5 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-lg ${
                      isBreathingActive
                        ? "bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white scale-[0.98] hover:scale-100"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white scale-100 hover:scale-105"
                    }`}
                  >
                    {isBreathingActive ? "Stop Exercise" : "Start Exercise"}
                  </button>
                </div>
              </div>

              {/* Recommended Audios with enhanced design */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow space-y-6">
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-900">Recommended Audio Sessions</h3>
                  <p className="text-slate-400 text-xs font-medium mt-1">Curated for relaxation & focus</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "Calming Storm & Ocean Waves", duration: "12 mins", category: "Ambient", label: "Ambient" },
                    { title: "Deep Muscle Relaxation (PMR)", duration: "18 mins", category: "Guided", label: "Guided" },
                    { title: "Morning Mindfulness Routine", duration: "5 mins", category: "Quick Reset", label: "Reset" }
                  ].map((audio, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 flex items-center justify-between gap-4 group hover:shadow-md transition-all hover:border-blue-300">
                      <div className="flex items-center gap-4 flex-1">
                    <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-500">{audio.label}</div>
                        <div>
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider">{audio.duration} • {audio.category}</span>
                          <h4 className="font-bold text-slate-900 mt-1.5 text-sm">{audio.title}</h4>
                        </div>
                      </div>
                      <button className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform group-hover:scale-110">
                        <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. DISTRESS SIGNALS MODULE --- */}
        {activeTab === "distress" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Grounding Assistant */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow min-h-[420px] flex flex-col">
                <div className="mb-6">
                  <h3 className="font-extrabold text-2xl text-slate-900">5-4-3-2-1 Grounding Assistant</h3>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mt-2">Grounding Technique</span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center py-8 text-center bg-gradient-to-br from-orange-50/50 to-red-50/30 rounded-2xl p-6 mb-6">
                  {groundingStep === 5 && (
                    <div className="animate-in fade-in duration-300 w-full">
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-3">Step 1 of 5</span>
                      <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Identify 5 things you can see</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Focus on small, stationary objects in your line of sight.</p>
                    </div>
                  )}
                  {groundingStep === 4 && (
                    <div className="animate-in fade-in duration-300 w-full">
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-3">Step 2 of 5</span>
                      <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Identify 4 things you can touch</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Notice the texture of fabric, wood surfaces, or your breathing muscles.</p>
                    </div>
                  )}
                  {groundingStep === 3 && (
                    <div className="animate-in fade-in duration-300 w-full">
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-3">Step 3 of 5</span>
                      <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Identify 3 things you can hear</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Listen for distant traffic, ambient hums, or the rustle of leaves.</p>
                    </div>
                  )}
                  {groundingStep === 2 && (
                    <div className="animate-in fade-in duration-300 w-full">
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-3">Step 4 of 5</span>
                      <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Identify 2 things you can smell</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Sniff the air, hand soap, clothing, or a book.</p>
                    </div>
                  )}
                  {groundingStep === 1 && (
                    <div className="animate-in fade-in duration-300 w-full">
                      <span className="text-xs font-black text-orange-600 uppercase tracking-wider block mb-3">Step 5 of 5</span>
                      <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Identify 1 thing you can taste</h4>
                      <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">Notice the natural taste in your mouth, or take a sip of cool water.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    disabled={groundingStep === 5}
                    onClick={() => setGroundingStep((prev) => prev + 1)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-xs text-slate-600 disabled:opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      if (groundingStep === 1) {
                        setGroundingStep(5)
                      } else {
                        setGroundingStep((prev) => prev - 1)
                      }
                    }}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                  >
                    {groundingStep === 1 ? "Start Over" : "Next Step"}
                  </button>
                </div>
              </div>

              {/* Support Hotlines with enhanced design */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow space-y-6">
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-900">Verified Support Lines</h3>
                  <p className="text-slate-400 text-xs font-medium mt-2">24/7 availability for crisis support</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: "Tele MANAS Helpline", number: "14416", desc: "Available 24/7. National crisis response support.", label: "Phone" },
                    { name: "KIRAN Support", number: "1800-599-0019", desc: "Government mental health service.", label: "SOS" },
                    { name: "Vandrevala Foundation", number: "9999 666 555", desc: "Crisis and trauma counseling helpline.", label: "Support" }
                  ].map((line, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50/50 border border-orange-200/50 flex items-center justify-between gap-4 group hover:shadow-md hover:border-orange-300 transition-all">
                      <div className="flex items-start gap-4">
                        <span className="text-xs uppercase tracking-[0.2em] font-black text-orange-600 mt-1">{line.label}</span>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{line.name}</h4>
                          <span className="text-lg font-black text-orange-600 mt-1.5 block">{line.number}</span>
                          <p className="text-[10px] text-slate-500 font-medium mt-1.5">{line.desc}</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${line.number.replace(/\s+/g, "")}`}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full font-black text-xs tracking-wider shadow-md hover:shadow-lg transition-all whitespace-nowrap transform group-hover:scale-105"
                      >
                        CALL NOW
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. UNDERSTANDING MENTAL ILLNESS MODULE --- */}
        {activeTab === "illness" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Special Populations */}
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="font-extrabold text-2xl mb-8 text-slate-900">Tips for Special Populations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 hover:shadow-lg transition-shadow group">
                  <div className="mb-3"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block mb-2">Adolescents</span>
                  <h4 className="font-black text-slate-900 text-lg mb-3">Children & Teenagers</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Identify developmental mood shifts, foster verbal emotional outlets, and support structured home patterns.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 hover:shadow-lg transition-shadow group">
                  <div className="mb-3"></div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block mb-2">Geriatric</span>
                  <h4 className="font-black text-slate-900 text-lg mb-3">Elders & Seniors</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Address retirement isolation, early-stage cognitive memory shifts, and routine physical checks.
                  </p>
                </div>

              </div>
            </div>

            {/* Reference Articles */}
            <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="font-extrabold text-2xl mb-8 text-slate-900">Condition Reference Articles</h3>
              <div className="divide-y divide-slate-200">
                {[
                  { title: "Gender Patterns in Mental Health", desc: "Understanding the unique socio-cultural and diagnostic trends in mental health.", label: "Community" },
                  { title: "Active Listening and Peer Support", desc: "How to effectively listen and support someone struggling with their mental health.", label: "Listening" }
                ].map((article, i) => (
                  <div key={i} className="py-5 first:pt-0 last:pb-0 flex justify-between items-start gap-6 group hover:bg-slate-50/50 px-3 -mx-3 rounded-lg transition-all">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-500 mb-2">{article.label}</div>
                      <h4 className="font-black text-slate-900 hover:text-teal-600 transition-colors cursor-pointer text-base">{article.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">{article.desc}</p>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 hover:text-slate-700 cursor-pointer uppercase tracking-wider whitespace-nowrap px-4 py-2 bg-slate-100 rounded-lg group-hover:bg-teal-100 group-hover:text-teal-700 transition-all">Read File</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptom Clusters */}
            <div className="space-y-6">
              <h3 className="font-extrabold text-2xl text-slate-900">Recognizing Symptom Clusters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "Behavioral Problems", desc: "Noticeable shifts in sleep pattern, dietary logs, and routine participation.", badge: "Behavior", color: "from-red-50 to-red-100/50 border-red-200/50" },
                  { label: "Physical Symptoms", desc: "Chest compression feelings, continuous muscle tension, heart rate spikes.", badge: "Physical", color: "from-orange-50 to-orange-100/50 border-orange-200/50" },
                  { label: "Social Withdrawal", desc: "Hesitation to return texts, avoidance of team sessions or family calls.", badge: "Social", color: "from-yellow-50 to-yellow-100/50 border-yellow-200/50" },
                  { label: "Substance Dependence", desc: "Relying on escape behaviors or dependencies to manage daily stress.", badge: "Substance", color: "from-purple-50 to-purple-100/50 border-purple-200/50" },
                  { label: "Cognitive Dissociation", desc: "Feeling detached from environments or losing touch with immediate tasks.", badge: "Cognitive", color: "from-blue-50 to-blue-100/50 border-blue-200/50" },
                  { label: "Executive Dysfunction", desc: "Continuous memory blocks, daily plan delays, high overwhelm.", badge: "Executive", color: "from-teal-50 to-teal-100/50 border-teal-200/50" }
                ].map((symptom, i) => (
                  <div key={i} className={`bg-gradient-to-br ${symptom.color} rounded-2xl p-6 border hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group`}>
                    <div className="mb-3"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Category {i + 1}</span>
                    <h4 className="font-black text-slate-900 text-base mb-2 group-hover:text-slate-800 transition-colors">{symptom.label}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{symptom.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* --- 4. SUCCESS STORIES --- */}
        {activeTab === "stories" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Rahul S.", age: "28", text: "Daily mindfulness work completely resolved my workplace anxiety cycles. I feel so much more at ease now.", tag: "Recovered", color: "from-blue-500 to-cyan-500" },
                { name: "Priya M.", age: "34", text: "Revisiting visual grounding steps helped me manage panic triggers. I feel in control again and can face my days.", tag: "Resilient", color: "from-purple-500 to-pink-500" },
                { name: "Anil K.", age: "42", text: "Finding clinical counseling options early gave me strong coping tools for burnout. My life has transformed.", tag: "Balanced", color: "from-green-500 to-emerald-500" }
              ].map((story, idx) => (
                <div key={idx} className="group bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between hover:scale-[1.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-500">Story</div>
                    <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${story.color} text-white text-[10px] font-black uppercase tracking-wider shadow-lg`}>
                      {story.tag}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 font-medium italic leading-relaxed mb-6 text-sm flex-grow">
                    "{story.text}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{story.name}</h4>
                      <span className="text-xs text-slate-400 font-bold">Age {story.age}</span>
                    </div>
                    <div className="text-right text-[10px] font-semibold text-slate-400">Real Story</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 5. SELF HELP MODULE --- */}
        {activeTab === "selfhelp" && (
          <div className="space-y-10 animate-in fade-in duration-300">


            {/* PDF Downloads with enhanced design */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow space-y-8">
                <div>
                  <h3 className="font-extrabold text-2xl text-slate-900">Worksheet Files</h3>
                  <p className="text-slate-400 text-xs font-medium mt-2">Downloadable resources & worksheets</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { title: "Cognitive Distortions Guide", size: "1.2 MB", label: "Guide", color: "from-blue-500 to-cyan-500" },
                    { title: "Daily Anxiety Tracker Log", size: "640 KB", label: "Tracker", color: "from-purple-500 to-pink-500" },
                    { title: "Sleep Hygiene Check-list", size: "820 KB", label: "Checklist", color: "from-indigo-500 to-blue-500" }
                  ].map((doc, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/50 flex items-center justify-between gap-4 group hover:shadow-lg hover:border-slate-300 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                          <div className="text-xs uppercase tracking-[0.2em] font-black text-slate-600">{doc.label}</div>
                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{doc.title}</h4>
                          <span className="text-[9px] text-slate-500 font-bold mt-1 block">{doc.size}</span>
                        </div>
                      </div>
                      <button className={`px-6 py-3 bg-gradient-to-r ${doc.color} text-white rounded-full font-black text-[10px] uppercase tracking-wider flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform group-hover:scale-105`}>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* --- 6. BRAIN FOOD ROOM --- */}
        {activeTab === "brainfood" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sudoku with enhanced design */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center">
                <div className="text-center mb-8">
                  <h3 className="font-extrabold text-2xl text-slate-900">Brain Busters: Sudoku</h3>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mt-2">Cognitive Focus</span>
                  <p className="text-xs text-slate-500 font-medium mt-3">Challenge your mind and improve focus</p>
                </div>

                {/* Grid with enhanced styling */}
                <div className="grid grid-cols-9 gap-0.5 border-4 border-slate-900 p-2 bg-slate-900 rounded-xl shadow-2xl mb-8">
                  {sudokuGrid.map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        type="text"
                        maxLength={1}
                        value={val === 0 ? "" : val}
                        onChange={(e) => handleSudokuChange(rIdx, cIdx, e.target.value)}
                        className={`w-9 h-9 md:w-10 md:h-10 text-center font-black text-sm focus:ring-2 focus:ring-rose-400 rounded border-[1px] transition-all ${
                          sudokuInitial[rIdx][cIdx]
                            ? "bg-slate-200 text-slate-900 font-extrabold cursor-not-allowed border-slate-300"
                            : "bg-white text-rose-600 font-bold border-slate-200 hover:bg-rose-50"
                        }`}
                      />
                    ))
                  )}
                </div>

                <div className="flex gap-3 w-full">
                  <button className="flex-1 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all">
                    Reset
                  </button>
                  <button className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all">
                    Validate
                  </button>
                </div>
              </div>

              {/* Thought Diary with enhanced design */}
              <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <div className="mb-8">
                  <h3 className="font-extrabold text-2xl text-slate-900">Thought Diary</h3>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mt-2">Local Journal Log</span>
                  <p className="text-xs text-slate-500 font-medium mt-3">Capture and reflect on your thoughts</p>
                </div>

                <form onSubmit={handleJournalSave} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3">
                      Current Mood State
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Calm", "Happy", "Tired", "Anxious", "Sad"].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setSelectedMood(mood)}
                          className={`py-2 px-4 rounded-full text-[11px] font-black border-2 transition-all ${
                            selectedMood === mood
                              ? "bg-rose-500 text-white border-rose-500 shadow-lg scale-105"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-3">
                      Observations & Reflections
                    </label>
                    <textarea
                      rows={4}
                      value={journalText}
                      onChange={(e) => setJournalText(e.target.value)}
                      placeholder="Write whatever is on your mind..."
                      className="w-full bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs rounded-xl uppercase tracking-wider transition-all shadow-lg"
                  >
                    Save Entry
                  </button>
                </form>

                {/* Diary History */}
                <div className="mt-8 flex-1 flex flex-col">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-4">Diary History</h4>
                  <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                    {journalEntries.map((entry) => (
                      <div key={entry.id} className="p-4 bg-gradient-to-br from-rose-50/50 to-pink-50/30 border border-rose-200/50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-bold text-slate-500">{entry.date}</span>
                          <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">{entry.mood}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{entry.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-semibold font-sans">Loading page...</div>}>
      <LibraryContent />
    </Suspense>
  )
}
