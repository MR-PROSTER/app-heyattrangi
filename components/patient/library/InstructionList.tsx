"use client"

interface InstructionListProps {
  instructions: string[]
}

export default function InstructionList({ instructions }: InstructionListProps) {
  return (
    <ol className="space-y-3">
      {instructions.map((step, index) => (
        <li
          key={index}
          className="flex gap-3.5 rounded-2xl border border-slate-100/90 bg-white/80 px-4 py-3.5 shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-transform duration-200 hover:translate-x-0.5"
        >
          <span className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-600 text-xs font-black flex items-center justify-center shadow-sm">
            {index + 1}
          </span>
          <div className="min-w-0 pt-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Step {index + 1}
            </p>
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {step}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
