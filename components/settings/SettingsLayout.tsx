import type { ReactNode } from "react"
import SettingsHeader from "./SettingsHeader"

interface SettingsLayoutProps {
  title: string
  /** Sub-pages: /dashboard/settings. Menu: /dashboard/profile. */
  backHref?: string
  children: ReactNode
}

/** Off-white page shell for Settings. */
export default function SettingsLayout({
  title,
  backHref = "/dashboard/settings",
  children,
}: SettingsLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[var(--color-bg)]">
      <div className="mx-auto flex w-full max-w-lg min-w-0 flex-1 flex-col">
        <SettingsHeader title={title} backHref={backHref} />
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
