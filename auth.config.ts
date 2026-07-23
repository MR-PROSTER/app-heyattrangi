import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import type { Adapter } from "next-auth/adapters"
import bcrypt from "bcryptjs"

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
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        const sanitizedEmail = (credentials.email as string).trim().toLowerCase();

        // 1. If OTP is provided, verify it
        if (credentials.otp) {
          const otpEntry = await prisma.loginOtp.findUnique({
            where: { email: sanitizedEmail },
          });

          if (!otpEntry || otpEntry.otp !== credentials.otp) {
            return null;
          }

          // Check expiration (5-minute window)
          const expiryTime = new Date(otpEntry.createdAt);
          expiryTime.setMinutes(expiryTime.getMinutes() + 5);

          if (new Date() > expiryTime) {
            await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });
            return null;
          }

          // Clean up OTP to prevent replay attacks
          await prisma.loginOtp.deleteMany({ where: { email: sanitizedEmail } });

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
          });

          if (!user) {
            const userRole = (credentials.role === "DOCTOR" || credentials.role === "PATIENT")
              ? credentials.role
              : "PATIENT";

            user = await prisma.user.create({
              data: {
                email: sanitizedEmail,
                role: userRole,
              },
            });
          }

          return user;
        }

        // 2. Fallback to password-based sign-in
        if (!credentials.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: sanitizedEmail
          }
        })

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

        return user
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
    async jwt({ token, account, profile, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      // With JWT strategy, user ID is in token.id
      const userId = (token?.id as string) || user?.id

      if (session.user && userId) {
        try {
          // Get user role and plan from database
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              patient: true,
              doctor: true,
              admin: true,
            },
          })
          
          session.user.id = userId
          session.user.role = dbUser?.role || "PATIENT"
          session.user.plan = dbUser?.plan
          session.user.orgId = dbUser?.orgId
        } catch (error) {
          console.error("Error in session callback:", error)
          session.user.id = userId
          session.user.role = "PATIENT"
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
})

