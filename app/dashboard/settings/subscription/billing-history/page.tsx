import { redirect } from "next/navigation"
import SettingsLayout from "@/components/settings/SettingsLayout"
import { FileText } from "lucide-react"

export default function BillingHistoryPage() {
  return (
    <SettingsLayout title="Billing history" backHref="/dashboard/settings/subscription">
      <div className="flex flex-col items-center justify-center py-16 text-center select-none">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 mb-4 border border-zinc-100">
          <FileText className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-bold text-zinc-800 mb-1">No billing history</h3>
        <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
          You don't have any billing records yet. Your invoices will appear here once generated.
        </p>
      </div>
    </SettingsLayout>
  )
}
