import Link from "next/link"
import TermsAndConditionsContent from "@/components/legal/TermsAndConditionsContent"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg,#fafbfc)] px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="font-poppins text-[22px] sm:text-[28px] font-bold text-[#243460]">
            Terms &amp; Conditions
          </h1>
          <Link
            href="/dashboard/settings/privacy"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 bg-white px-4
              text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d838c] focus-visible:ring-offset-2"
          >
            Back
          </Link>
        </div>

        <article className="rounded-[32px] border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="max-h-[80vh] overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-50/20">
            <TermsAndConditionsContent />
          </div>
        </article>
      </div>
    </main>
  )
}
