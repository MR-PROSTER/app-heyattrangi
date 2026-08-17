"use client"

import { useState } from "react"
import SettingsLayout from "@/components/settings/SettingsLayout"
import { Search, ChevronDown, HelpCircle } from "lucide-react"

const FAQ_DATA = [
  {
    q: "What is Hey Attrangi?",
    a: "Hey Attrangi is a personal wellbeing space where you can check in, reflect, talk things through, and explore tools that support your wellbeing.",
  },
  {
    q: "What can I talk to Hey Attrangi about?",
    a: "You can talk about your thoughts, feelings, everyday experiences, stress, relationships, college life, or anything that's on your mind.",
  },
  {
    q: "Is Hey Attrangi a therapist?",
    a: "No. Hey Attrangi is a wellbeing companion, not a replacement for a qualified mental-health professional.",
  },
  {
    q: "How does my mood history work?",
    a: "Your mood check-ins are saved to help you look back at how you've been feeling over time.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can manage your privacy and data settings from Settings → Privacy & Data.",
  },
  {
    q: "Who can see my information?",
    a: "Your personal wellbeing information is private. Institution-sponsored features may have separate policies explaining what information is shared with the institution.",
  },
  {
    q: "What happens if I need professional help?",
    a: "Hey Attrangi can support reflection and wellbeing, but it cannot provide emergency or clinical care. If you feel you may be in immediate danger, seek help from a qualified professional or local emergency service.",
  },
  {
    q: "How do I get help with a technical problem?",
    a: "Use Report a Problem or contact us at support@heyattrangi.com.",
  },
]

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFaqs = FAQ_DATA.filter((faq) =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <SettingsLayout
      title="Frequently asked questions"
      backHref="/dashboard/settings/contact-support"
      maxWidthClass="max-w-[430px]"
    >
      <div className="w-full space-y-5 select-none animate-in fade-in duration-300 text-left pt-2">
        {/* Search Field */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setOpenIndex(null) // Reset accordion expansion on search change for clean transition
            }}
            className="w-full h-12 pl-12 pr-4 rounded-[20px] bg-white border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.01)] focus:outline-none focus:border-zinc-300 font-semibold text-[14px] text-[#1C2038] placeholder-zinc-400 transition-colors"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = openIndex === idx
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] overflow-hidden"
                >
                  <button
                    id={`faq-question-${idx}`}
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${idx}`}
                    onClick={() => handleToggle(idx)}
                    className="w-full px-5 py-4.5 flex items-center justify-between text-left gap-4 hover:bg-zinc-50/20 active:bg-zinc-50/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 rounded-[24px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 text-amber-500 border border-amber-100/10">
                        <HelpCircle className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-[#1C2038] font-bold text-[14.5px] leading-tight">
                        {faq.q}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-zinc-400 stroke-[2.5] shrink-0 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5 pt-1 border-t border-zinc-50/50">
                      <p className="text-zinc-500 text-[13px] font-semibold leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="w-full text-center py-12 px-4">
              <p className="text-zinc-400 font-semibold text-[14px]">
                No questions found.
              </p>
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  )
}
