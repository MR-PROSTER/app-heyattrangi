import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    // Check for common domain typos
    const domain = sanitizedEmail.split("@")[1];
    const gmailTypos = [
      "gamil.com", "gamil.co", "gmaill.com", "gmaill.co", "gmail.co",
      "giali.com", "giali.co", "gimal.com", "gimal.co", "gmal.com",
      "gmal.co", "gml.com", "gml.co", "gmail.cm", "gmail.om",
      "gmaile.com", "gmeil.com", "gmial.com", "gail.com", "gmai.com"
    ];
    const yahooTypos = ["yaho.com", "yhoo.com", "yhaoo.com", "yahoo.co"];
    const hotmailTypos = ["hotmal.com", "hotmial.com", "hotmail.co"];
    const outlookTypos = ["outlok.com", "outlook.co"];

    if (gmailTypos.includes(domain)) {
      return NextResponse.json({ 
        success: false, 
        message: `Did you mean gmail.com? Please correct "${domain}" and try again.` 
      }, { status: 400 });
    }
    if (yahooTypos.includes(domain)) {
      return NextResponse.json({ 
        success: false, 
        message: `Did you mean yahoo.com? Please correct "${domain}" and try again.` 
      }, { status: 400 });
    }
    if (hotmailTypos.includes(domain)) {
      return NextResponse.json({ 
        success: false, 
        message: `Did you mean hotmail.com? Please correct "${domain}" and try again.` 
      }, { status: 400 });
    }
    if (outlookTypos.includes(domain)) {
      return NextResponse.json({ 
        success: false, 
        message: `Did you mean outlook.com? Please correct "${domain}" and try again.` 
      }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("EMAIL_USER or EMAIL_PASS environment variables are not set");
      return NextResponse.json({ success: false, message: "Email service is not configured" }, { status: 500 });
    }

    // 1. Generate a secure, random 6-digit code (100000 to 999999 inclusive)
    const otp = randomInt(100000, 1000000).toString();

    // 2. Save or update the OTP in the database (upsert avoids unique constraint race conditions)
    await prisma.loginOtp.upsert({
      where: { email: sanitizedEmail },
      update: {
        otp,
        createdAt: new Date(),
      },
      create: {
        email: sanitizedEmail,
        otp,
        createdAt: new Date(),
      },
    });

    try {
      // 3. Configure SMTP transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // 4. Build and send the email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: sanitizedEmail,
        subject: "Your Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0f2f3; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #243460;">Account Verification</h2>
            <p style="color: #666; font-size: 14px;">Please use the following One-Time Password (OTP) to complete your signup or login:</p>
            <div style="background-color: #f0f7f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #3d838c; letter-spacing: 4px; font-size: 32px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 12px;">This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Nodemailer failed to send email. Cleaning up OTP from database...", mailError);
      // Clean up the created OTP if the email transmission fails
      await prisma.loginOtp.deleteMany({
        where: { email: sanitizedEmail },
      });
      return NextResponse.json({ success: false, message: "Failed to send verification email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
