"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel"

type Step = "EMAIL" | "OTP"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export default function InstituteSignInPage() {
  const [step, setStep] = useState<Step>("EMAIL")
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [orgId, setOrgId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      checkAndRedirect()
    }
  }, [session, status])

  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  const checkAndRedirect = async () => {
    try {
      const response = await fetch("/api/auth/check-onboarding")
      const data = await response.json()
      if (data.role === "INSTITUTION_ADMIN" || data.role === "ADMIN") {
        router.push("/institution")
        return
      }
      if (data.role === "PATIENT") router.push("/patient/dashboard")
      else if (data.role === "DOCTOR") router.push("/doctor/dashboard")
      else router.push("/auth")
    } catch {
      router.push("/institution")
    }
  }

  const resolveOrgForEmail = async (workEmail: string) => {
    const orgRes = await fetch("/api/auth/check-sso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: workEmail }),
    })
    const orgData = await orgRes.json()
    if (orgRes.ok && orgData.success) {
      setOrgId(orgData.orgId || null)
      return orgData
    }
    setOrgId(null)
    return null
  }

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Work email address is required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid work email address")
      return
    }

    setEmail(trimmedEmail)
    setIsLoading(true)

    try {
      const userRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const userData = await userRes.json()

      // Existing non-institute accounts should use Patient flow
      if (
        userData.exists &&
        userData.role &&
        userData.role !== "INSTITUTION_ADMIN" &&
        userData.role !== "ADMIN"
      ) {
        setError("This email is registered as an individual/therapist account. Please use Individual User login.")
        setIsLoading(false)
        return
      }

      // New institute logins still need a known partner domain
      if (!userData.exists) {
        const org = await resolveOrgForEmail(trimmedEmail)
        if (!org) {
          setError("No partner institute found for this email domain. Please sign up with a registered institute email, or contact support.")
          setIsLoading(false)
          return
        }
      } else {
        await resolveOrgForEmail(trimmedEmail)
      }

      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setOtpCode("")
        setResendTimer(30)
        setStep("OTP")
      } else {
        setError(data.message || "Failed to send OTP. Please try again.")
      }
    } catch (err) {
      console.error("Institute login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.length !== 6) return
    setIsCredentialsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        otp: otpCode.replace(/\D/g, ""),
        role: "INSTITUTION_ADMIN",
        orgId: orgId || undefined,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid or expired verification code.")
        setIsCredentialsLoading(false)
      } else {
        checkAndRedirect()
      }
    } catch (err) {
      console.error("OTP verification error:", err)
      setError("An unexpected error occurred during verification.")
      setIsCredentialsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setResendTimer(30)
      } else {
        setError(data.message || "Failed to resend code. Please try again.")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", {
        callbackUrl: "/auth/callback?signup=true&role=INSTITUTION_ADMIN",
        redirect: true,
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      setIsLoading(false)
    }
  }

  const signedIn = status === "authenticated" && !!session?.user
  const actionsDisabled = isLoading || isCredentialsLoading || signedIn

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      <AuthBrandingPanel />

      <div className="w-full lg:w-[min(100%,480px)] xl:w-[500px] shrink-0 flex items-center justify-center p-8 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e26843] hover:underline mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="mb-8 text-left">
            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-2">
              Login or Signup to Hey Attrangi
            </h2>
            <p className="text-gray-500 text-sm font-normal leading-relaxed">
              {step === "EMAIL" && "Enter your institute email address to continue."}
              {step === "OTP" && "Verify the 6-digit OTP code sent to your email."}
            </p>
          </div>

          {signedIn ? (
            <div className="mb-8 w-full flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#e26843] rounded-full animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Authenticating...</h3>
              <p className="text-sm text-gray-500">Getting your institute portal ready</p>
            </div>
          ) : (
            <div className="space-y-6">
              {step === "EMAIL" && (
                <div className="space-y-4">
                  <form onSubmit={handleEmailContinue} className="space-y-4" noValidate>
                    <div className="space-y-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setError("")
                        }}
                        className={`w-full px-4 py-3.5 rounded-[8px] border outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400 ${
                          error
                            ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843]"
                        }`}
                        placeholder="Email address"
                      />
                      {error && (
                        <p className="text-red-500 text-sm font-medium mt-1">{error}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={actionsDisabled}
                      className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>CONTINUE</span>
                      )}
                    </button>
                  </form>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200" />
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-gray-200" />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={actionsDisabled}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <GoogleIcon className="w-6 h-6 group-hover:scale-110 transition-transform text-[#ea4335]" />
                    <span className="font-bold text-base text-gray-700">Continue with Google</span>
                  </button>
                </div>
              )}

              {step === "OTP" && (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 font-medium">
                      We sent a 6-digit verification code to <span className="text-[#e26843] font-semibold">{email}</span>.
                    </p>
                  </div>
                  <input
                    type="text"
                    pattern="\d{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] font-bold text-xl rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-gray-800 placeholder-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={actionsDisabled || otpCode.length !== 6}
                    className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
                  >
                    {isCredentialsLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>VERIFY & CONTINUE</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="font-semibold text-[#e26843] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                    >
                      &larr; Use a different email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="font-semibold text-[#e26843] hover:underline disabled:text-gray-400 disabled:no-underline bg-transparent border-none cursor-pointer"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center mt-2">
                <p className="text-sm text-gray-500">
                  New institute?{" "}
                  <Link href="/auth/institution/signup" className="font-semibold text-[#e26843] hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
