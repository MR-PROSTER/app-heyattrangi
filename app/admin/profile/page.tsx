import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import ProfileForm from "@/components/profile/AdminProfileForm"

export default async function AdminProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/auth/unauthorized")
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-400">
          Account settings
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
          Profile settings
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Update your personal information for the internal admin account.
        </p>
      </div>

      <ProfileForm user={user} role="ADMIN" />
    </section>
  )
}

