import { redirect } from "next/navigation"

export default function PatientProfileRedirectPage() {
  redirect("/dashboard/profile")
}
