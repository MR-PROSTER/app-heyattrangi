import Link from "next/link"
import { LEGAL_EFFECTIVE_LABEL, LEGAL_VERSION } from "@/components/profile/privacy/privacyUtils"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#fafbfc] px-4 py-10 sm:px-6">
      <article className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
          Effective {LEGAL_EFFECTIVE_LABEL} · Version {LEGAL_VERSION}
        </p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm font-medium text-gray-600 leading-relaxed">
          This policy describes how Attrangi collects, uses, and cares for personal information
          when you use our platform. We process data to provide personalized conversations, save
          your preferences, and maintain your wellness history.
        </p>
        <p className="mt-3 text-sm font-medium text-gray-600 leading-relaxed">
          For questions about privacy, contact{" "}
          <a
            href="mailto:support@heyattrangi.com"
            className="font-semibold text-gray-900 underline underline-offset-2
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            support@heyattrangi.com
          </a>
          .
        </p>
        <div className="mt-8">
          <Link
            href="/patient/profile"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5
              text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Back to Profile
          </Link>
        </div>
      </article>
    </main>
  )
}
