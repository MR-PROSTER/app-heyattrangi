"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import VanderbiltAssessmentBot from "@/components/patient/library/VanderbiltAssessmentBot"

// --- TYPES ---
interface JournalEntry {
  id: string
  date: string
  mood: string
  text: string
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<string>("discover") // discover | wellness | distress | illness | stories | selfhelp | brainfood
  const [searchQuery, setSearchQuery] = useState<string>("")

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
    <div className="flex-1 h-full overflow-y-auto w-full bg-gradient-to-br from-[#f8fafc] via-[#f0f4f9] to-[#e8f1f8] text-slate-800 flex flex-col font-sans">
      


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
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Welcome section */}
            <div className="text-center max-w-2xl mx-auto mb-4">
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Choose a learning path below to begin your mental wellness journey. Each module offers interactive exercises, resources, and tools to support your emotional growth.
              </p>
            </div>

            {/* Discover Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Category Card: Mental Wellness */}
              <button
                onClick={() => setActiveTab("wellness")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#3b82f6] via-[#2563eb] to-[#1e40af] text-white border border-blue-400/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 120C120 100 200 180 400 130V300H0V120Z" fill="white" />
                  <path d="M0 150C150 130 250 190 400 160V300H0V150Z" fill="white" opacity="0.5" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    5 mins
                  </span>
                    <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Wellness</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Mental Wellness</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Guided breathing exercises, relaxation scripts, and calming meditation guides.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

              {/* Category Card: Distress Signals */}
              <button
                onClick={() => setActiveTab("distress")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#f07865] via-[#f87171] to-[#fca5a5] text-white border border-red-300/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 100 Q 50 150 100 100 T 200 100 T 300 100 T 400 100 V300 H0 Z" fill="white" />
                  <path d="M0 130 Q 70 170 140 130 T 280 130 T 400 130 V300 H0 Z" fill="white" opacity="0.4" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    IMMEDIATE
                  </span>
                    <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Distress</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Distress Signals</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Emergency support contacts and active grounding techniques for urgent help.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

              {/* Category Card: Understanding Mental Illness */}
              <button
                onClick={() => setActiveTab("illness")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#0d9488] via-[#14b8a6] to-[#5eead4] text-white border border-teal-300/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 30% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="340" cy="180" r="100" fill="white" />
                  <circle cx="280" cy="140" r="60" fill="white" opacity="0.4" />
                  <circle cx="380" cy="80" r="80" fill="white" opacity="0.3" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    EDUCATION
                  </span>
                    <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Insight</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Understanding Illness</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Condition reference files and support information for special populations.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

              {/* Category Card: Our Success Stories */}
              <button
                onClick={() => setActiveTab("stories")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#6366f1] via-[#7c3aed] to-[#a855f7] text-white border border-purple-300/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 180 L 150 100 L 300 140 L 400 60 V300 H0 Z" fill="white" />
                  <path d="M0 190 L 120 130 L 250 160 L 400 100 V300 H0 Z" fill="white" opacity="0.4" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    COMMUNITY
                  </span>
                  <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Strength</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Success Stories</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Real narratives from people who reclaimed their peace of mind and wellbeing.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

              {/* Category Card: Self Help */}
              <button
                onClick={() => setActiveTab("selfhelp")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#059669] via-[#10b981] to-[#34d399] text-white border border-emerald-300/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 40% 70%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M300 300 C300 130 350 100 400 100 V300 H300 Z" fill="white" />
                  <path d="M220 300 C220 150 280 120 350 120 V300 H220 Z" fill="white" opacity="0.4" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    TOOLS
                  </span>
                  <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Tools</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Self Help</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Interactive self-diagnostics, worksheets, and printable tracking logs.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

              {/* Category Card: Brain Food Room */}
              <button
                onClick={() => setActiveTab("brainfood")}
                className="group relative overflow-hidden rounded-[28px] p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col text-left min-h-[220px] bg-gradient-to-br from-[#db2777] via-[#f472b6] to-[#fb7185] text-white border border-pink-300/30"
              >
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.3) 0%, transparent 50%)"}}></div>
                <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 280 300 L 330 110 L 400 160 V 300 Z" fill="white" opacity="0.3" />
                  <path d="M 200 300 L 290 80 L 360 140 L 400 120 V 300 Z" fill="white" opacity="0.4" />
                </svg>
                <div className="z-10 flex items-start justify-between mb-6">
                  <span className="inline-block px-4 py-2 bg-white/15 backdrop-blur-sm rounded-full text-xs font-black border border-white/20 group-hover:bg-white/25 transition-colors">
                    10 mins
                  </span>
                  <div className="text-xs uppercase tracking-[0.25em] font-black text-white/80">Focus</div>
                </div>
                <h3 className="z-10 font-black text-3xl mb-3 tracking-tight group-hover:translate-y-[-2px] transition-transform">Brain Food Room</h3>
                <p className="z-10 text-white/90 font-medium text-sm leading-relaxed max-w-xs mb-8 flex-grow">
                  Focus training games, ambient sound sessions, and a thought diary log.
                </p>
                <div className="z-10 self-end flex items-center justify-center border border-white/50 bg-white/10 group-hover:bg-white/20 text-white font-black text-xs px-6 py-2.5 rounded-full backdrop-blur-sm transition-all gap-2">
                  Explore
                </div>
              </button>

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Assessment Bot */}
              <VanderbiltAssessmentBot />
            </div>

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
