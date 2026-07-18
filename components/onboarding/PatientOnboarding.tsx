"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type OnboardingData = {
  age: string
  orgId: string
  mood: string
  experience: string
  reasons: string[]
}

const STEPS_COUNT = 7

export default function PatientOnboarding() {
  const router = useRouter()
  const { data: session } = useSession()

  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    age: "",
    orgId: "",
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
          age: data.age,
          orgId: data.orgId === "none" ? undefined : data.orgId,
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f0f7f8] overflow-hidden font-sans">
      
      {/* Background Abstract Shapes */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#4f9da6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute top-10 right-20 w-32 h-32 bg-[#c9e4e7] rounded-full opacity-60" />
      <div className="absolute top-5 right-5 w-12 h-32 bg-[#8bc4c9] rounded-full opacity-40 rotate-12" />

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
          <div className="relative w-full bg-white rounded-[48px] p-10 md:p-16 flex flex-col items-center shadow-2xl shadow-teal-900/10 min-h-[480px]">
            
            {/* Progress Bar */}
            {step >= 2 && step <= 6 && (
              <div className="absolute top-8 right-12 w-32 h-1.5 bg-[#e0f2f3] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[#3d838c]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / STEPS_COUNT) * 100}%` }}
                />
              </div>
            )}

            {/* Content Switcher */}
            <div className="flex-1 w-full flex flex-col items-center justify-center text-center z-10">
              {step === 0 && <WelcomeScreen userName={userName} />}
              {step === 1 && <PrivacyScreen />}
              {step === 2 && <AgeScreen selected={data.age} onSelect={(a) => setData({ ...data, age: a })} />}
              {step === 3 && <OrganizationScreen selected={data.orgId} onSelect={(o) => setData({ ...data, orgId: o })} />}
              {step === 4 && <MoodScreen selected={data.mood} onSelect={(m) => setData({ ...data, mood: m })} />}
              {step === 5 && <ExperienceScreen selected={data.experience} onSelect={(e) => setData({ ...data, experience: e })} />}
              {step === 6 && <ReasonScreen selected={data.reasons} onToggle={toggleReason} />}
              {step === 7 && <FinalScreen userName={userName} />}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex flex-col items-center gap-6 z-10">
              <div className="flex items-center gap-4">
                {step === 0 && (
                  <button onClick={() => setStep(7)} className="px-10 py-3.5 rounded-2xl bg-[#f0f7f8]/80 hover:bg-[#e0f2f3] text-[#666] font-bold text-sm transition-all">
                    Skip
                  </button>
                )}
                {step > 0 && step < 7 && (
                  <button onClick={handleBack} className="px-10 py-3.5 rounded-2xl bg-[#f0f7f8]/80 hover:bg-[#e0f2f3] text-[#666] font-bold text-sm transition-all">
                    Back
                  </button>
                )}
                
                {step < 7 ? (
                  <button 
                    onClick={handleNext}
                    className="px-12 py-3.5 rounded-2xl bg-[#3d838c] hover:bg-[#2c656d] text-white font-black text-sm shadow-xl shadow-teal-200 transition-all flex items-center gap-2"
                  >
                    {step === 6 ? "Finish" : "Continue"} <span className="text-lg">→</span>
                  </button>
                ) : (
                  <button 
                    onClick={handleFinish}
                    disabled={isLoading}
                    className="px-14 py-4 rounded-2xl bg-[#3d838c] hover:bg-[#2c656d] text-white font-black text-base shadow-xl shadow-teal-200 transition-all flex items-center gap-2"
                  >
                    {isLoading ? "Starting..." : "Welcome to Attrangi!"} <span className="text-xl">→</span>
                  </button>
                )}
              </div>

              {/* Progress Dots Indicator */}
              {step < 7 && (
                <div className="flex gap-2.5">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        i === step ? "bg-[#3d838c] w-4" : "bg-[#e0f2f3]"
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

            {step === 7 && (
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
        <div className="p-6 bg-teal-50/50 rounded-3xl border border-teal-100">
           <p className="font-bold text-gray-900 mb-2">Your conversations are private.</p>
           <p>You&apos;re in control of what you share.</p>
        </div>
        <p className="text-2xl font-black text-gray-900 mt-10">You&apos;re not alone. We&apos;re here to support you.</p>
      </div>
    </div>
  )
}

function AgeScreen({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">Are you 18 or older?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <button
          onClick={() => onSelect("18")}
          className={`p-7 rounded-[32px] text-left transition-all duration-300 ${
            selected === "18" 
              ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105" 
              : "bg-gray-50 text-gray-600 hover:bg-teal-50"
          }`}
        >
          <h4 className="font-black text-lg mb-2 leading-tight">Yes, I am 18+</h4>
          <p className={`text-xs font-medium ${selected === "18" ? "text-white/80" : "text-gray-400"}`}>Student Account</p>
        </button>

        <button
          onClick={() => onSelect("17")}
          className={`p-7 rounded-[32px] text-left transition-all duration-300 ${
            selected === "17" 
              ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105" 
              : "bg-gray-50 text-gray-600 hover:bg-teal-50"
          }`}
        >
          <h4 className="font-black text-lg mb-2 leading-tight">No, I am under 18</h4>
          <p className={`text-xs font-medium ${selected === "17" ? "text-white/80" : "text-gray-400"}`}>Caregiver Account</p>
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState as useReactState } from "react"
function OrganizationScreen({ selected, onSelect }: { selected: string; onSelect: (o: string) => void }) {
  const [orgs, setOrgs] = useReactState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useReactState(true)

  useEffect(() => {
    fetch("/api/public/organizations")
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setOrgs(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="w-full max-w-lg">
      <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Are you joining from an institution?</h2>
      <p className="text-gray-500 font-medium mb-10">Select your organization to access premium benefits.</p>
      
      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading organizations...</p>
      ) : (
        <div className="space-y-4 text-left">
          <select 
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#3d838c] focus:outline-none focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-700 bg-white"
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
          >
            <option value="" disabled>Select your organization</option>
            <option value="none">I am not part of an organization</option>
            {orgs.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
          {selected === "none" && (
            <p className="text-sm text-gray-400 pl-2">You will continue with a standard account.</p>
          )}
        </div>
      )}
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
                ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-110" 
                : "bg-gray-50 text-gray-400 hover:bg-white hover:text-gray-900"
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
                ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105" 
                : "bg-gray-50 text-gray-600 hover:bg-teal-50"
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