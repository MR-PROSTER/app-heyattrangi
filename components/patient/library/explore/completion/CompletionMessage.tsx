"use client"

interface CompletionMessageProps {
  primary: string
  secondary?: string | null
}

export default function CompletionMessage({
  primary,
  secondary,
}: CompletionMessageProps) {
  return (
    <div className="text-center space-y-2 max-w-sm mx-auto px-2">
      <p className="font-bold text-[17px] sm:text-lg text-slate-700 tracking-tight leading-snug">
        {primary}
      </p>
      {secondary && (
        <p className="text-slate-500 font-medium text-sm sm:text-[15px] leading-relaxed">
          {secondary}
        </p>
      )}
    </div>
  )
}
