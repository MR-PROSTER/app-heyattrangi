import LoadingSkeleton from "@/components/settings/LoadingSkeleton"
import SettingsLayout from "@/components/settings/SettingsLayout"

export default function SettingsLoading() {
  return (
    <SettingsLayout title="Settings" backHref="/dashboard/profile">
      <LoadingSkeleton rows={6} />
    </SettingsLayout>
  )
}
