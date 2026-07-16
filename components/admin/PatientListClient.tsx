"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Patient = {
    id: string
    name: string | null
    email: string | null
}

export default function PatientListClient({ patients }: { patients: Patient[] }) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleSendNote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedPatient || !title || !message) return

        setIsSubmitting(true)
        try {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: selectedPatient.id,
                    title,
                    message,
                })
            })

            if (res.ok) {
                alert("Note sent successfully!")
                setSelectedPatient(null)
                setTitle("")
                setMessage("")
                router.refresh()
            } else {
                alert("Failed to send note.")
            }
        } catch (error) {
            console.error(error)
            alert("Error sending note.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-5xl mx-auto mt-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-900">Registered Patients</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {patients.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-medium">No patients found.</div>
                    ) : (
                        patients.map(patient => (
                            <div key={patient.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-lg">
                                        {patient.name?.[0]?.toUpperCase() || "P"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{patient.name || "Unknown Patient"}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{patient.email || "No email"}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(patient)}
                                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-2 px-5 rounded-full transition-colors text-sm shadow-sm"
                                >
                                    Send Note
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-900">Send Note to {selectedPatient.name}</h3>
                            <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSendNote} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Note Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Action Required: Update Profile"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium resize-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPatient(null)}
                                    className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 rounded-full font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
                                >
                                    {isSubmitting ? "Sending..." : "Send Note"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
