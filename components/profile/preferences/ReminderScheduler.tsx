"use client"

import { useId } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import PreferenceToggle from "./PreferenceToggle"
import WeekdaySelector from "./WeekdaySelector"
import type { MoodReminderPrefs, WeekdayKey } from "./preferenceStorage"

interface ReminderSchedulerProps {
  value: MoodReminderPrefs
  onChange: (next: MoodReminderPrefs) => void
  className?: string
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const id = useId()
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={id} className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900
          outline-none transition-all duration-150
          focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-300"
      />
    </div>
  )
}

export default function ReminderScheduler({
  value,
  onChange,
  className = "",
}: ReminderSchedulerProps) {
  const reduceMotion = useReducedMotion()
  const panelId = useId()

  const patch = (partial: Partial<MoodReminderPrefs>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className={className}>
      <PreferenceToggle
        label="Mood Reminder"
        description="Gentle check-in prompts on your chosen days."
        checked={value.enabled}
        onChange={(enabled) => patch({ enabled })}
        aria-controls={panelId}
      />

      <AnimatePresence initial={false}>
        {value.enabled ? (
          <motion.div
            id={panelId}
            key="scheduler"
            role="region"
            aria-label="Mood reminder schedule"
            initial={reduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-5 border-t border-gray-100 mt-3">
              <TimeField
                label="Reminder Time"
                value={value.reminderTime}
                onChange={(reminderTime) => patch({ reminderTime })}
              />

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
                  Quiet Hours
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TimeField
                    label="Start Time"
                    value={value.quietStart}
                    onChange={(quietStart) => patch({ quietStart })}
                  />
                  <TimeField
                    label="End Time"
                    value={value.quietEnd}
                    onChange={(quietEnd) => patch({ quietEnd })}
                  />
                </div>
              </div>

              <WeekdaySelector
                value={value.weekdays}
                onChange={(weekdays: WeekdayKey[]) => patch({ weekdays })}
              />

              <PreferenceToggle
                label="Repeat"
                description="Keep this schedule week to week."
                checked={value.repeat}
                onChange={(repeat) => patch({ repeat })}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
