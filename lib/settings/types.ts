/**
 * Settings menu IA — label + route only (handoff).
 */

export interface SettingsMenuItem {
  id: string
  href: string
  label: string
  /** When true, row is only shown for Committed-tier members */
  committedOnly?: boolean
}

export const SETTINGS_MENU: SettingsMenuItem[] = [
  {
    id: "personal-details",
    href: "/dashboard/settings/personal-details",
    label: "Personal Details",
  },
  {
    id: "emergency-contact",
    href: "/dashboard/settings/emergency-contact",
    label: "Emergency Contact",
    committedOnly: true,
  },
  {
    id: "language",
    href: "/dashboard/settings/language",
    label: "Language",
  },
  {
    id: "notifications",
    href: "/dashboard/settings/notifications",
    label: "Notifications",
  },
  {
    id: "privacy",
    href: "/dashboard/settings/privacy",
    label: "Privacy & Consent",
  },
  {
    id: "subscription",
    href: "/dashboard/settings/subscription",
    label: "Subscription",
  },
]

export function settingsMenuForTier(isCommitted: boolean): SettingsMenuItem[] {
  return SETTINGS_MENU.filter((item) => (item.committedOnly ? isCommitted : true))
}
