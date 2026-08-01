import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Missing email parameter" },
        { status: 400 }
      );
    }

    const sanitizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: sanitizedEmail,
      },
      select: {
        id: true,
        role: true,
        orgId: true,
      },
    });

    return NextResponse.json({
      exists: !!user,
      role: user?.role ?? null,
      orgId: user?.orgId ?? null,
    });
  } catch (error) {
    console.error("Error checking user existence:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
