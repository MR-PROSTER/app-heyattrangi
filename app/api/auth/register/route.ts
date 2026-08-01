import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to PATIENT if not provided or invalid
    const allowedRoles = ["DOCTOR", "PATIENT", "INSTITUTION_ADMIN"] as const
    const userRole = allowedRoles.includes(role as (typeof allowedRoles)[number])
      ? (role as (typeof allowedRoles)[number])
      : "PATIENT";

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: userRole,
        ...(userRole === "INSTITUTION_ADMIN" ? { plan: "ORGANIZATION" } : {}),
      },
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
