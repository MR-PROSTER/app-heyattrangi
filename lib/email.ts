import nodemailer from "nodemailer"

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

export async function sendWelcomeBackEmail(email: string, name?: string | null) {
  const transporter = createTransporter()
  if (!transporter) {
    console.error("EMAIL_USER or EMAIL_PASS is not configured; skipping welcome-back email")
    return false
  }

  const displayName = name?.trim() || "there"

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome back to Hey Attrangi!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #ffe8d6; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e26843; font-size: 28px; margin: 0;">Hey Attrangi!</h1>
        </div>
        <h2 style="color: #243460; font-size: 22px; margin: 0 0 12px;">Welcome back, ${displayName}!</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          You just signed in to Hey Attrangi with <strong style="color: #243460;">${email}</strong>.
          We&apos;re glad to have you back on your mental wellness journey.
        </p>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Continue where you left off — check in with your mood, talk to your AI companion, or book a session with a verified therapist.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.NEXTAUTH_URL || "https://heyattrangi.com"}/patient/dashboard"
             style="display: inline-block; background-color: #e26843; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; font-size: 14px;">
            Go to Dashboard
          </a>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
          If this wasn&apos;t you, please secure your account and contact us at contact@heyattrangi.com.
        </p>
      </div>
    `,
  })

  return true
}

type PaymentStatusEmailInput = {
  email: string
  name?: string | null
  status: "SUCCESS" | "FAILED"
  amount?: number | string | null
  description?: string | null
  paymentId?: string | null
  orderId?: string | null
  reason?: string | null
}

export async function sendPaymentStatusEmail(input: PaymentStatusEmailInput) {
  const transporter = createTransporter()
  if (!transporter) {
    console.error("EMAIL_USER or EMAIL_PASS is not configured; skipping payment status email")
    return false
  }

  const displayName = input.name?.trim() || "there"
  const isSuccess = input.status === "SUCCESS"
  const amountLabel =
    input.amount !== undefined && input.amount !== null && input.amount !== ""
      ? `₹${Number(input.amount).toFixed(2)}`
      : null

  const subject = isSuccess
    ? "Payment successful — Hey Attrangi"
    : "Payment failed — Hey Attrangi"

  const statusColor = isSuccess ? "#059669" : "#dc2626"
  const statusLabel = isSuccess ? "Payment Successful" : "Payment Failed"

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: input.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; border: 1px solid #ffe8d6; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e26843; font-size: 28px; margin: 0;">Hey Attrangi!</h1>
        </div>
        <h2 style="color: ${statusColor}; font-size: 22px; margin: 0 0 12px;">${statusLabel}</h2>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Hi ${displayName}, here is the status of your recent payment for the account
          <strong style="color: #243460;">${input.email}</strong>.
        </p>
        <div style="background-color: #fff7f2; border: 1px solid #ffe8d6; border-radius: 12px; padding: 16px; margin: 0 0 20px;">
          <p style="margin: 0 0 8px; color: #243460; font-size: 14px;"><strong>Status:</strong> ${statusLabel}</p>
          ${amountLabel ? `<p style="margin: 0 0 8px; color: #243460; font-size: 14px;"><strong>Amount:</strong> ${amountLabel}</p>` : ""}
          ${input.description ? `<p style="margin: 0 0 8px; color: #243460; font-size: 14px;"><strong>Details:</strong> ${input.description}</p>` : ""}
          ${input.paymentId ? `<p style="margin: 0 0 8px; color: #666; font-size: 13px;"><strong>Payment ID:</strong> ${input.paymentId}</p>` : ""}
          ${input.orderId ? `<p style="margin: 0 0 8px; color: #666; font-size: 13px;"><strong>Order ID:</strong> ${input.orderId}</p>` : ""}
          ${!isSuccess && input.reason ? `<p style="margin: 0; color: #dc2626; font-size: 13px;"><strong>Reason:</strong> ${input.reason}</p>` : ""}
        </div>
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          ${
            isSuccess
              ? "Thank you for your payment. Your account has been updated successfully."
              : "Your payment could not be completed. No charges were finalized for this attempt. You can try again anytime from the app."
          }
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.NEXTAUTH_URL || "https://heyattrangi.com"}/patient/dashboard"
             style="display: inline-block; background-color: #e26843; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 30px; font-weight: bold; font-size: 14px;">
            Open Hey Attrangi
          </a>
        </div>
        <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
          Need help? Contact us at contact@heyattrangi.com.
        </p>
      </div>
    `,
  })

  return true
}

export function queuePaymentStatusEmail(input: PaymentStatusEmailInput) {
  void sendPaymentStatusEmail(input).catch((err) => {
    console.error("Failed to send payment status email:", err)
  })
}
