import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP are required" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedOtp = String(otp).replace(/\D/g, "").trim();

    // 1. Retrieve the OTP entry from DB
    const otpEntry = await prisma.loginOtp.findUnique({
      where: { email: sanitizedEmail },
    });

    // 2. Verify existence and match
    if (!otpEntry || otpEntry.otp !== sanitizedOtp) {
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

    // 4. Resolve user before deleting OTP (retry-safe)
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("not found in enum 'UserRole'")) {
        await prisma.$runCommandRaw({
          update: "users",
          updates: [
            {
              q: { email: sanitizedEmail, role: { $nin: ["PATIENT", "DOCTOR", "ADMIN", "INSTITUTION_ADMIN"] } },
              u: { $set: { role: "PATIENT" } },
            },
          ],
        });
        user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
      } else {
        throw error;
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          role: "PATIENT",
        },
      });
    }

    // 5. Delete the OTP entry from DB (prevents replay attacks / multi-use)
    await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });

    return NextResponse.json({ success: true, message: "OTP verified successfully!", user }, { status: 200 });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
