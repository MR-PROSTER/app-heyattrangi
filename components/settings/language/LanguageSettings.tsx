"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
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

/**
 * Current language + selectable list. Persists to preferences + patient.preferredLanguage.
 * Architecture supports future localization via SETTINGS_LANGUAGES.
 */
export default function LanguageSettings({
  userId,
  currentLanguage,
}: LanguageSettingsProps) {
  const router = useRouter()
  const languages = listSettingsLanguages()
  const seeded = isSettingsLanguage(currentLanguage) ? currentLanguage : "English"
  const [selected, setSelected] = useState<SettingsLanguage>(seeded)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSelect = async (lang: SettingsLanguage) => {
    if (saving || lang === selected) {
      setOpen(false)
      return
    }
    const previous = selected
    setSelected(lang)
    setOpen(false)
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
    <div className="space-y-4 pt-2">
      <Toaster position="top-center" richColors closeButton />

      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current language ${selected}. Open language list`}
        disabled={saving}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-11 items-center justify-between rounded-[var(--radius-xl)] border border-[var(--color-border)]
          bg-[var(--color-surface)] px-4 py-3.5 text-left transition-colors duration-150
          hover:bg-[var(--color-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2
          disabled:opacity-60"
      >
        <span>
          <span className="block text-[var(--text-xs)] font-bold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
            Current language
          </span>
          <span className="mt-1 block text-[var(--text-base)] font-medium text-[var(--color-text-primary)]">
            {selected}
          </span>
        </span>
        <span className="text-[var(--text-sm)] font-semibold text-[var(--color-brand)]">
          {open ? "Close" : "Change"}
        </span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Languages"
          aria-busy={saving}
          className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          {languages.map((lang, index) => {
            const active = selected === lang
            return (
              <li key={lang} className="list-none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={saving}
                  onClick={() => void handleSelect(lang)}
                  className="flex w-full min-h-11 items-center justify-between px-4 py-3.5 text-left text-[var(--text-base)] font-medium
                    text-[var(--color-text-primary)] transition-colors duration-150 hover:bg-[var(--color-bg)]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]
                    disabled:opacity-60"
                >
                  {lang}
                  {active ? (
                    <span className="text-[var(--color-brand)]" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
                {index < languages.length - 1 ? (
                  <div className="h-px w-full bg-[var(--color-border)]" role="separator" />
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
