import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/auth.config"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AdminShell from "@/components/admin/AdminShell"
import { withPerf } from "@/lib/perf"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return withPerf("AdminLayout", async () => {
    const session = await auth()

    if (!session?.user) {
      redirect("/auth/signin")
    }

    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      redirect("/auth/unauthorized")
    }

    const headerList = await headers()
    const pathname = headerList.get("x-pathname") || "/admin/dashboard"
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return (
      <AdminShell pathname={pathname} userName={user.name} organizations={organizations}>
        {children}
      </AdminShell>
    )
  })
}
