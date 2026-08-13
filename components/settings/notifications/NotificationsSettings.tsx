"use client"

import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"
import {
  DEFAULT_PREFERENCES,
  readPreferences,
  writePreferences,
  type MoodReminderPrefs,
} from "@/components/profile/preferences/preferenceStorage"

interface NotificationsSettingsProps {
  userId: string
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
const PERIODS = ["AM", "PM"] as const

function parseTime24(timeStr: string) {
  const [hourStr, minStr] = timeStr.split(":")
  const hour = parseInt(hourStr || "0", 10)
  const minute = parseInt(minStr || "0", 10)
  const period = (hour >= 12 ? "PM" : "AM") as "AM" | "PM"
  const hour12 = hour % 12 || 12
  return { hour12, minute, period }
}

function formatTime24(hour12: number, minute: number, period: "AM" | "PM"): string {
  let hour24 = hour12 % 12
  if (period === "PM") {
    hour24 += 12
  }
  const hrStr = String(hour24).padStart(2, "0")
  const minStr = String(minute).padStart(2, "0")
  return `${hrStr}:${minStr}`
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ""
  const { hour12, minute, period } = parseTime24(timeStr)
  const minPad = String(minute).padStart(2, "0")
  return `${hour12}:${minPad} ${period}`
}

export default function NotificationsSettings({ userId }: NotificationsSettingsProps) {
  const [mood, setMood] = useState<MoodReminderPrefs>(DEFAULT_PREFERENCES.moodReminder)
  const [ready, setReady] = useState(false)
  const [editingReminderTime, setEditingReminderTime] = useState(false)
  const [editingQuietHours, setEditingQuietHours] = useState(false)

  useEffect(() => {
    const prefs = readPreferences(userId)
    setMood({ ...DEFAULT_PREFERENCES.moodReminder, ...prefs.moodReminder })
    setReady(true)
  }, [userId])

  const persist = (next: MoodReminderPrefs) => {
    const previous = mood
    setMood(next)
    try {
      const prefs = readPreferences(userId)
      writePreferences({ ...prefs, moodReminder: next }, userId)
    } catch {
      setMood(previous)
      toast.error("Couldn't update reminder preference")
    }
  }

  if (!ready) {
    return (
      <div className="pt-2" aria-busy="true">
        <div className="h-40 rounded-3xl bg-[var(--color-border)] animate-pulse motion-reduce:animate-none" />
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4 animate-in fade-in duration-300">
      <Toaster position="top-center" richColors closeButton />

      <div className="bg-white rounded-[28px] border border-[#EDE6DF] p-[clamp(20px,6vw,34px)] shadow-sm flex flex-col">
        {/* Row 1: Remind me to check in */}
        <div className="flex items-center justify-between py-1">
          <span className="text-zinc-900 font-bold text-[clamp(18px,5.5vw,24px)] leading-[1.2] tracking-tight whitespace-nowrap">
            Remind me to check in
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={mood.enabled}
            onClick={() => persist({ ...mood, enabled: !mood.enabled })}
            className={`relative inline-flex h-[clamp(30px,8.5vw,38px)] w-[clamp(52px,15vw,68px)] shrink-0 items-center rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#759F8C] focus-visible:ring-offset-2 cursor-pointer
              ${mood.enabled ? "bg-[#759F8C]" : "bg-zinc-200"}`}
          >
            <span
              aria-hidden="true"
              className={`absolute top-1/2 -translate-y-1/2 size-[clamp(22px,6.5vw,28px)] rounded-full bg-white shadow transition-all duration-150
                ${mood.enabled ? "right-[clamp(3px,1vw,4px)]" : "left-[clamp(3px,1vw,4px)]"}`}
            />
          </button>
        </div>

        {/* Separator */}
        <div className="border-t border-[#EDE6DF]/60 my-[clamp(12px,3.5vw,20px)]" />

        {/* Row 2: Daily reminder at */}
        <div className={`flex flex-col transition-opacity duration-200 ${!mood.enabled ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-zinc-500 font-medium text-[clamp(17px,5vw,22px)] leading-[1.25] whitespace-nowrap">
              Daily reminder at
            </span>
            <button
              onClick={() => setEditingReminderTime(!editingReminderTime)}
              className="bg-[#FAF6F0] hover:bg-[#F3ECE3] min-w-[clamp(110px,32vw,140px)] px-[clamp(14px,4vw,22px)] py-[clamp(10px,3vw,16px)] rounded-2xl text-[clamp(14px,4vw,18px)] font-bold text-zinc-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {formatTime(mood.reminderTime)}
            </button>
          </div>

          {editingReminderTime && mood.enabled && (
            <div className="flex items-center justify-center gap-2 pb-2.5 pt-2.5 px-3 bg-[#FAF6F0]/40 rounded-2xl mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <select
                value={parseTime24(mood.reminderTime).hour12}
                onChange={(e) => {
                  const { minute, period } = parseTime24(mood.reminderTime)
                  const nextVal = formatTime24(parseInt(e.target.value, 10), minute, period)
                  persist({ ...mood, reminderTime: nextVal })
                }}
                className="flex-1 max-w-[80px] bg-white border border-[#EDE6DF] rounded-xl px-2 py-2 text-[14px] font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
              >
                {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
              </select>
              <span className="text-zinc-400 font-bold">:</span>
              <select
                value={parseTime24(mood.reminderTime).minute}
                onChange={(e) => {
                  const { hour12, period } = parseTime24(mood.reminderTime)
                  const nextVal = formatTime24(hour12, parseInt(e.target.value, 10), period)
                  persist({ ...mood, reminderTime: nextVal })
                }}
                className="flex-1 max-w-[80px] bg-white border border-[#EDE6DF] rounded-xl px-2 py-2 text-[14px] font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
              >
                {MINUTES.map(m => <option key={m} value={parseInt(m, 10)}>{m}</option>)}
              </select>
              <select
                value={parseTime24(mood.reminderTime).period}
                onChange={(e) => {
                  const { hour12, minute } = parseTime24(mood.reminderTime)
                  const nextVal = formatTime24(hour12, minute, e.target.value as "AM" | "PM")
                  persist({ ...mood, reminderTime: nextVal })
                }}
                className="flex-1 max-w-[80px] bg-white border border-[#EDE6DF] rounded-xl px-2 py-2 text-[14px] font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
              >
                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-[#EDE6DF]/60 my-[clamp(12px,3.5vw,20px)]" />

        {/* Row 3: Quiet hours */}
        <div className={`flex flex-col transition-opacity duration-200 ${!mood.enabled ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-zinc-500 font-medium text-[clamp(17px,5vw,22px)] leading-[1.25] whitespace-nowrap">
              Quiet hours
            </span>
            <button
              onClick={() => setEditingQuietHours(!editingQuietHours)}
              className="bg-[#FAF6F0] hover:bg-[#F3ECE3] px-[clamp(12px,4vw,20px)] py-[clamp(10px,3vw,16px)] rounded-2xl text-[clamp(13px,4vw,18px)] font-bold text-zinc-900 transition-colors cursor-pointer whitespace-nowrap"
            >
              {formatTime(mood.quietStart)} – {formatTime(mood.quietEnd)}
            </button>
          </div>

          {editingQuietHours && mood.enabled && (
            <div className="flex flex-col gap-3 pb-3 pt-3 px-3 bg-[#FAF6F0]/40 rounded-2xl mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {/* Start Time Section */}
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[12px] text-zinc-500 font-bold uppercase tracking-wider">Start Time</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={parseTime24(mood.quietStart).hour12}
                    onChange={(e) => {
                      const { minute, period } = parseTime24(mood.quietStart)
                      const nextVal = formatTime24(parseInt(e.target.value, 10), minute, period)
                      persist({ ...mood, quietStart: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                  </select>
                  <span className="text-zinc-300 font-bold">:</span>
                  <select
                    value={parseTime24(mood.quietStart).minute}
                    onChange={(e) => {
                      const { hour12, period } = parseTime24(mood.quietStart)
                      const nextVal = formatTime24(hour12, parseInt(e.target.value, 10), period)
                      persist({ ...mood, quietStart: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {MINUTES.map(m => <option key={m} value={parseInt(m, 10)}>{m}</option>)}
                  </select>
                  <select
                    value={parseTime24(mood.quietStart).period}
                    onChange={(e) => {
                      const { hour12, minute } = parseTime24(mood.quietStart)
                      const nextVal = formatTime24(hour12, minute, e.target.value as "AM" | "PM")
                      persist({ ...mood, quietStart: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Divider inside the tray */}
              <div className="border-t border-[#EDE6DF]/30 my-0.5" />

              {/* End Time Section */}
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-[12px] text-zinc-500 font-bold uppercase tracking-wider">End Time</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={parseTime24(mood.quietEnd).hour12}
                    onChange={(e) => {
                      const { minute, period } = parseTime24(mood.quietEnd)
                      const nextVal = formatTime24(parseInt(e.target.value, 10), minute, period)
                      persist({ ...mood, quietEnd: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {HOURS.map(h => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
                  </select>
                  <span className="text-zinc-300 font-bold">:</span>
                  <select
                    value={parseTime24(mood.quietEnd).minute}
                    onChange={(e) => {
                      const { hour12, period } = parseTime24(mood.quietEnd)
                      const nextVal = formatTime24(hour12, parseInt(e.target.value, 10), period)
                      persist({ ...mood, quietEnd: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {MINUTES.map(m => <option key={m} value={parseInt(m, 10)}>{m}</option>)}
                  </select>
                  <select
                    value={parseTime24(mood.quietEnd).period}
                    onChange={(e) => {
                      const { hour12, minute } = parseTime24(mood.quietEnd)
                      const nextVal = formatTime24(hour12, minute, e.target.value as "AM" | "PM")
                      persist({ ...mood, quietEnd: nextVal })
                    }}
                    className="w-[64px] bg-white border border-[#EDE6DF] rounded-xl px-1.5 py-1.5 text-xs font-bold text-zinc-800 text-center cursor-pointer shadow-sm hover:border-[#759F8C] transition-colors focus:outline-none"
                  >
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Helper Text */}
        <p className={`text-zinc-400/80 text-[clamp(14px,4.2vw,18px)] font-medium leading-[1.5] mt-[clamp(12px,3.5vw,20px)] text-left transition-opacity duration-200 ${!mood.enabled ? "opacity-40" : ""}`}>
          We'll never disturb you during quiet hours.
        </p>
      </div>
    </div>
  )
}
