import { redirect } from "next/navigation"
import { auth } from "@/auth.config"

export default async function Home() {
  const session = await auth()

  // Redirect authenticated users to their dashboards
  if (session?.user) {
    const role = session.user.role
    switch (role) {
      case "PATIENT":
        redirect("/patient/dashboard")
      case "DOCTOR":
        redirect("/doctor/dashboard")
      case "ADMIN":
        redirect("/admin/dashboard")
      case "INSTITUTION_ADMIN":
        redirect("/institution")
      default:
        redirect("/auth")
    }
  }

  // Signed-out users should land on auth welcome.
  redirect("/auth")
}
