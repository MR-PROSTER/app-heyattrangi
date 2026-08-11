import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DoctorProfileSettings from "@/components/profile/DoctorProfileSettings"

export default async function DoctorProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await getCurrentUser()

  if (!user || user.role !== "DOCTOR") {
    redirect("/auth/unauthorized")
  }

  // Fetch doctor details with availability
  const doctor = await prisma.doctor.findUnique({
    where: { userId: user?.id || "" },
    include: {
      availability: true,
    },
  })

  if (!doctor) {
    redirect("/auth/unauthorized")
  }

  return (
    <div className="flex-1 h-full w-full bg-white">
      <DoctorProfileSettings 
        user={user} 
        doctor={doctor} 
        session={session} 
      />
    </div>
  )
}
