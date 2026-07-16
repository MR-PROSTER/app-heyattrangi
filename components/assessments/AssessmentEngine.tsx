"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { triageQuestions, screeners, TriageQuestion, Screener } from "@/lib/data/assessmentEngine"

type ChatMessage = {
    id: string
    role: "bot" | "user"
    text: string
}

type Phase = "intro" | "triage" | "screener" | "calculating" | "results"

export default function AssessmentEngine() {
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Flow State
    const [phase, setPhase] = useState<Phase>("intro")
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: "intro_1", role: "bot", text: "Hey 👋" },
        { id: "intro_2", role: "bot", text: "Let's understand how you're doing today. This takes about 5-10 minutes." }
    ])
    
    // Triage State
    const [triageIndex, setTriageIndex] = useState(0)
    const [triggeredScreeners, setTriggeredScreeners] = useState<Set<string>>(new Set())
    
    // Screener State
    const [activeScreenerQueue, setActiveScreenerQueue] = useState<string[]>([])
    const [currentScreenerId, setCurrentScreenerId] = useState<string | null>(null)
    const [screenerQuestionIndex, setScreenerQuestionIndex] = useState(0)
    const [screenerScores, setScreenerScores] = useState<Record<string, number>>({})

    // Results State
    const [finalResults, setFinalResults] = useState<any>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatHistory, phase])

    // Delay helper to make it feel conversational
    const addBotMessage = (text: string, delayMs = 600) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setChatHistory(prev => [...prev, { id: Date.now().toString(), role: "bot", text }])
                resolve()
            }, delayMs)
        })
    }

    const handleStartTriage = async () => {
        setPhase("triage")
        await addBotMessage(triageQuestions[0].text, 400)
    }

    const handleTriageAnswer = async (option: any) => {
        // Record user answer
        setChatHistory(prev => [...prev, { id: Date.now().toString(), role: "user", text: option.label }])
        
        // Track triggered screeners
        if (option.triggerScreener) {
            setTriggeredScreeners(prev => new Set(prev).add(option.triggerScreener))
        }

        const nextIndex = triageIndex + 1
        if (nextIndex < triageQuestions.length) {
            setTriageIndex(nextIndex)
            await addBotMessage(triageQuestions[nextIndex].text, 600)
        } else {
            // Triage complete
            const queue = Array.from(triggeredScreeners)
            if (queue.length > 0) {
                setActiveScreenerQueue(queue)
                const firstScreener = queue[0]
                setCurrentScreenerId(firstScreener)
                setScreenerQuestionIndex(0)
                setPhase("screener")
                
                await addBotMessage("Thanks for sharing that.", 600)
                await addBotMessage(screeners[firstScreener].intro, 800)
                await addBotMessage(screeners[firstScreener].questions[0].text, 800)
            } else {
                // No screeners triggered, go straight to results
                await addBotMessage("Thank you for sharing. Based on your answers, you seem to be doing relatively okay right now.", 600)
                finishAssessment()
            }
        }
    }

    const handleScreenerAnswer = async (option: { label: string, value: number }) => {
        if (!currentScreenerId) return

        // Record user answer
        setChatHistory(prev => [...prev, { id: Date.now().toString(), role: "user", text: option.label }])
        
        // Update score for current screener
        setScreenerScores(prev => ({
            ...prev,
            [currentScreenerId]: (prev[currentScreenerId] || 0) + option.value
        }))

        const currentScreener = screeners[currentScreenerId]
        const nextIndex = screenerQuestionIndex + 1

        if (nextIndex < currentScreener.questions.length) {
            setScreenerQuestionIndex(nextIndex)
            await addBotMessage(currentScreener.questions[nextIndex].text, 500)
        } else {
            // Finished current screener, move to next in queue if exists
            const currentQueueIndex = activeScreenerQueue.indexOf(currentScreenerId)
            const nextQueueIndex = currentQueueIndex + 1

            if (nextQueueIndex < activeScreenerQueue.length) {
                const nextScreener = activeScreenerQueue[nextQueueIndex]
                setCurrentScreenerId(nextScreener)
                setScreenerQuestionIndex(0)
                await addBotMessage("Got it. Let's move on to the next set of questions.", 600)
                await addBotMessage(screeners[nextScreener].intro, 800)
                await addBotMessage(screeners[nextScreener].questions[0].text, 800)
            } else {
                finishAssessment()
            }
        }
    }

    const finishAssessment = async () => {
        setPhase("calculating")
        await addBotMessage("Thank you for completing the assessment. I'm analyzing your responses now...", 800)
        
        setTimeout(() => {
            calculateFinalResults()
            setPhase("results")
        }, 2000)
    }

    const calculateFinalResults = async () => {
        const results: any = {}
        const allRecommendations = new Set<string>()

        for (const [screenerId, score] of Object.entries(screenerScores)) {
            const screener = screeners[screenerId]
            const rule = screener.scoring.find(r => score >= r.min && score <= r.max)
            
            results[screenerId] = {
                name: screener.name,
                score,
                severity: rule?.severity || "Unknown"
            }

            if (rule?.recommendations) {
                rule.recommendations.forEach(r => allRecommendations.add(r))
            }
        }

        const payload = {
            assessmentId: Date.now().toString(), // Mock UUID
            date: new Date().toISOString().split('T')[0],
            results,
            recommendations: Array.from(allRecommendations)
        }

        setFinalResults(payload)

        // Save to DB (mock endpoint for now)
        try {
            await fetch('/api/patient/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
        } catch (e) {
            console.error("Failed to save assessment", e)
        }
    }


    return (
        <div className="flex flex-col h-full bg-white w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-full overflow-hidden flex items-center justify-center bg-orange-50/50">
                        <Image src="/new_bot/neutral.png" alt="Bot" fill className="object-contain p-1" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">Assessment Engine</h2>
                        <p className="text-xs text-slate-500 font-medium">Guided clinical screener</p>
                    </div>
                </div>
                <button 
                    onClick={() => router.push('/patient/library')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider"
                >
                    Cancel
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-white relative scroll-smooth">
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'bot' && (
                             <div className="w-10 h-10 relative flex-shrink-0 mr-4 mt-1 bg-orange-50/50 rounded-full">
                                 <Image src="/new_bot/neutral.png" alt="Bot" fill className="object-contain p-1" />
                             </div>
                        )}
                        <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm text-base font-semibold' 
                                : 'bg-white text-slate-900 border border-slate-100 shadow-md rounded-tl-sm text-xl md:text-2xl font-bold tracking-tight'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                
                {phase === "calculating" && (
                     <div className="flex justify-start animate-pulse">
                         <div className="w-10 h-10 relative flex-shrink-0 mr-4 mt-1 bg-orange-50/50 rounded-full">
                             <Image src="/new_bot/neutral.png" alt="Bot" fill className="object-contain p-1" />
                         </div>
                         <div className="bg-white text-slate-400 p-5 rounded-2xl rounded-tl-sm border border-slate-100 shadow-md text-lg font-medium">
                             typing...
                         </div>
                     </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input / Options Area */}
            <div className="bg-white border-t border-slate-200 p-4 md:p-6 z-10 min-h-[140px] flex flex-col justify-center">
                {phase === "intro" && (
                    <div className="flex justify-center">
                        <button 
                            onClick={handleStartTriage}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all uppercase tracking-wider text-sm"
                        >
                            Start Assessment
                        </button>
                    </div>
                )}

                {phase === "triage" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                        {triageQuestions[triageIndex]?.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleTriageAnswer(opt)}
                                className="bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 hover:shadow-md text-slate-800 font-bold py-5 px-6 rounded-2xl transition-all text-lg text-left"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {phase === "screener" && currentScreenerId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
                        {screeners[currentScreenerId].questions[screenerQuestionIndex]?.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleScreenerAnswer(opt)}
                                className="bg-white border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 hover:shadow-md text-slate-800 font-bold py-5 px-6 rounded-2xl transition-all text-lg text-left"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {phase === "results" && finalResults && (
                    <div className="max-w-2xl mx-auto w-full text-center">
                        <button 
                            onClick={() => router.push('/patient/library')}
                            className="bg-slate-800 hover:bg-black text-white font-bold py-3 px-8 rounded-full shadow-md transition-all uppercase tracking-wider text-sm"
                        >
                            Return to Library
                        </button>
                    </div>
                )}
            </div>
            
            {/* Results Overlay overlay on top if finished */}
            {phase === "results" && finalResults && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
                    <div className="w-full max-w-2xl">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Assessment Summary</h2>
                            <p className="text-slate-500 font-medium">Completed on {finalResults.date}</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
                            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Clinical Domains</h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {Object.keys(finalResults.results).length === 0 ? (
                                     <div className="p-6 text-center text-slate-500 font-medium">No major concerns detected.</div>
                                ) : (
                                    Object.values(finalResults.results).map((res: any, idx: number) => (
                                        <div key={idx} className="p-6 flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{res.name.split(' ')[0]}</h4>
                                                <span className="text-sm text-slate-500 font-medium">{res.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex px-4 py-1.5 rounded-full font-bold text-sm ${
                                                    res.severity.includes("Severe") ? "bg-red-100 text-red-700" :
                                                    res.severity.includes("Moderate") ? "bg-orange-100 text-orange-700" :
                                                    res.severity.includes("Mild") ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-green-100 text-green-700"
                                                }`}>
                                                    {res.severity} (Score: {res.score})
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {finalResults.recommendations.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-12">
                                <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4">
                                    <h3 className="font-bold text-indigo-900 uppercase tracking-wider text-sm">Recommended Actions</h3>
                                </div>
                                <div className="p-6">
                                    <ul className="space-y-4">
                                        {finalResults.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <span className="text-slate-700 font-medium">{rec}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <button 
                                onClick={() => router.push('/patient/library')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-10 rounded-full shadow-lg transition-all uppercase tracking-wider text-sm"
                            >
                                Return to Library
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
