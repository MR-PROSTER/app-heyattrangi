import { redirect } from "next/navigation"
import { Suspense } from "react"
import { getCurrentUser } from "@/lib/auth"
import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import LanguageSettings from "@/components/settings/language/LanguageSettings"
import LanguageHeader from "./LanguageHeader"

async function Content() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  return (
    <LanguageSettings
      userId={user.id}
      currentLanguage={user.patient?.preferredLanguage || "English"}
    />
  )
}

export default function LanguageSettingsPage() {
  return (
    <div className="min-h-screen w-full bg-[#FAF5F0] flex flex-col pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none animate-in fade-in duration-300">
      <LanguageHeader />
      <main className="flex-1 w-full max-w-[430px] mx-auto px-6 py-2">
        <Suspense fallback={<LoadingSkeleton rows={5} />}>
          <Content />
        </Suspense>
      </main>
    </div>
  )
}
