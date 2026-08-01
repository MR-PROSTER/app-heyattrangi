import { Suspense } from "react"
import WellnessScreeningForm from "@/components/ai-bot/WellnessScreeningForm"
import { auth } from "@/auth.config"
import { redirect } from "next/navigation"

export default async function AIBotScreeningPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="flex-1 min-w-0 h-full overflow-y-auto w-full bg-[var(--color-bg)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1
              className="font-semibold text-[var(--color-text-primary)]"
              style={{ fontSize: "var(--text-xl)" }}
            >
              Wellness screening
            </h1>
            <p
              className="mt-0.5 text-[var(--color-text-secondary)]"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Mind Matrix &amp; support
            </p>
          </div>
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-[var(--color-brand)]"
            style={{ background: "var(--color-brand-light)" }}
          >
            AI
          </div>
        </div>
      </header>

      <main className="flex-1 bg-[var(--color-bg)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div
            className="mb-8 rounded-[var(--radius-md)] bg-[var(--color-accent-light)] p-4 text-[var(--color-text-primary)]"
            style={{ fontSize: "var(--text-sm)" }}
          >
            <p className="mb-1 font-semibold">Disclaimer</p>
            <p>
              This tool is for mental wellness screening and self-reflection only. It does not provide medical or psychological diagnoses. If you are in crisis, please seek professional help immediately.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
                Loading…
              </div>
            }
          >
            <WellnessScreeningForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
