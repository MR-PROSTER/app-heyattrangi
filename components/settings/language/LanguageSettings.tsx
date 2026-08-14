"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { Globe, ChevronDown, Check } from "lucide-react"
import {
  isSettingsLanguage,
  listSettingsLanguages,
  type SettingsLanguage,
} from "@/lib/settings/languages"
import {
  readPreferences,
  writePreferences,
} from "@/components/profile/preferences/preferenceStorage"

interface LanguageSettingsProps {
  userId: string
  currentLanguage: string
}

export default function LanguageSettings({
  userId,
  currentLanguage,
}: LanguageSettingsProps) {
  const router = useRouter()
  const languages = listSettingsLanguages()
  const seeded = isSettingsLanguage(currentLanguage) ? currentLanguage : "English"
  const [selected, setSelected] = useState<SettingsLanguage>(seeded)
  const [saving, setSaving] = useState(false)

  const handleSelect = async (lang: SettingsLanguage) => {
    if (saving || lang === selected) return
    const previous = selected
    setSelected(lang)
    setSaving(true)
    try {
      const prefs = readPreferences(userId, lang)
      writePreferences({ ...prefs, language: lang }, userId)

      const response = await fetch("/api/profile/patient", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage: lang }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error || "Failed to save language")
      }
      toast.success(`Language set to ${lang}`)
      router.refresh()
    } catch (e) {
      setSelected(previous)
      toast.error(e instanceof Error ? e.message : "Couldn't update language")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-[430px] mx-auto select-none animate-in fade-in duration-300 space-y-6">
      <Toaster position="top-center" richColors closeButton />

      <div className="space-y-3">
        <span className="text-[12px] min-[360px]:text-[13px] font-black text-[#8E8B83] tracking-[0.15em] uppercase ml-1 block text-left">
          App Language
        </span>

        {/* Outer Rounded Container Card */}
        <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.015)] border border-zinc-100">
          
          {/* Header Row */}
          <div className="w-full px-5 py-4.5 flex items-center justify-between border-b border-zinc-50 bg-zinc-50/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border bg-zinc-50 border-zinc-100">
                <Globe className="w-5.5 h-5.5 text-[#1C2038] stroke-[2.5]" />
              </div>
              <span className="text-[15px] min-[360px]:text-[16px] font-bold text-[#1C2038] tracking-tight">
                Language
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-400">
              <span className="text-[14px] font-bold text-[#8E8B83]">
                {selected}
              </span>
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          {/* List of Options */}
          <div className="divide-y divide-zinc-50">
            {languages.map((lang) => {
              const active = selected === lang
              return (
                <button
                  key={lang}
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSelect(lang)}
                  className={`w-full px-6 py-4 flex items-center justify-between transition-colors duration-150 cursor-pointer text-left ${
                    active ? "bg-zinc-50/20" : "hover:bg-zinc-50/40"
                  }`}
                >
                  <span className={`text-[15px] min-[360px]:text-[16px] tracking-wide font-medium ${
                    active ? "font-bold text-[#1C2038]" : "text-zinc-700 font-semibold"
                  }`}>
                    {lang}
                  </span>
                  {active && (
                    <Check className="w-5 h-5 text-[#E8722A] stroke-[3.5]" />
                  )}
                </button>
              )
            })}
          </div>

        </div>
      </div>

      <span className="block text-center text-[12.5px] font-bold text-zinc-400 italic">
        More languages are coming soon.
      </span>

    </div>
  )
}
