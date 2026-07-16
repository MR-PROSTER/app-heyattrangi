"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PostSessionClient({ appointment, role }: { appointment: any, role: string }) {
    const router = useRouter()
    const isHost = role === "host"
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Patient State
    const [rating, setRating] = useState(0)
    const [feedback, setFeedback] = useState("")

    // Doctor State
    const [status, setStatus] = useState("COMPLETED")
    const [duration, setDuration] = useState(appointment.doctor?.appointmentDuration || 45)
    const [notes, setNotes] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/appointments/${appointment.id}/post-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    isHost 
                    ? { status, duration, notes, role } 
                    : { rating, feedback, role }
                )
            })
            if (res.ok) {
                router.push(isHost ? "/doctor/appointments" : "/patient/appointments")
            } else {
                alert("Failed to submit. Please try again.")
            }
        } catch (error) {
            console.error(error)
            alert("Error submitting form.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isHost) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900 mb-2">How was your session?</h2>
                    <p className="text-sm text-gray-500 mb-8">Your feedback helps us improve and is kept confidential.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4">Rate your experience</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                            rating >= star ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Additional feedback (Optional)</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                                placeholder="How did the session go? Any thoughts?"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || rating === 0}
                            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 py-12">
            <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Session Report</h2>
                <p className="text-sm text-gray-500 mb-8">Please complete the clinical report for {appointment.patient?.user?.name || "the patient"}.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Session Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            >
                                <option value="COMPLETED">Completed</option>
                                <option value="NO_SHOW">No Show</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Actual Duration (mins)</label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            />
                        </div>
                    </div>

                    {/* AI Report Placeholder */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <h3 className="text-sm font-bold text-blue-900">AI Session Summary (Auto-generated)</h3>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed italic">
                            Once the audio transcription pipeline is complete, the AI-generated summary will appear here to assist your clinical notes.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Clinical Notes & Case Study</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={8}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            placeholder="Enter detailed clinical notes, diagnoses, and treatment plans here..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving Report..." : "Save Clinical Report & Close Session"}
                    </button>
                </form>
            </div>
        </div>
    )
}
