"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Activity, AlertTriangle, Brain, ListChecks, MessageSquare } from "lucide-react"
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
    const [who5Score, setWho5Score] = useState(0)
    
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

        // Track WHO-5 Score
        if (option.who5Value !== undefined) {
            setWho5Score(prev => prev + option.who5Value)
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
        const rawFindings: any[] = []

        // 1. Collect all findings (WHO-5 is treated separately or as a base finding)
        let who5Interpretation = "Good Wellbeing"
        if (who5Score < 13) who5Interpretation = "Poor Wellbeing"
        if (who5Score < 5) who5Interpretation = "Very Poor Wellbeing"

        rawFindings.push({
            id: 'who5',
            name: "WHO-5 Wellbeing",
            fullName: "WHO-5 Wellbeing Index",
            score: who5Score,
            severity: who5Interpretation,
            priorityWeight: 20,
            confidenceLevel: "High",
            recommendations: who5Interpretation.includes("Poor") ? ["Consider tracking your mood daily", "Focus on sleep and nutrition"] : []
        })

        for (const [screenerId, score] of Object.entries(screenerScores)) {
            const screener = screeners[screenerId]
            const rule = screener.scoring.find(r => score >= r.min && score <= r.max)
            
            // Add if it's flagged or we want to record it
            if (rule && rule.severity !== "Minimal") {
                rawFindings.push({
                    id: screenerId,
                    name: screener.name.split(" ")[0], // e.g. "PHQ-9" or "PTSD"
                    fullName: screener.name,
                    score,
                    severity: rule.severity,
                    priorityWeight: screener.priorityWeight,
                    confidenceLevel: screener.confidenceLevel,
                    recommendations: rule.recommendations || []
                })
            }
        }

        // 2. Sort findings by priority weight (highest first)
        rawFindings.sort((a, b) => b.priorityWeight - a.priorityWeight)

        // 3. Generate Overall Assessment Sentence
        let overallAssessment = "Your responses indicate generally stable wellbeing with no major clinical flags."
        const flaggedClinical = rawFindings.filter(f => f.id !== 'who5' && f.severity !== "Minimal")
        
        if (flaggedClinical.length > 0) {
            const topNames = flaggedClinical.slice(0, 2).map(f => `${f.severity.toLowerCase()} ${f.name} symptoms`)
            overallAssessment = `Your responses suggest symptoms that may be consistent with ${topNames.join(" together with ")}.`
            if (flaggedClinical.length > 2) {
                overallAssessment += ` Some of your answers also indicate other areas that should be explored further.`
            }
            overallAssessment += " These screening results are not a diagnosis, but they help identify which areas may benefit from further evaluation."
        } else if (who5Score < 13) {
            overallAssessment = "While no specific clinical domains were strongly flagged, your overall wellbeing score suggests you are currently going through a difficult time."
        }

        // 4. Generate AI Interpretation
        let aiInterpretation = "No significant clinical symptoms were detected. Continue to monitor your wellbeing."
        if (flaggedClinical.length > 0) {
            aiInterpretation = `The combination of ${flaggedClinical.slice(0, 2).map(f => f.name).join(" and ")} symptoms is notable. `
            if (flaggedClinical.some(f => f.confidenceLevel === "Screening only")) {
                aiInterpretation += `Several screening questions also suggest additional areas of concern. Because these were identified by brief screeners, a comprehensive clinical assessment is recommended before drawing conclusions.`
            } else {
                aiInterpretation += `Please discuss these results with a healthcare provider to determine an appropriate care plan.`
            }
        }

        // 5. Structure Prioritized Action Plan
        const topPriorities: any[] = []
        const additionalFindings: any[] = []
        const selfHelp: string[] = []
        
        rawFindings.forEach((finding, idx) => {
            if (finding.id === 'who5' && finding.severity === "Good Wellbeing") return;
            
            if (topPriorities.length < 3 && finding.id !== 'who5') {
                topPriorities.push({
                    condition: finding.fullName,
                    status: finding.severity,
                    recommendation: finding.recommendations[0] || "Requires further evaluation."
                })
            } else if (finding.id !== 'who5') {
                additionalFindings.push({
                    condition: finding.fullName,
                    status: finding.severity,
                    recommendation: finding.recommendations[0] || "Monitor symptoms."
                })
            }
            
            // Add remaining recommendations to self-help if applicable
            if (finding.recommendations.length > 1) {
                selfHelp.push(...finding.recommendations.slice(1))
            }
        })

        const payload = {
            assessmentId: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
            overallAssessment,
            confidenceLevels: rawFindings,
            topPriorities,
            additionalFindings,
            selfHelp: Array.from(new Set(selfHelp)),
            aiInterpretation
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
                <div className="absolute inset-0 bg-slate-50 z-20 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Clinical Assessment Report</h2>
                            <p className="text-slate-500 font-medium text-lg">Completed on {finalResults.date}</p>
                        </div>

                        {/* Section 1: Overall Assessment */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                            <div className="bg-indigo-600 px-8 py-5">
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                                    <Activity className="w-5 h-5" /> 1. Overall Assessment
                                </h3>
                            </div>
                            <div className="p-8">
                                <p className="text-xl text-slate-800 leading-relaxed font-medium">
                                    {finalResults.overallAssessment}
                                </p>
                            </div>
                        </div>

                        {/* Section 2: Confidence Levels */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                            <div className="bg-slate-100 border-b border-slate-200 px-8 py-5">
                                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-indigo-600" /> 2. Findings & Confidence
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="py-4 px-8 font-semibold text-slate-600 text-sm">Domain</th>
                                            <th className="py-4 px-8 font-semibold text-slate-600 text-sm">Status</th>
                                            <th className="py-4 px-8 font-semibold text-slate-600 text-sm">Confidence</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {finalResults.confidenceLevels.map((finding: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="py-4 px-8 font-bold text-slate-900">{finding.fullName}</td>
                                                <td className="py-4 px-8">
                                                    <span className={`inline-flex px-3 py-1 rounded-md font-bold text-xs ${
                                                        finding.severity.includes("Severe") || finding.severity.includes("Very Poor") ? "bg-red-100 text-red-700" :
                                                        finding.severity.includes("Moderate") || finding.severity.includes("Poor") ? "bg-orange-100 text-orange-700" :
                                                        finding.severity.includes("Mild") || finding.severity.includes("Flagged") ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-green-100 text-green-700"
                                                    }`}>
                                                        {finding.severity}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-8">
                                                    <span className={`inline-flex items-center gap-1.5 font-medium text-sm ${
                                                        finding.confidenceLevel === "High" ? "text-indigo-600" : "text-slate-500"
                                                    }`}>
                                                        {finding.confidenceLevel === "High" && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                                                        {finding.confidenceLevel}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Prioritized Action Plan */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                            <div className="bg-slate-100 border-b border-slate-200 px-8 py-5">
                                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <ListChecks className="w-5 h-5 text-indigo-600" /> 3. Prioritized Action Plan
                                </h3>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                {/* Top Priorities */}
                                <div>
                                    <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Top Priorities
                                    </h4>
                                    <ul className="space-y-4">
                                        {finalResults.topPriorities.length > 0 ? finalResults.topPriorities.map((item: any, idx: number) => (
                                            <li key={idx} className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                                                <div className="font-bold text-slate-900 mb-1">{item.recommendation}</div>
                                                <div className="text-sm text-slate-600">Reason: <span className="font-medium text-slate-800">{item.condition} ({item.status})</span></div>
                                            </li>
                                        )) : <li className="text-slate-500 italic">No urgent clinical actions required.</li>}
                                    </ul>
                                </div>

                                {/* Additional Findings */}
                                {finalResults.additionalFindings.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-bold text-slate-800 mb-4">Additional Assessments Recommended</h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {finalResults.additionalFindings.map((item: any, idx: number) => (
                                                <li key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                    <span className="font-medium text-slate-700">{item.condition}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Self Help */}
                                {finalResults.selfHelp.length > 0 && (
                                    <div>
                                        <h4 className="text-md font-bold text-slate-800 mb-4">Self-Help Strategies</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {finalResults.selfHelp.map((item: string, idx: number) => (
                                                <span key={idx} className="bg-indigo-50 text-indigo-700 font-medium px-4 py-2 rounded-full text-sm">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 4: AI Clinical Interpretation */}
                        <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden mb-12">
                            <div className="bg-slate-800 border-b border-slate-700 px-8 py-5">
                                <h3 className="font-bold text-indigo-300 uppercase tracking-wider text-sm flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" /> 4. AI Clinical Interpretation
                                </h3>
                            </div>
                            <div className="p-8 text-slate-300 leading-relaxed text-lg italic">
                                "{finalResults.aiInterpretation}"
                            </div>
                        </div>

                        <div className="text-center">
                            <button 
                                onClick={() => router.push('/patient/library')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-lg transition-all uppercase tracking-wider text-sm"
                            >
                                Acknowledge & Return to Library
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
