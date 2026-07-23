import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    const domain = email.split("@")[1].toLowerCase();

    // Find organization matching the domain
    const org = await prisma.organization.findFirst({
      where: {
        domains: {
          has: domain,
        },
      },
    });

    if (!org) {
      return NextResponse.json(
        { message: `No organization found matching the domain @${domain}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      orgName: org.name,
      orgId: org.id,
    });
  } catch (error) {
    console.error("Error checking SSO organization:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
