import type { ReactNode } from "react"
import SettingsHeader from "./SettingsHeader"

interface SettingsLayoutProps {
  title: string
  /** Sub-pages: /dashboard/settings. Menu: /dashboard/profile. */
  backHref?: string
  children: ReactNode
  maxWidthClass?: string
}

export default function SettingsLayout({
  title,
  backHref = "/dashboard/settings",
  children,
  maxWidthClass = "max-w-[430px]",
}: SettingsLayoutProps) {
  return (
    <div className="flex min-h-full w-full flex-col bg-[var(--color-bg)]">
      <div className={`mx-auto flex w-full min-w-0 flex-1 flex-col min-h-0 ${maxWidthClass}`}>
        <SettingsHeader title={title} backHref={backHref} />
        <div className="flex-1 px-4 min-[360px]:px-5 pt-1 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  )
}
