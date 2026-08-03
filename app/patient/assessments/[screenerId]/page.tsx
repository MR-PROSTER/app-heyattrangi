"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SCREENERS } from "@/lib/data/screeners"
import { scoreAdditionalScreener } from "@/lib/assessments/scoreAdditionalScreener"
import { ArrowLeft, Check, AlertTriangle, ArrowRight, Activity } from "lucide-react"

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const screenerId = params.screenerId as string
  
  const [screener, setScreener] = useState<any>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  
  useEffect(() => {
    if (screenerId && SCREENERS[screenerId]) {
      setScreener(SCREENERS[screenerId])
    }
  }, [screenerId])

  if (!screener) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FFF9F8]">
        <div className="text-center animate-pulse text-slate-500">Loading Assessment...</div>
      </div>
    )
  }

  const handleAnswer = (val: number) => {
    const nextAnswers = { ...answers, [currentQuestionIdx]: val }
    setAnswers(nextAnswers)
    
    // For PTSD, if it's the gate question (idx 0) and answer is No (0), we end the quiz
    if (screenerId === 'ptsd' && currentQuestionIdx === 0 && val === 0) {
      setIsComplete(true)
      return
    }

    // Skip logic from spreadsheet (C-SSRS / ASQ) — driven by screener.skipLogic
    const skip = screener.skipLogic
    if (skip?.type === 'c-ssrs' && currentQuestionIdx === skip.gateQuestionIndex && val === skip.gateNoValue) {
      setTimeout(() => setCurrentQuestionIdx(skip.jumpToIndex), 300)
      return
    }
    if (skip?.type === 'asq' && currentQuestionIdx === Math.max(...skip.gateQuestionIndices)) {
      const anyYes = skip.gateQuestionIndices.some((i: number) => (nextAnswers[i] ?? 0) > 0)
      if (!anyYes) {
        setTimeout(() => setIsComplete(true), 300)
        return
      }
    }

    if (currentQuestionIdx < screener.questions.length - 1) {
      setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 300)
    } else {
      setTimeout(() => setIsComplete(true), 300)
    }
  }

  const calculateResult = () => {
    let score = 0
    let severity = "None-minimal"
    let interpretation = ""
    let recommendation = ""
    let hasCrisisRisk = false

    if (screenerId === 'phq-9') {
      Object.values(answers).forEach(val => score += val)
      if (score <= 4) severity = "None-minimal"
      else if (score <= 9) severity = "Mild"
      else if (score <= 14) severity = "Moderate"
      else if (score <= 19) severity = "Moderately Severe"
      else severity = "Severe"
      
      // Item 9 is index 8 (9th question)
      if (answers[8] && answers[8] > 0) hasCrisisRisk = true
    } 
    else if (screenerId === 'gad-7') {
      Object.values(answers).forEach(val => score += val)
      if (score <= 4) severity = "Minimal"
      else if (score <= 9) severity = "Mild"
      else if (score <= 14) severity = "Moderate"
      else severity = "Severe"
    }
    else if (screenerId === 'asrs') {
      // Part A is first 6 questions
      let partAScore = 0
      for (let i = 0; i < 6; i++) {
        if (answers[i] !== undefined) {
          const q = screener.questions[i]
          if (answers[i] >= q.positiveThreshold) partAScore++
        }
      }
      score = partAScore
      severity = partAScore >= 4 ? "Positive Screen for ADHD" : "Negative Screen"
    }
    else if (screenerId === 'ptsd') {
      if (answers[0] === 0) {
        severity = "N/A - No trauma exposure reported"
      } else {
        // Sum the remaining 5 questions
        for (let i = 1; i <= 5; i++) {
          if (answers[i]) score += answers[i]
        }
        severity = score >= 3 ? "Positive Screen (Consider clinical follow-up)" : "Negative Screen"
      }
    }
    else if (screenerId === 'ocd') {
      Object.values(answers).forEach(val => score += val)
      severity = score >= 21 ? "Positive Screen for OCD" : "Likely Negative"
    }
    else if (screener?.scoring) {
      // New assessments: score from Excel-derived screener.scoring metadata
      return scoreAdditionalScreener(screener, answers)
    }

    return { score, severity, interpretation, recommendation, hasCrisisRisk }
  }

  const currentQuestion = screener.questions[currentQuestionIdx]
  const progress = ((currentQuestionIdx) / screener.questions.length) * 100

  return (
    <div className="flex-1 h-screen overflow-y-auto w-full bg-[#FFF9F8] text-slate-800 flex flex-col font-sans">
      <div className="p-6 md:p-8 flex-1 w-full max-w-3xl mx-auto flex flex-col">
        
        <button
          onClick={() => router.push('/patient/library')}
          className="text-[11px] font-black text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest flex items-center gap-1 mb-8 w-fit"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Library
        </button>

        {!isComplete ? (
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="font-extrabold text-3xl text-slate-800 mb-2">{screener.title}</h1>
              <p className="text-slate-500 text-sm">{screener.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mb-10 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
              <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 block">
                Question {currentQuestionIdx + 1} of {screener.questions.length}
              </span>
              <h2 className="text-2xl font-bold text-slate-800 leading-snug mb-10">
                {currentQuestion.text}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((opt: any, i: number) => {
                  const isSelected = answers[currentQuestionIdx] === opt.value
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.value)}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                        isSelected 
                          ? "border-indigo-500 bg-indigo-50" 
                          : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className={`font-semibold text-sm ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                        {opt.text}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-200 group-hover:border-indigo-300"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="text-sm font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
              >
                Previous Question
              </button>
              <span className="text-xs font-bold text-slate-300">
                {Math.round(progress)}% Completed
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-700 pb-20">
            
            {/* Results Card */}
            <div className="bg-white rounded-[32px] p-10 shadow-lg border border-slate-100 w-full text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-10 h-10 text-indigo-500" />
              </div>

              <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Assessment Complete</h2>
              <p className="text-slate-500 text-sm mb-8">Thank you for taking the time to complete the {screener.title.split(' ')[0]} screener.</p>
              
              {(() => {
                const result = calculateResult()
                return (
                  <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 inline-block min-w-[200px]">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Your Score</span>
                      <div className="text-4xl font-black text-indigo-600 mb-1">{result.score}</div>
                      <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm inline-block mt-2">
                        {result.severity}
                      </div>
                    </div>

                    {(result.interpretation || result.recommendation) && (
                      <div className="text-left space-y-4 max-w-lg mx-auto">
                        {result.interpretation && (
                          <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Interpretation</span>
                            <p className="text-sm text-slate-600 leading-relaxed">{result.interpretation}</p>
                          </div>
                        )}
                        {result.recommendation && (
                          <div>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Recommendation</span>
                            <p className="text-sm text-slate-600 leading-relaxed">{result.recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {result.hasCrisisRisk && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-left flex gap-4 mt-6">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-red-800 text-sm mb-1">Please seek immediate help</h4>
                          <p className="text-red-600 text-xs leading-relaxed">
                            Based on your responses, we strongly recommend speaking with a professional or contacting a crisis hotline immediately.
                          </p>
                          <a href="/patient/library" className="inline-block mt-3 text-xs font-bold text-red-600 border-b border-red-300 pb-0.5 hover:text-red-700">
                            View Support Hotlines &rarr;
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            <button
              onClick={() => router.push('/patient/library')}
              className="mt-10 px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Return to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-slate-400 mt-6 max-w-sm text-center">
              This is a screening tool, not a diagnostic instrument. Please consult with a qualified healthcare provider for a formal diagnosis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
