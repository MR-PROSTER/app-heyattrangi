import Link from "next/link"

export default function ListenTrackNotFound() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-[#F9F8F3] px-6 text-center">
      <p className="text-[16px] font-medium text-[#4A4A4A]">
        This track could not be found.
      </p>
      <Link
        href="/patient/library?mode=listen"
        className="text-[14px] font-medium text-[#4A4A4A] underline-offset-2 hover:text-[#1A1A1A] hover:underline"
      >
        ← Back to Explore
      </Link>
    </div>
  )
}
