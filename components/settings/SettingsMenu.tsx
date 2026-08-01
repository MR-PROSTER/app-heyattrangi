import SettingsRow from "./SettingsRow"
import type { SettingsMenuItem } from "@/lib/settings/types"

interface SettingsMenuProps {
  items: SettingsMenuItem[]
}

/** Clean settings list — not a dashboard. */
export default function SettingsMenu({ items }: SettingsMenuProps) {
  return (
    <nav aria-label="Settings" className="mt-2 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <ul className="m-0 p-0">
        {items.map((item, index) => (
          <SettingsRow
            key={item.id}
            item={item}
            showDivider={index < items.length - 1}
          />
        ))}
      </ul>
    </nav>
  )
}
