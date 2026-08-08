"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SCREENERS } from "@/lib/data/screeners"
import { ArrowLeft, Check, AlertTriangle, ArrowRight, Activity } from "lucide-react"

export default function AssessmentPage() {
    const params = useParams()
    const router = useRouter()
    const screenerId = params.screenerId as string

    const [screener, setScreener] = useState<any>(null)
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [isComplete, setIsComplete] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [results, setResults] = useState<any>(null)

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

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Map index-based answers to array of { questionId, selectedValue }
            const responsePayload = Object.entries(answers).map(([idxStr, val]) => {
                const idx = parseInt(idxStr, 10)
                return {
                    questionId: screener.questions[idx].id,
                    selectedValue: val
                }
            })

            const res = await fetch('/api/patient/assessments/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    assessmentKey: screenerId,
                    responses: responsePayload
                })
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit assessment')
            }

            setResults(data.result)
        } catch (err: any) {
            console.error(err)
            setSubmitError(err.message || 'An unexpected error occurred during submission.')
        } finally {
            setIsSubmitting(false)
        }
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
                                            className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between group ${isSelected
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span className={`font-semibold text-sm ${isSelected ? "text-indigo-700" : "text-slate-600"}`}>
                                                {opt.text}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-200 group-hover:border-indigo-300"
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
                ) : isSubmitting ? (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 pb-20">
                        <div className="bg-white rounded-[32px] p-10 shadow-lg border border-slate-100 w-full text-center relative overflow-hidden flex flex-col items-center justify-center">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>

                            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
                            </div>

                            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Analyzing Responses</h2>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Calculating severity bands, checking crisis thresholds, and generating your clinical summary...
                            </p>
                        </div>
                    </div>
                ) : submitError ? (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-700 pb-20">
                        <div className="bg-white rounded-[32px] p-10 shadow-lg border border-slate-100 w-full text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-red-50"></div>

                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>

                            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Submission Failed</h2>
                            <p className="text-red-500 text-sm mb-8 font-medium">
                                {submitError}
                            </p>

                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleSubmit}
                                    className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                                >
                                    Retry Submission
                                </button>
                                <button
                                    onClick={() => setSubmitError(null)}
                                    className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-sm transition-all"
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    </div>
                ) : !results ? (
                    <div className="flex-1 flex flex-col items-center justify-center animate-in slide-in-from-bottom-8 duration-700 pb-20">
                        <div className="bg-white rounded-[32px] p-10 shadow-lg border border-slate-100 w-full text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Activity className="w-10 h-10 text-indigo-500 animate-pulse" />
                            </div>

                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Ready to Submit</h2>
                            <p className="text-slate-500 text-sm mb-8">
                                You have answered all the questions for <strong>{screener.title}</strong>. Please submit to view your clinical score and personalized recommendations.
                            </p>

                            <button
                                onClick={handleSubmit}
                                className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-full font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto active:scale-[0.98]"
                            >
                                Submit Assessment <Check className="w-5 h-5" />
                            </button>
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

                            <div className="space-y-6">
                                <div className="bg-slate-50 rounded-2xl p-6 inline-block min-w-[200px]">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Your Score</span>
                                    <div className="text-4xl font-black text-indigo-600 mb-1">{results.score}</div>
                                    <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full shadow-sm inline-block mt-2">
                                        {results.severity}
                                    </div>
                                </div>

                                {(results.interpretation || results.recommendation) && (
                                    <div className="text-left space-y-4 max-w-lg mx-auto">
                                        {results.interpretation && (
                                            <div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Interpretation</span>
                                                <p className="text-sm text-slate-600 leading-relaxed">{results.interpretation}</p>
                                            </div>
                                        )}
                                        {results.recommendation && (
                                            <div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Recommendation</span>
                                                <p className="text-sm text-slate-600 leading-relaxed">{results.recommendation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {results.hasCrisisRisk && (
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
