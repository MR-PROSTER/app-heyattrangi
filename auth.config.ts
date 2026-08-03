import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"
import bcrypt from "bcryptjs"
import { sendWelcomeBackEmail } from "@/lib/email"

/** Legacy DB rows may still have role "ADULT", which breaks Prisma UserRole enum reads. */
async function findUserToleratingLegacyRoles(email: string) {
  try {
    return await prisma.user.findUnique({ where: { email } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!message.includes("not found in enum 'UserRole'")) {
      throw error
    }

    // Migrate obsolete roles (e.g. ADULT) to PATIENT, then re-read
    await prisma.$runCommandRaw({
      update: "users",
      updates: [
        {
          q: { email, role: { $nin: ["PATIENT", "DOCTOR", "ADMIN", "INSTITUTION_ADMIN"] } },
          u: { $set: { role: "PATIENT" } },
        },
      ],
    })

    return await prisma.user.findUnique({ where: { email } })
  }
}

function queueWelcomeBackEmail(email?: string | null, name?: string | null) {
  if (!email) return
  void sendWelcomeBackEmail(email, name).catch((err) => {
    console.error("Failed to send welcome-back email:", err)
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        role: { label: "Role", type: "text" },
        orgId: { label: "Organization ID", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const sanitizedEmail = (credentials.email as string).trim().toLowerCase();
        const sanitizedOtp = credentials.otp
          ? String(credentials.otp).replace(/\D/g, "").trim()
          : "";

        // 1. If OTP is provided, verify it
        if (sanitizedOtp) {
          const otpEntry = await prisma.loginOtp.findUnique({
            where: { email: sanitizedEmail },
          });

          if (!otpEntry || otpEntry.otp !== sanitizedOtp) {
            return null;
          }

          // Check expiration (5-minute window)
          const expiryTime = new Date(otpEntry.createdAt);
          expiryTime.setMinutes(expiryTime.getMinutes() + 5);

          if (new Date() > expiryTime) {
            await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });
            return null;
          }

          // Find or create user BEFORE deleting OTP so a failed lookup can still be retried
          let user = await findUserToleratingLegacyRoles(sanitizedEmail);
          const isReturningUser = Boolean(user);

          if (!user) {
            const allowedRoles = ["DOCTOR", "PATIENT", "INSTITUTION_ADMIN"] as const
            const requestedRole = credentials.role as string | undefined
            const userRole = allowedRoles.includes(requestedRole as typeof allowedRoles[number])
              ? (requestedRole as typeof allowedRoles[number])
              : "PATIENT";

            const orgId =
              typeof credentials.orgId === "string" && credentials.orgId.trim()
                ? credentials.orgId.trim()
                : undefined

            user = await prisma.user.create({
              data: {
                email: sanitizedEmail,
                role: userRole,
                ...(userRole === "INSTITUTION_ADMIN"
                  ? {
                      plan: "ORGANIZATION",
                      ...(orgId ? { orgId } : {}),
                    }
                  : {}),
              },
            });
          } else if (
            user.role === "INSTITUTION_ADMIN" &&
            typeof credentials.orgId === "string" &&
            credentials.orgId.trim() &&
            !user.orgId
          ) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                orgId: credentials.orgId.trim(),
                plan: "ORGANIZATION",
              },
            })
          }

          // Clean up OTP only after successful user resolution
          await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });

          if (isReturningUser) {
            queueWelcomeBackEmail(user.email, user.name);
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            plan: user.plan,
            orgId: user.orgId,
          };
        }

        // 2. Fallback to password-based sign-in
        if (!credentials.password) {
          return null
        }

        const user = await findUserToleratingLegacyRoles(sanitizedEmail);

        if (!user || !(user as any).password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          (user as any).password
        )

        if (!isPasswordValid) {
          return null
        }

        queueWelcomeBackEmail(user.email, user.name);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          plan: user.plan,
          orgId: user.orgId,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        const domain = user.email.split("@")[1]?.toLowerCase()
        if (domain) {
          const org = await prisma.organization.findFirst({
            where: {
              domains: {
                has: domain,
              },
            },
          })

          if (org && (user.plan !== "ORGANIZATION" || user.orgId !== org.id)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: "ORGANIZATION",
                orgId: org.id,
              },
            })
          }
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after OAuth - preserve callback URL if specified
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If external URL, redirect to base URL (will be handled by our callback route)
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default to callback handler
      return `${baseUrl}/auth/callback`
    },
    async jwt({ token, user, trigger }) {
      // Hydrate claims once at sign-in (or explicit update) so session()
      // does not hit Mongo on every auth()/getSession call.
      if (user?.id) {
        token.id = user.id
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, plan: true, orgId: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.plan = dbUser.plan
            token.orgId = dbUser.orgId
          }
        } catch (error) {
          console.error("Error hydrating JWT claims:", error)
          token.role = token.role || "PATIENT"
        }
      } else if (trigger === "update" && token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, plan: true, orgId: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.plan = dbUser.plan
            token.orgId = dbUser.orgId
          }
        } catch (error) {
          console.error("Error refreshing JWT claims:", error)
        }
      }
      return token
    },
    async session({ session, token, user }) {
      const userId = (token?.id as string) || user?.id

      if (session.user && userId) {
        session.user.id = userId

        if (token.role) {
          session.user.role = token.role as typeof session.user.role
          session.user.plan = token.plan as typeof session.user.plan
          session.user.orgId = (token.orgId as string | null | undefined) ?? null
        } else {
          // Legacy JWTs minted before claim hydration — one lean lookup
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: userId },
              select: { role: true, plan: true, orgId: true },
            })
            session.user.role = dbUser?.role || "PATIENT"
            session.user.plan = dbUser?.plan
            session.user.orgId = dbUser?.orgId
          } catch (error) {
            console.error("Error in session fallback:", error)
            session.user.role = "PATIENT"
          }
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
})

