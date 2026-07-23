import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // 1. Retrieve the OTP entry from DB
    const otpEntry = await prisma.loginOtp.findUnique({
      where: { email: sanitizedEmail },
    });

    // 2. Verify existence and match
    if (!otpEntry || otpEntry.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP code" }, { status: 400 });
    }

    // 3. Check expiration (5-minute window)
    const expiryTime = new Date(otpEntry.createdAt);
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);

    if (new Date() > expiryTime) {
      // Clean up expired entry
      await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });
      return NextResponse.json({ success: false, message: "OTP has expired" }, { status: 400 });
    }

    // 4. Delete the OTP entry from DB (prevents replay attacks / multi-use)
    await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });

    // 5. If user does not exist yet, create a default patient profile for registration
    let user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          role: "PATIENT",
        },
      });
    }

    return NextResponse.json({ success: true, message: "OTP verified successfully!", user }, { status: 200 });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
