"use client"

interface ActivityDescriptionProps {
  text: string
}

export default function ActivityDescription({ text }: ActivityDescriptionProps) {
  return (
    <section aria-labelledby="activity-description-heading" className="space-y-3">
      <h2
        id="activity-description-heading"
        className="text-[13px] font-bold uppercase tracking-widest text-slate-400"
      >
        About this activity
      </h2>
      <p className="text-slate-600 font-medium text-[15px] md:text-base leading-relaxed max-w-2xl">
        {text}
      </p>
    </section>
  )
}
