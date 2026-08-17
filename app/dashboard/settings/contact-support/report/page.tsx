"use client"

import { useState } from "react"
import SettingsLayout from "@/components/settings/SettingsLayout"
import { ChevronDown, AlertCircle } from "lucide-react"

export default function ReportProblemPage() {
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const isEnabled = issueType !== "" && description.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnabled || isSubmitting) return

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const res = await fetch("/api/support/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Issue: ${issueType}\n\nDescription: ${description}`,
        }),
      })

      if (!res.ok) {
        throw new Error("API submission failed")
      }

      setSubmitStatus("success")
      // Do not clear the fields immediately so they can be viewed, but reset form logic
    } catch (err) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSubmitStatus("idle")
  }

  return (
    <SettingsLayout
      title="Something not working?"
      backHref="/dashboard/settings/contact-support"
      maxWidthClass="max-w-[430px]"
    >
      <div className="w-full space-y-6 select-none animate-in fade-in duration-300 text-left pt-2">
        {submitStatus === "success" ? (
          /* Confirmation / Success State */
          <div className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] text-center space-y-6">
            {/* Success Checkmark Animation/Illustration */}
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100/20">
              <svg
                className="w-8 h-8 text-emerald-500 stroke-[3]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-[#1C2038] font-black text-[20px] tracking-tight">
                Thanks for letting us know.
              </h2>
              <p className="text-zinc-500 text-[14px] font-semibold leading-relaxed px-4">
                We've received your report. Our team will look into it.
              </p>
            </div>

            <button
              onClick={() => {
                setIssueType("")
                setDescription("")
                setSubmitStatus("idle")
              }}
              className="w-full h-14 bg-zinc-50 hover:bg-zinc-100 text-[#1C2038] text-[15px] font-black rounded-3xl transition-all flex items-center justify-center cursor-pointer border border-zinc-200/50"
            >
              Submit another issue
            </button>
          </div>
        ) : (
          /* Form Page */
          <>
            <p className="text-zinc-500 text-[14px] font-semibold leading-relaxed px-1">
              Tell us what happened. Your report will be sent to the Attrangi team so we can look into it.
            </p>

            {submitStatus === "error" && (
              <div className="bg-rose-50 border border-rose-100/50 rounded-2xl p-4 flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[13px] font-black text-rose-800 block">
                    Something went wrong.
                  </span>
                  <span className="text-zinc-500 text-[12.5px] font-semibold block">
                    We couldn't send your report right now. Please try again.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* FIELD 1: What went wrong? */}
              <div className="bg-white rounded-[24px] border border-zinc-100 p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] relative focus-within:border-zinc-200 transition-colors">
                <label className="text-[11px] font-extrabold text-zinc-400 tracking-[0.15em] uppercase block text-left mb-1.5">
                  What went wrong?
                </label>
                <div className="relative">
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full appearance-none pr-8 text-[15px] font-bold text-[#1C2038] bg-transparent outline-none cursor-pointer focus:ring-0 p-0"
                  >
                    <option value="" disabled hidden>
                      Select an issue
                    </option>
                    <option value="Something isn't loading">Something isn't loading</option>
                    <option value="Chat isn't working">Chat isn't working</option>
                    <option value="Mood / Journal issue">Mood / Journal issue</option>
                    <option value="Assessment issue">Assessment issue</option>
                    <option value="Account or login issue">Account or login issue</option>
                    <option value="Payment / subscription issue">Payment / subscription issue</option>
                    <option value="Something else">Something else</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none stroke-[2.5]" />
                </div>
              </div>

              {/* FIELD 2: Tell us more */}
              <div className="bg-white rounded-[24px] border border-zinc-100 p-4.5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] focus-within:border-zinc-200 transition-colors">
                <label className="text-[11px] font-extrabold text-zinc-400 tracking-[0.15em] uppercase block text-left mb-1.5">
                  Tell us more
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? Include anything that might help us understand the problem."
                  disabled={isSubmitting}
                  className="w-full h-36 text-[14.5px] font-semibold text-[#1C2038] placeholder-zinc-400 bg-transparent resize-none focus:outline-none leading-relaxed"
                />
              </div>

              {/* CTA Button */}
              {submitStatus === "error" ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full h-14 bg-[#FF6B4A] hover:bg-[#E85A3A] active:scale-[0.98] text-white text-[15px] font-black rounded-3xl shadow-sm transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  Try again
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isEnabled || isSubmitting}
                  className={`w-full h-14 font-black text-[15px] rounded-3xl shadow-sm transition-all flex items-center justify-center cursor-pointer select-none ${
                    isSubmitting
                      ? "bg-zinc-100 text-zinc-400 cursor-wait"
                      : isEnabled
                      ? "bg-[#FF6B4A] hover:bg-[#E85A3A] text-white active:scale-[0.98]"
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Send Report"
                  )}
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </SettingsLayout>
  )
}
