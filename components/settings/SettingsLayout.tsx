import type { ReactNode } from "react"
import SettingsHeader from "./SettingsHeader"

interface SettingsLayoutProps {
  title: string
  /** Sub-pages: /dashboard/settings. Menu: /dashboard/profile. */
  backHref?: string
  children: ReactNode
  maxWidthClass?: string
}

/** Off-white page shell for Settings. */
export default function SettingsLayout({
  title,
  backHref = "/dashboard/settings",
  children,
  maxWidthClass = "max-w-lg",
}: SettingsLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--color-bg)]">
      <div className={`mx-auto flex w-full min-w-0 flex-1 flex-col min-h-0 h-full ${maxWidthClass}`}>
        <SettingsHeader title={title} backHref={backHref} />
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
