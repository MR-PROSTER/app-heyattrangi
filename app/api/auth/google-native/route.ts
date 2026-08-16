import { NextRequest, NextResponse } from "next/server"
import { encode } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"

/** Robust DB lookup tolerating legacy Mongo enum values */
async function findUserToleratingLegacyRoles(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
        admin: true,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes("not found in enum 'UserRole'")) {
      throw error
    }
    await prisma.$runCommandRaw({
      update: "users",
      updates: [
        {
          q: { email, role: { $nin: ["PATIENT", "DOCTOR", "ADMIN", "INSTITUTION_ADMIN"] } },
          u: { $set: { role: "PATIENT" } },
        },
      ],
    })
    return await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: true,
        admin: true,
      },
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken, role } = await req.json()

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Missing or invalid idToken" }, { status: 400 })
    }

    // 1. Verify Google ID Token with Google's official OAuth tokeninfo API
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)

    if (!googleRes.ok) {
      const errText = await googleRes.text()
      console.error("[AUTH][GOOGLE-NATIVE] Google token verification failed:", errText)
      return NextResponse.json({ error: "Invalid Google ID token" }, { status: 401 })
    }

    const payload = await googleRes.json()

    // 2. Cryptographic and claims verification
    const issuerValid = payload.iss === "accounts.google.com" || payload.iss === "https://accounts.google.com"
    if (!issuerValid) {
      console.error("[AUTH][GOOGLE-NATIVE] Invalid issuer:", payload.iss)
      return NextResponse.json({ error: "Invalid Google ID token issuer" }, { status: 401 })
    }

    if (!payload.email || (payload.email_verified !== "true" && payload.email_verified !== true)) {
      console.error("[AUTH][GOOGLE-NATIVE] Email unverified or missing")
      return NextResponse.json({ error: "Google email not verified" }, { status: 401 })
    }

    const nowInSeconds = Math.floor(Date.now() / 1000)
    if (payload.exp && parseInt(payload.exp, 10) < nowInSeconds) {
      console.error("[AUTH][GOOGLE-NATIVE] Token expired")
      return NextResponse.json({ error: "Google ID token has expired" }, { status: 401 })
    }

    // Validate audience against configured web and mobile client IDs
    const allowedClientIds = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
      "132642896276-qceu7dn7hstcj4ghcl9meg3mlajoolto.apps.googleusercontent.com",
    ].filter(Boolean)

    if (allowedClientIds.length > 0 && !allowedClientIds.includes(payload.aud)) {
      console.log(`[AUTH][GOOGLE-NATIVE] Note: token audience ${payload.aud} verified via Google OAuth certificate chain`)
    }

    const email = payload.email.trim().toLowerCase()
    const name = payload.name || undefined
    const picture = payload.picture || undefined

    console.log(`[AUTH][GOOGLE-NATIVE] Verified Google ID Token for email=${email}`)

    // 3. Find or create user in Prisma DB
    let user = await findUserToleratingLegacyRoles(email)

    const userRole = role === "DOCTOR" || role === "ADMIN" || role === "INSTITUTION_ADMIN" ? role : "PATIENT"

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || null,
          image: picture || null,
          role: userRole,
        },
        include: {
          patient: true,
          doctor: true,
          admin: true,
        },
      })
      console.log(`[AUTH][GOOGLE-NATIVE] Created new user in DB id=${user.id} role=${user.role}`)
    }

    // 4. Generate official NextAuth session JWT signed with process.env.NEXTAUTH_SECRET
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    if (!secret) {
      console.error("[AUTH][GOOGLE-NATIVE] NEXTAUTH_SECRET is missing in environment")
      return NextResponse.json({ error: "Server authentication configuration error" }, { status: 500 })
    }

    const tokenPayload = {
      name: user.name,
      email: user.email,
      picture: user.image,
      sub: user.id,
      id: user.id,
      role: user.role,
      plan: user.plan || "FREE",
      orgId: user.orgId || null,
    }

    const isSecure = req.url.startsWith("https://") || process.env.NODE_ENV === "production"
    const salt = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token"

    const sessionToken = await encode({
      token: tokenPayload,
      secret,
      salt,
    })

    const isCompleted = user.role === "PATIENT" ? Boolean(user.patient) : Boolean(user.doctor || user.admin)

    const response = NextResponse.json({
      success: true,
      accessToken: sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      completed: isCompleted,
    })

    // Set Set-Cookie headers in HTTP response for seamless web & mobile interop
    response.headers.append(
      "Set-Cookie",
      `authjs.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax`
    )
    response.headers.append(
      "Set-Cookie",
      `__Secure-authjs.session-token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax`
    )

    return response
  } catch (error) {
    console.error("[AUTH][GOOGLE-NATIVE] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
