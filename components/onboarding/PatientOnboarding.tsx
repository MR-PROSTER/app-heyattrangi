"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type OnboardingData = {
  mood: string
  experience: string
  reasons: string[]
}

const STEPS_COUNT = 5

export default function PatientOnboarding() {
  const router = useRouter()
  const { data: session } = useSession()

  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    mood: "",
    experience: "",
    reasons: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  const userName = session?.user?.name?.split(" ")[0] || "Sam" // Fallback to Sam for demo

  const handleNext = () => setStep((s) => s + 1)
  const handleBack = () => setStep((s) => s - 1)
  const handleSkip = () => setStep(5)

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/onboarding/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: "18",
          gender: "Not specified",
          healthConcerns: data.reasons,
          emergencyContact: "Not specified",
          emergencyPhone: "0000000000",
        }),
      })

      if (response.ok) {
        router.push("/patient/dashboard")
      } else {
        alert("Something went wrong.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleReason = (reason: string) => {
    setData((prev) => ({
      ...prev,
      reasons: prev.reasons.includes(reason)
        ? prev.reasons.filter((r) => r !== reason)
        : [...prev.reasons, reason],
    }))
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#fdf8f4] overflow-hidden font-sans">
      
      {/* Background Abstract Shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6a805d]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-10 right-20 w-32 h-32 bg-[#fad9bb] rounded-full opacity-60" />
      <div className="absolute top-5 right-5 w-12 h-32 bg-[#c08d6d] rounded-full opacity-40 rotate-12" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-4xl px-4 flex flex-col items-center"
        >
          {/* Main Content Card */}
          <div className="relative w-full bg-[#fdf1e4] rounded-[48px] p-10 md:p-16 flex flex-col items-center shadow-2xl shadow-orange-900/10 min-h-[480px]">
            
            {/* Progress Bar (Visible from Step 2 to 4) */}
            {step >= 2 && step <= 4 && (
              <div className="absolute top-8 right-12 w-32 h-1.5 bg-[#e8e0d8] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#6a805d]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / STEPS_COUNT) * 100}%` }}
                />
              </div>
            )}

            {/* Content Switcher */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center z-10">
              {step === 0 && <WelcomeScreen userName={userName} />}
              {step === 1 && <PrivacyScreen />}
              {step === 2 && <MoodScreen selected={data.mood} onSelect={(m) => setData({ ...data, mood: m })} />}
              {step === 3 && <ExperienceScreen selected={data.experience} onSelect={(e) => setData({ ...data, experience: e })} />}
              {step === 4 && <ReasonScreen selected={data.reasons} onToggle={toggleReason} />}
              {step === 5 && <FinalScreen userName={userName} />}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex flex-col items-center gap-6 z-10">
              <div className="flex items-center gap-4">
                {step === 0 && (
                  <button onClick={handleSkip} className="px-10 py-3.5 rounded-2xl bg-[#e8e0d8]/80 hover:bg-[#e8e0d8] text-[#666] font-bold text-sm transition-all">
                    Skip
                  </button>
                )}
                {step > 0 && step < 5 && (
                  <button onClick={handleBack} className="px-10 py-3.5 rounded-2xl bg-[#e8e0d8]/80 hover:bg-[#e8e0d8] text-[#666] font-bold text-sm transition-all">
                    Back
                  </button>
                )}
                
                {step < 5 ? (
                  <button 
                    onClick={handleNext}
                    className="px-12 py-3.5 rounded-2xl bg-[#f4a261] hover:bg-[#e76f51] text-white font-black text-sm shadow-xl shadow-orange-200 transition-all flex items-center gap-2"
                  >
                    {step === 4 ? "Finish" : "Continue"} <span className="text-lg">→</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="px-14 py-4 rounded-2xl bg-[#f4a261] hover:bg-[#e76f51] text-white font-black text-base shadow-xl shadow-orange-200 transition-all flex items-center gap-2"
                  >
                    {isLoading ? "Starting..." : "Welcome to Attrangi!"} <span className="text-xl">→</span>
                  </button>
                )}
              </div>

              {/* Progress Dots Indicator */}
              {step < 5 && (
                <div className="flex gap-2.5">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        i === step ? "bg-[#f4a261] w-4" : "bg-[#e8e0d8]"
                      }`} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Absolute Illustrations */}
            {(step === 0 || step === 1) && (
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-4 left-6 pointer-events-none"
              >
                <Image 
                  src={step === 0 ? "/onboarding_images/6.png" : "/onboarding_images/2.png"} 
                  alt="Onboarding Illustration" 
                  width={280} 
                  height={200}
                  className="object-contain"
                />
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute bottom-4 left-6 pointer-events-none"
              >
                <Image 
                  src="/onboarding_images/5.png" 
                  alt="Final Illustration" 
                  width={220} 
                  height={220}
                  className="object-contain"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// --- SCREEN COMPONENTS ---

function WelcomeScreen({ userName }: { userName: string }) {
  return (
    <div className="max-w-md">
      <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Welcome {userName},</h2>
      <div className="space-y-4 text-lg font-medium text-gray-600 leading-relaxed">
        <p>This is a safe and private space for you.</p>
        <p>I&apos;m here to listen and support you at your pace.</p>
        <p className="text-gray-900 font-bold mt-8">To understand you better, can I ask a few quick questions?</p>
      </div>
    </div>
  )
}

function PrivacyScreen() {
  return (
    <div className="max-w-md">
      <div className="space-y-6 text-lg font-medium text-gray-600 leading-relaxed">
        <p>This is a safe and private space for you.</p>
        <div className="p-6 bg-white/40 rounded-3xl border border-white/60">
           <p className="font-bold text-gray-900 mb-2">Your conversations are private.</p>
           <p>You&apos;re in control of what you share.</p>
        </div>
        <p className="text-2xl font-black text-gray-900 mt-10">You&apos;re not alone. We&apos;re here to support you.</p>
      </div>
    </div>
  )
}

function MoodScreen({ selected, onSelect }: { selected: string; onSelect: (m: string) => void }) {
  const moods = [
    { label: "Cry", icon: "😭" },
    { label: "Angry", icon: "😠" },
    { label: "Neutral", icon: "😐" },
    { label: "Sad", icon: "😔" },
    { label: "Smile", icon: "😊" },
  ]

  return (
    <div className="w-full">
      <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">How are you feeling today?</h2>
      <div className="flex flex-wrap justify-center gap-5">
        {moods.map((m) => (
          <button
            key={m.label}
            onClick={() => onSelect(m.label)}
            className={`w-24 h-24 rounded-[32px] flex flex-col items-center justify-center transition-all duration-300 ${
              selected === m.label 
                ? "bg-[#f4a261] text-white shadow-xl shadow-orange-200 scale-110" 
                : "bg-white/60 text-gray-400 hover:bg-white hover:text-gray-900"
            }`}
          >
            <span className="text-4xl mb-2">{m.icon}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${selected === m.label ? "text-white" : "text-gray-400"}`}>
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ExperienceScreen({ selected, onSelect }: { selected: string; onSelect: (e: string) => void }) {
  const options = [
    { id: "new", title: "Just Getting Started", sub: "First time trying therapy" },
    { id: "some", title: "Some experience", sub: "Been to a few sessions before" },
    { id: "pro", title: "Veteran", sub: "Regular therapy participant" },
  ]

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">What is your experience level with therapy?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`p-7 rounded-[32px] text-left transition-all duration-300 ${
              selected === opt.id 
                ? "bg-[#f4a261] text-white shadow-xl shadow-orange-200 scale-105" 
                : "bg-white/60 text-gray-600 hover:bg-white"
            }`}
          >
            <h4 className="font-black text-lg mb-2 leading-tight">{opt.title}</h4>
            <p className={`text-xs font-medium ${selected === opt.id ? "text-white/80" : "text-gray-400"}`}>{opt.sub}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function ReasonScreen({ selected, onToggle }: { selected: string[]; onToggle: (r: string) => void }) {
  const reasons = [
    { label: "Stress & anxiety", bg: "bg-[#7196cb]/20", text: "text-[#7196cb]", card: "bg-[#7196cb]" },
    { label: "Falling asleep", bg: "bg-[#545a7d]/20", text: "text-[#545a7d]", card: "bg-[#545a7d]" },
    { label: "Personal growth", bg: "bg-[#a686b2]/20", text: "text-[#a686b2]", card: "bg-[#a686b2]" },
    { label: "Work & productivity", bg: "bg-[#587c6b]/20", text: "text-[#587c6b]", card: "bg-[#587c6b]" },
    { label: "Revise & repeat", bg: "bg-[#dc7a6b]/20", text: "text-[#dc7a6b]", card: "bg-[#dc7a6b]" },
    { label: "Physical health", bg: "bg-[#e8b38a]/20", text: "text-[#e8b38a]", card: "bg-[#e8b38a]" },
  ]

  return (
    <div className="w-full max-w-lg">
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">What brings you to Attrangi?</h2>
      <p className="text-gray-500 font-medium mb-10">We&apos;ll tailor the experience for you.</p>
      <div className="grid grid-cols-1 gap-3.5">
        {reasons.map((r) => (
          <button
            key={r.label}
            onClick={() => onToggle(r.label)}
            className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all duration-300 font-black ${
              selected.includes(r.label)
                ? `${r.card} text-white shadow-lg -translate-y-1`
                : `${r.bg} ${r.text} hover:scale-[1.02]`
            }`}
          >
            <span>{r.label}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected.includes(r.label) ? "border-white" : "border-current opacity-40"}`}>
               {selected.includes(r.label) && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function FinalScreen({ userName }: { userName: string }) {
  return (
    <div className="max-w-md">
      <h2 className="text-3xl italic font-black text-gray-900 leading-[1.2] mb-12">
        Thanks for sharing {userName}.<br />We&apos;re here with you.
      </h2>
    </div>
  )
}