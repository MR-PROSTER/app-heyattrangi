import { auth } from "@/auth.config"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PostSessionClient from "./PostSessionClient"

export default async function PostSessionPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/auth/unauthorized")
    }

    // Find appointment by meetingLink
    const meetingLink = `/meet/${roomId}`
    const appointment = await prisma.appointment.findFirst({
        where: { meetingLink },
        include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } }
        }
    })

    if (!appointment) {
        redirect("/auth/unauthorized")
    }

    const isDoctor = appointment.doctor.userId === session.user.id
    const isPatient = appointment.patient?.userId === session.user.id

    if (!isDoctor && !isPatient) {
        redirect("/auth/unauthorized")
    }

    const role = isDoctor ? "host" : "patient"

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <PostSessionClient appointment={appointment} role={role} />
        </div>
    )
}
