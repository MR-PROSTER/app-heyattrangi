"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import SettingsLayout from "@/components/settings/SettingsLayout"
import { toast, Toaster } from "sonner"

export default function ReportProblemPage() {
  const router = useRouter()
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEnabled = description.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEnabled || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Send a mock/test report api request or simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      toast.success("Thank you! Your report has been submitted successfully.")
      setDescription("")
      setTimeout(() => {
        router.push("/dashboard/settings/contact-support")
      }, 1500)
    } catch (err) {
      toast.error("Unable to submit report. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <SettingsLayout title="Report a problem" backHref="/dashboard/settings/contact-support" maxWidthClass="max-w-[430px]">
      <Toaster position="top-center" richColors closeButton />
      
      <div className="w-full space-y-6 select-none text-left animate-in fade-in duration-300">
        
        {/* Helper Instructions */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100 space-y-2">
          <h2 className="text-zinc-800 font-extrabold text-[16px] leading-tight">
            Help us improve Attrangi
          </h2>
          <p className="text-zinc-500 text-[13px] font-semibold leading-normal">
            Briefly describe the issue you encountered. Screenshots or steps to reproduce are highly helpful.
          </p>
        </div>

        {/* Input box */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-150 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What went wrong?"
              disabled={isSubmitting}
              className="w-full h-44 text-[14px] font-semibold text-zinc-800 placeholder-zinc-400 bg-transparent resize-none focus:outline-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!isEnabled || isSubmitting}
            className={`w-full h-14 font-black text-sm rounded-3xl shadow-sm transition-all text-center flex items-center justify-center cursor-pointer ${
              isSubmitting
                ? "bg-zinc-200 text-zinc-400 cursor-wait"
                : isEnabled
                ? "bg-[#E8722A] hover:bg-[#C05C1A] text-white"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Submit Report"
            )}
          </button>
        </form>

      </div>
    </SettingsLayout>
  )
}
