"use client"

import React, { useState } from "react"

// Core 18 Questions of the NICHQ Vanderbilt Assessment Scale
// 1-9: Inattentive Subtype
// 10-18: Hyperactive/Impulsive Subtype
const VANDERBILT_QUESTIONS = [
  { id: 1, construct: "Inattention", text: "How often do you fail to give close attention to details or make careless mistakes in your work or assignments?" },
  { id: 2, construct: "Inattention", text: "How often do you have difficulty sustaining your attention in tasks or fun activities?" },
  { id: 3, construct: "Inattention", text: "How often does it seem like you don't listen when spoken to directly?" },
  { id: 4, construct: "Inattention", text: "How often do you fail to follow through on instructions and fail to finish your work or chores?" },
  { id: 5, construct: "Inattention", text: "How often do you have difficulty organizing tasks and activities?" },
  { id: 6, construct: "Inattention", text: "How often do you avoid, dislike, or are reluctant to engage in tasks that require sustained mental effort?" },
  { id: 7, construct: "Inattention", text: "How often do you lose things necessary for tasks or activities (e.g., pens, books, tools)?" },
  { id: 8, construct: "Inattention", text: "How often are you easily distracted by extraneous stimuli or unrelated thoughts?" },
  { id: 9, construct: "Inattention", text: "How often are you forgetful in daily activities?" },
  { id: 10, construct: "Hyperactivity", text: "How often do you fidget with your hands or feet or squirm in your seat?" },
  { id: 11, construct: "Hyperactivity", text: "How often do you leave your seat in situations when remaining seated is expected?" },
  { id: 12, construct: "Hyperactivity", text: "How often do you feel restless or feel the urge to run or climb in situations where it is inappropriate?" },
  { id: 13, construct: "Hyperactivity", text: "How often do you have difficulty engaging in leisure activities quietly?" },
  { id: 14, construct: "Hyperactivity", text: "How often do you feel 'on the go' or act as if 'driven by a motor'?" },
  { id: 15, construct: "Hyperactivity", text: "How often do you talk excessively?" },
  { id: 16, construct: "Hyperactivity", text: "How often do you blurt out answers before questions have been completed?" },
  { id: 17, construct: "Hyperactivity", text: "How often do you have difficulty waiting your turn?" },
  { id: 18, construct: "Hyperactivity", text: "How often do you interrupt or intrude on others (e.g., butt into conversations or activities)?" },
]

const SCORING_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Occasionally", value: 1 },
  { label: "Often", value: 2 },
  { label: "Very Often", value: 3 },
]

export default function VanderbiltAssessmentBot() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [completed, setCompleted] = useState(false)

  // Interpretation Logic
  const calculateInsights = () => {
    let inattentionScore = 0
    let hyperactivityScore = 0

    Object.entries(answers).forEach(([qId, value]) => {
      const id = parseInt(qId)
      if (id >= 1 && id <= 9) {
        if (value >= 2) inattentionScore++ // Usually, a score of 2 or 3 is considered clinically significant on an item
      } else {
        if (value >= 2) hyperactivityScore++
      }
    })

    return {
      inattention: inattentionScore,
      hyperactivity: hyperactivityScore,
      totalSignificant: inattentionScore + hyperactivityScore
    }
  }

  const handleSelectAnswer = (value: number) => {
    setAnswers(prev => ({ ...prev, [VANDERBILT_QUESTIONS[currentStep].id]: value }))
    
    // Auto-advance
    setTimeout(() => {
      if (currentStep < VANDERBILT_QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setCompleted(true)
      }
    }, 400)
  }

  if (completed) {
    const insights = calculateInsights()
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg animate-in fade-in zoom-in duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900">Assessment Complete</h3>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mt-1">Generated Insights</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Insight Summary</h4>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Based on the Vanderbilt scale metrics, here is an overview of your responses regarding focus and activity levels.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Inattention Flags</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600">{insights.inattention}</span>
                  <span className="text-xs font-bold text-slate-500">/ 9</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Hyperactivity Flags</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-orange-600">{insights.hyperactivity}</span>
                  <span className="text-xs font-bold text-slate-500">/ 9</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <h4 className="font-bold text-lg mb-2 relative z-10">Recommended Action</h4>
            <p className="text-emerald-50 text-sm leading-relaxed relative z-10 mb-4">
              {insights.totalSignificant >= 6 
                ? "Your responses indicate patterns that might benefit from a deeper conversation. We recommend sharing these insights with a counselor or utilizing our guided focus modules."
                : "Your responses show typical ranges of focus and activity. You can explore our mindfulness and organization modules to further optimize your daily routines."}
            </p>
            <button 
                onClick={() => {
                    setStarted(false);
                    setCurrentStep(0);
                    setAnswers({});
                    setCompleted(false);
                }}
                className="inline-flex items-center gap-2 bg-white text-teal-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-50 transition-colors relative z-10 shadow-sm"
            >
              Restart Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200/80 shadow-lg relative overflow-hidden min-h-[400px] flex flex-col justify-center transition-all duration-500">
      
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      {!started ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-2xl mb-6 shadow-sm">
             <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
             </svg>
          </div>
          <h3 className="font-extrabold text-3xl text-slate-900 mb-3 tracking-tight">ADHD Screening Scale</h3>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md mb-8">
            This assessment is based on the Vanderbilt Diagnostic Rating Scale. It will help us understand your patterns of attention, focus, and activity to provide personalized insights and recommendations.
          </p>
          <button 
            onClick={() => setStarted(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-full relative z-10 animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Question {currentStep + 1} of {VANDERBILT_QUESTIONS.length}
            </span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
              {VANDERBILT_QUESTIONS[currentStep].construct}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mb-10 overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep) / VANDERBILT_QUESTIONS.length) * 100}%` }}
            ></div>
          </div>

          {/* Question Text */}
          <div className="flex-1 flex flex-col justify-center mb-10">
            <h4 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
              {VANDERBILT_QUESTIONS[currentStep].text}
            </h4>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SCORING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectAnswer(option.value)}
                className={`py-4 px-2 rounded-xl text-xs sm:text-sm font-black transition-all border-2
                  ${answers[VANDERBILT_QUESTIONS[currentStep].id] === option.value
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md transform scale-[1.02]" 
                    : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30 hover:text-emerald-700"
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
