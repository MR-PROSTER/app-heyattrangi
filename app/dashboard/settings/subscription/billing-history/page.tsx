import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SettingsLayout from "@/components/settings/SettingsLayout"
import { FileText } from "lucide-react"

export default async function BillingHistoryPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "PATIENT") redirect("/auth/unauthorized")

  // Fetch subscription transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  // Fetch patient record to check for appointment payments
  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
  })

  let mappedPayments: any[] = []
  if (patient) {
    const payments = await prisma.payment.findMany({
      where: { appointment: { patientId: patient.id } },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    mappedPayments = payments.map((p) => ({
      id: p.id,
      type: "APPOINTMENT",
      amount: p.amount,
      status: p.status === "PAID" ? "SUCCESS" : p.status,
      description: `Session with ${p.appointment.doctor?.user?.name || "Therapist"}`,
      createdAt: p.createdAt,
    }))
  }

  const mappedTransactions = transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    status: t.status,
    description: t.description,
    createdAt: t.createdAt,
  }))

  const combined = [...mappedTransactions, ...mappedPayments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30)

  return (
    <SettingsLayout title="Billing history" backHref="/dashboard/settings/subscription" maxWidthClass="max-w-[430px]">
      <div className="w-full space-y-4 select-none animate-in fade-in duration-300">
        {combined.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center select-none">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 mb-4 border border-zinc-100">
              <FileText className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-800 mb-1">No billing history</h3>
            <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">
              You don't have any billing records yet. Your invoices will appear here once generated.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {combined.map((txn, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_12px_rgba(0,0,0,0.005)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      txn.type === "SUBSCRIPTION" ? "bg-[#FFF5F2] text-[#FF6B4A]" : "bg-zinc-50 text-zinc-400"
                    }`}
                  >
                    {txn.type === "SUBSCRIPTION" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 8h10M7 12h10M7 16h10" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-4 h-4"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-[13.5px] text-zinc-800 truncate max-w-[200px]">{txn.description}</h4>
                    <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      {new Date(txn.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • TXN-{txn.id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block font-extrabold text-[14px] text-zinc-800">₹{txn.amount.toFixed(2)}</span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingsLayout>
  )
}
