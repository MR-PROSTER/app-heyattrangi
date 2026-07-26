"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { saveAiOnboarding } from "@/app/actions/patient/onboarding"

const challengesList = [
  "Financial support", "Work support", "Self-Esteem", "Anxiety", "Caregiving support",
  "Loss", "Motivation", "Confidence", "Bullying", "Sleep", "Depression", "Health issues"
]

const heardAboutList = [
  "Search Engine", "Friend or Family", "Social Media", "My Employer", "Insurer", "Found it on my own"
]

export default function AiOnboarding() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [nickname, setNickname] = useState("")
  const [heardAbout, setHeardAbout] = useState("")
  const [age, setAge] = useState<string>("")
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const toggleChallenge = (c: string) => {
    setSelectedChallenges(prev => 
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    const res = await saveAiOnboarding({
      aiNickname: nickname,
      heardAboutUs: heardAbout,
      age: parseInt(age) || 18,
      healthConcerns: selectedChallenges
    })
    setIsSubmitting(false)
    if (res.success) {
      // Server action already revalidated the path, Next.js will auto-refresh
    }
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-[#f9f8f6] flex items-center justify-center p-0 md:p-6 font-sans">
      <div className="w-full max-w-[480px] h-full md:max-h-[800px] flex flex-col bg-white overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-none md:rounded-[32px] border-none md:border md:border-gray-100">
        
        {/* Header/Back Button */}
        <div className="p-6 flex items-center min-h-[72px] z-10 relative">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-md"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col px-8 pb-12 relative overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Nickname */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center flex-1"
              >
                <div className="w-24 h-24 bg-[#e0f7f4] rounded-full mb-8 flex items-center justify-center overflow-hidden shadow-sm">
                  <div className="relative w-16 h-16">
                    <Image src="/new_bot/Ai icon.png" alt="Bot Bear Mascot" fill className="object-contain" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-[#1a2f4c] mb-4 text-center">Hey Attrangi</h1>
                <p className="text-[#64748b] text-center mb-12 max-w-[280px] leading-relaxed font-medium">
                  Our conversations are private & anonymous. Just choose a nickname and we're good to go.
                </p>
                
                <div className="w-full relative mt-auto mb-4">
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Choose a nickname..."
                    className="w-full bg-[#f1f5f9] rounded-full py-4.5 px-6 pr-14 text-slate-800 font-medium outline-none border-2 border-transparent focus:border-[#e0f7f4] transition-colors"
                    style={{ paddingTop: '1.125rem', paddingBottom: '1.125rem' }}
                    onKeyDown={(e) => e.key === 'Enter' && nickname.trim() && nextStep()}
                  />
                  <button 
                    onClick={nextStep}
                    disabled={!nickname.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-[#e2e8f0] rounded-full flex items-center justify-center text-white disabled:opacity-40 transition-colors hover:bg-[#cbd5e1] data-[active=true]:bg-[#475569] data-[active=true]:text-white"
                    data-active={nickname.trim().length > 0}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </motion.div>
            )}

          {/* STEP 2: Heard About Us */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center flex-1 w-full"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-8 text-center">{nickname}, how did you hear about us?</h2>
              
              <div className="w-full space-y-3 flex-1 flex flex-col justify-center">
                {heardAboutList.map(option => (
                  <button
                    key={option}
                    onClick={() => { setHeardAbout(option); nextStep(); }}
                    className={`w-full py-4 px-6 rounded-2xl border-2 font-bold transition-all text-sm uppercase tracking-wide
                      ${heardAbout === option 
                        ? 'border-teal-500 bg-teal-50 text-teal-700' 
                        : 'border-slate-100 bg-white text-teal-600 hover:border-teal-200 hover:bg-teal-50'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Age */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center flex-1 w-full"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-4 text-center">{nickname}, how old are you?</h2>
              <p className="text-slate-500 text-center mb-12 text-sm max-w-[280px]">
                We would like to help you by providing appropriate support based on your age.
              </p>
              
              <div className="w-full space-y-4">
                <button
                  onClick={() => setAge("18")}
                  className={`w-full py-5 rounded-2xl font-bold transition-all
                    ${age === "18" ? 'bg-teal-200 text-teal-900' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}`}
                >
                  18 years and older
                </button>
                <button
                  onClick={() => setAge("16")}
                  className={`w-full py-5 rounded-2xl font-bold transition-all
                    ${age === "16" ? 'bg-teal-300 text-teal-900' : 'bg-teal-200/60 text-teal-800 hover:bg-teal-300'}`}
                >
                  13-17 years old
                </button>
              </div>

              <div className="mt-auto w-full">
                <button 
                  onClick={nextStep}
                  disabled={!age}
                  className="w-full py-4 rounded-full border-2 border-[#c57e33] text-[#c57e33] font-bold uppercase tracking-widest disabled:opacity-50 disabled:border-slate-300 disabled:text-slate-400"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Challenges */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center flex-1 w-full"
            >
              <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">{nickname}, build your space...</h2>
              <p className="text-slate-500 text-center mb-8 text-sm">
                Add challenges that you would like help with to your space.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full mb-8 overflow-y-auto pr-2 pb-4">
                {challengesList.map((c, i) => {
                  const isSelected = selectedChallenges.includes(c);
                  // Generate pastel colors based on index for the reference look
                  const colors = ['bg-indigo-50', 'bg-cyan-50', 'bg-yellow-50', 'bg-rose-50', 'bg-green-50', 'bg-blue-50', 'bg-orange-50'];
                  const bgClass = isSelected ? 'bg-slate-800 text-white shadow-md' : `${colors[i % colors.length]} text-slate-700`;

                  return (
                    <button
                      key={c}
                      onClick={() => toggleChallenge(c)}
                      className={`p-4 rounded-2xl text-sm font-semibold transition-all min-h-[80px] flex items-center justify-center text-center border ${isSelected ? 'border-slate-800' : 'border-transparent hover:border-slate-200'} ${bgClass}`}
                    >
                      {c}
                    </button>
                  )
                })}
              </div>

              <div className="mt-auto w-full flex flex-col gap-3">
                {selectedChallenges.length === 0 ? (
                  <button 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full border-2 border-[#c57e33] text-[#c57e33] font-bold uppercase tracking-widest bg-white"
                  >
                    Maybe Later
                  </button>
                ) : (
                  <button 
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-[#c57e33] text-white font-bold uppercase tracking-widest hover:bg-[#a96622]"
                  >
                    {isSubmitting ? "Saving..." : "That's All"}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  )
}
