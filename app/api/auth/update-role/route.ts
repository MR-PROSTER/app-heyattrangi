import { NextResponse } from "next/server";
import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role } = await req.json();

    if (role !== "PATIENT" && role !== "DOCTOR") {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        role,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
