"use client"

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import FieldStatus from "../identity/FieldStatus"
import InlineActions from "../identity/InlineActions"
import RelationshipSelect from "./RelationshipSelect"

export type EmergencyFieldType = "text" | "tel" | "relationship"

interface EmergencyContactFieldProps {
  label: string
  value: string
  type?: EmergencyFieldType
  placeholder?: string
  isEditing: boolean
  isSaving?: boolean
  error?: string | null
  onStartEdit: () => void
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
  autoComplete?: string
  emptyLabel?: string
  className?: string
}

export default function EmergencyContactField({
  label,
  value,
  type = "text",
  placeholder,
  isEditing,
  isSaving = false,
  error = null,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
  autoComplete,
  emptyLabel = "Not set",
  className = "",
}: EmergencyContactFieldProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const reduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && type !== "relationship") {
      inputRef.current?.focus()
    }
  }, [isEditing, type])

  const shown = value?.trim() ? value : emptyLabel
  const isEmpty = !value?.trim()

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && type !== "relationship") {
      e.preventDefault()
      onSave()
    }
    if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  let control: ReactNode = null
  if (isEditing) {
    if (type === "relationship") {
      control = (
        <RelationshipSelect
          id={inputId}
          value={value}
          disabled={isSaving}
          error={error}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              onCancel()
            }
          }}
        />
      )
    } else {
      control = (
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          disabled={isSaving}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium
            outline-none transition-all duration-150
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-60"
        />
      )
    }
  }

  return (
    <div
      className={`rounded-xl border border-transparent p-1 -m-1 transition-all duration-150
        ${isEditing ? "bg-gray-50/90 border-gray-100 shadow-sm" : "hover:bg-gray-50/70"}
        ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5 px-0.5">
        <label
          htmlFor={isEditing ? inputId : undefined}
          className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400"
        >
          {label}
        </label>
        {!isEditing && (
          <button
            type="button"
            onClick={onStartEdit}
            className="inline-flex items-center min-h-8 px-1.5 -mr-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded"
          >
            Edit
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {isEditing ? (
          <motion.div
            key="edit"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {control}
            {error && type !== "relationship" ? (
              <p id={errorId} className="text-xs font-semibold text-red-500 px-0.5" role="alert">
                {error}
              </p>
            ) : null}
            <InlineActions onSave={onSave} onCancel={onCancel} isSaving={isSaving}>
              <FieldStatus status={isSaving ? "saving" : "idle"} />
            </InlineActions>
          </motion.div>
        ) : (
          <motion.button
            key="view"
            type="button"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onStartEdit}
            className={`w-full text-left text-sm font-semibold px-0.5 py-1 rounded-lg transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1
              ${isEmpty ? "text-gray-400" : "text-gray-900"}`}
          >
            {shown}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
