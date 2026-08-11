import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import ProfileForm from "@/components/profile/AdminProfileForm"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-xl font-semibold text-gray-800 hover:text-gray-600">
                Attrangi - Admin Panel
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-600">Profile</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Update your personal information
          </p>
        </div>

        <ProfileForm user={user} role="ADMIN" />
      </main>
    </div>
  )
}


