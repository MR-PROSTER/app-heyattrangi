"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthBrandingPanel from "@/components/auth/AuthBrandingPanel"

type Step = "EMAIL" | "CODE" | "SSO"

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

function AttrangiLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-[2px] shrink-0">
        <div className="bg-[#FFC107] rounded-tl-[4px]" />
        <div className="bg-[#FF5252] rounded-tr-[4px]" />
        <div className="bg-[#FF9800] rounded-bl-[4px]" />
        <div className="bg-[#E64A19] rounded-br-[4px]" />
      </div>
      <span className="font-extrabold text-xl sm:text-2xl tracking-tighter text-gray-900">Hey Attrangi!</span>
    </div>
  )
}

export default function SignInPage() {
  const [step, setStep] = useState<Step>("EMAIL")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)

  // Code verification states
  const [verificationCode, setVerificationCode] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  // SSO fields
  const [workEmail, setWorkEmail] = useState("")
  const [ssoOrgName, setSsoOrgName] = useState("")
  
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      checkAndRedirect()
    }
  }, [session, status])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const checkAndRedirect = async () => {
    try {
      const response = await fetch("/api/auth/check-onboarding")
      const data = await response.json()

      if (data.completed) {
        const role = data.role
        switch (role) {
          case "PATIENT":
          case "CAREGIVER":
            router.push("/patient/dashboard")
            break
          case "DOCTOR":
            router.push("/doctor/dashboard")
            break
          case "ADMIN":
            router.push("/admin/dashboard")
            break
          case "INSTITUTION_ADMIN":
            router.push("/institution")
            break
          default:
            router.push("/patient/dashboard")
            break
        }
      } else {
        if (data.role) {
          router.push(`/onboarding?role=${data.role}`)
        } else {
          router.push("/onboarding?role=PATIENT")
        }
      }
    } catch (err) {
      console.error("Error checking onboarding:", err)
      router.push("/patient/dashboard")
    }
  }

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Email address is required")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      return
    }

    const lowercaseEmail = trimmedEmail.toLowerCase()
    setEmail(lowercaseEmail)
    setIsLoading(true)

    try {
      // 1. Verify that user exists for Login flow
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lowercaseEmail }),
      })
      
      if (checkRes.ok) {
        const checkData = await checkRes.json()
        if (!checkData.exists) {
          setError("No account found with this email. Please create an account.")
          setIsLoading(false)
          return
        }
      }

      // 2. If user exists, send OTP verification code
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lowercaseEmail }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setVerificationCode("")
        setResendTimer(25) // timer set to 25s
        setStep("CODE")
      } else {
        setError(data.message || "Failed to send verification code. Please try again.")
      }
    } catch (err) {
      console.error("Error sending verification code:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) return
    setIsCredentialsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        otp: verificationCode.replace(/\D/g, ""),
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid or expired verification code.")
        setIsCredentialsLoading(false)
      } else {
        checkAndRedirect()
      }
    } catch (err) {
      console.error("Code verification error:", err)
      setError("An unexpected error occurred during verification.")
      setIsCredentialsLoading(false)
    }
  }

  const handleResendCode = async () => {
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
        setResendTimer(25)
      } else {
        setError(data.message || "Failed to resend code. Please try again.")
      }
    } catch (err) {
      console.error("Resend code error:", err)
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
        callbackUrl: "/auth/callback",
        redirect: true,
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      setIsLoading(false)
    }
  }

  const handleSSOSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workEmail) return
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: workEmail }),
      })
      const data = await response.json()

      setEmail(workEmail)

      if (data.exists) {
        // Send OTP for existing user login
        const otpResponse = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: workEmail.toLowerCase() }),
        })
        const otpData = await otpResponse.json()

        if (otpResponse.ok && otpData.success) {
          setVerificationCode("")
          setResendTimer(25)
          setStep("CODE")
        } else {
          setError(otpData.message || "Failed to send verification code.")
        }
      } else {
        setError("No organization SSO account found with this email.")
      }
    } catch (err) {
      console.error("SSO error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const signedIn = status === "authenticated" && !!session?.user
  const actionsDisabled = isLoading || isCredentialsLoading || signedIn

  return (
    <div className="min-h-screen w-full flex bg-white font-sans select-none">
      <AuthBrandingPanel />

      {/* Right form panel */}
      <div className="w-full lg:w-[min(100%,480px)] xl:w-[500px] shrink-0 flex items-center justify-center p-8 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          {/* Back Action Header */}
          {step === "EMAIL" ? (
            <Link
              href="/auth/individual"
              aria-label="Back"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 text-[#e26843] transition-colors mb-6 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <button
              onClick={() => {
                setError("")
                setStep("EMAIL")
              }}
              aria-label="Back"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 text-[#e26843] transition-colors mb-6 cursor-pointer bg-transparent"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Header section - Hidden in SSO Step */}
          {step !== "SSO" && (
            <div className="mb-8 text-left">
              <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-2 font-sans">
                Log in to Hey Attrangi
              </h2>
              <p className="text-gray-500 text-sm font-normal leading-relaxed font-sans">
                {step === "EMAIL"
                  ? "Enter your email address to continue your mental wellness journey."
                  : "Verify the 6-digit code sent to your email."}
              </p>
            </div>
          )}

          {signedIn ? (
            <div className="mb-8 w-full flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#e26843] rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 font-sans">Authenticating...</h3>
              <p className="text-sm text-gray-500 font-sans">Getting your dashboard ready</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* STEP 1: EMAIL ENTRY */}
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
                        className={`w-full px-4 py-3.5 rounded-[8px] border outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400 font-sans ${
                          error
                            ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843]"
                        }`}
                        placeholder="Email address"
                      />
                      {error && (
                        <p className="text-red-500 text-sm font-medium mt-1 font-sans">
                          {error}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={actionsDisabled}
                      className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider font-sans"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>CONTINUE</span>
                      )}
                    </button>
                  </form>

                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest font-sans">or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={actionsDisabled}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group font-sans"
                  >
                    <GoogleIcon className="w-6 h-6 group-hover:scale-110 transition-transform text-[#ea4335]" />
                    <span className="font-bold text-base text-gray-700">Continue with Google</span>
                  </button>
                </div>
              )}

              {/* STEP 2: CODE VERIFICATION */}
              {step === "CODE" && (
                <form onSubmit={handleCodeVerify} className="space-y-4">
                  <input
                    type="text"
                    pattern="\d{6}"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3.5 text-center tracking-[0.5em] font-bold text-xl rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-gray-800 placeholder-gray-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-sm font-sans"
                    placeholder="Enter 6-digit code"
                    required
                  />
                  {error && <p className="text-red-500 text-sm font-medium font-sans">{error}</p>}
                  <button
                    type="submit"
                    disabled={actionsDisabled || verificationCode.length !== 6}
                    className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider font-sans"
                  >
                    {isCredentialsLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>VERIFY & CONTINUE</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="font-semibold text-[#e26843] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer font-sans"
                    >
                      &larr; Use a different email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendTimer > 0 || isLoading}
                      className="font-semibold text-[#e26843] hover:underline disabled:text-gray-400 disabled:no-underline bg-transparent border-none cursor-pointer font-sans"
                    >
                      {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: WORK EMAIL SSO STEP */}
              {step === "SSO" && (
                <div className="space-y-6">
                  <div className="text-left mb-6">
                    <h2 className="text-[24px] font-bold text-gray-800 tracking-tight mb-2 font-sans">
                      Welcome to Hey Attrangi
                    </h2>
                    <p className="text-gray-500 text-sm font-normal leading-relaxed font-sans">
                      Enter your work email address to proceed.
                    </p>
                  </div>

                  <form onSubmit={handleSSOSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 font-sans">
                        Work Email Address*
                      </label>
                      <input
                        type="email"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400 font-sans"
                        placeholder="Enter Work Email Address"
                        required
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium font-sans">{error}</p>}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider font-sans"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>CONTINUE</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {step !== "SSO" && (
                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setError("")
                      setStep("SSO")
                    }}
                    className="text-sm font-semibold text-[#e26843] hover:underline underline-offset-4 bg-transparent border-none cursor-pointer font-sans"
                  >
                    Use single sign-on (SSO)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
