"use client"

interface ReadonlyFieldProps {
  label: string
  value: string
  hint?: string
  title?: string
  className?: string
}

export default function ReadonlyField({
  label,
  value,
  hint,
  title,
  className = "",
}: ReadonlyFieldProps) {
  return (
    <div
      className={`rounded-xl border border-transparent px-1 py-2 transition-colors duration-150 hover:bg-gray-50/80 ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-1.5">
        {label}
      </p>
      <p
        className="text-sm font-semibold text-gray-900 break-all"
        title={title || value}
      >
        {value || "—"}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] text-gray-400 font-medium leading-snug">{hint}</p>
      ) : null}
    </div>
  )
}
