"use client"

interface BeginButtonProps {
  activityTitle: string
  onBegin?: () => void
  className?: string
}

export default function BeginButton({
  activityTitle,
  onBegin,
  className = "",
}: BeginButtonProps) {
  return (
    <button
      type="button"
      onClick={onBegin}
      aria-label={`Begin ${activityTitle}`}
      className={`w-full rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-[16px] py-4 px-6 shadow-[0_10px_28px_rgba(249,115,22,0.28)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_14px_36px_rgba(249,115,22,0.35)] active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 ${className}`}
    >
      Begin
    </button>
  )
}
