import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PatientListClient from "@/components/admin/PatientListClient"

export default async function PatientsAdminPage() {
  const session = await auth()
  const user = await getCurrentUser()

  if (!session?.user || user?.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  // Fetch all users with role PATIENT
  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Users
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Patients and accounts
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Browse patient accounts from inside the shared admin shell.
        </p>
      </div>

      <PatientListClient patients={patients} />
    </section>
  )
}
