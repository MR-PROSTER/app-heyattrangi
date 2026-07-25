"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type SignupRole = "PATIENT" | "DOCTOR"
type Step = "EMAIL" | "PASSWORD" | "ROLE_SELECTION" | "PASSWORD_SETUP" | "SSO" | "OTP"

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

function RoleIcon({ role, selected }: { role: SignupRole; selected: boolean }) {
  if (role === "PATIENT") {
    return (
      <div className={`w-12 h-12 rounded-full grid place-items-center transition-colors ${selected ? 'bg-[#fdf2ee] text-[#e26843]' : 'bg-gray-100 text-gray-400'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  }
  return (
    <div className={`w-12 h-12 rounded-full grid place-items-center transition-colors ${selected ? 'bg-[#fdf2ee] text-[#e26843]' : 'bg-gray-100 text-gray-400'}`}>
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
  )
}

export default function SignInPage() {
  const [step, setStep] = useState<Step>("EMAIL")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)

  // OTP Login/Signup states
  const [otpCode, setOtpCode] = useState("")
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
          default:
            setStep("ROLE_SELECTION")
            break
        }
      } else {
        if (data.role) {
          router.push(`/onboarding?role=${data.role}`)
        } else {
          setStep("ROLE_SELECTION")
        }
      }
    } catch (error) {
      console.error("Error checking onboarding:", error)
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

    setEmail(trimmedEmail.toLowerCase())
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail.toLowerCase() }),
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
      console.error("Error sending OTP:", err)
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
    } catch (err) {
      console.error("Resend OTP error:", err)
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCredentialsLoading(true)
    setError("")
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsCredentialsLoading(false)
      } else {
        checkAndRedirect()
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setError("An unexpected error occurred")
      setIsCredentialsLoading(false)
    }
  }

  const handleCredentialsSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) {
      setError("Please select a role first")
      return
    }
    
    setIsCredentialsLoading(true)
    setError("")
    
    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole,
        }),
      })

      const registerData = await registerRes.json()

      if (!registerRes.ok) {
        setError(registerData.message || "Something went wrong")
        setIsCredentialsLoading(false)
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Registration successful, but sign in failed. Please try signing in.")
        setIsCredentialsLoading(false)
      } else {
        router.push(`/auth/callback?signup=true&role=${selectedRole}`)
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setError("An unexpected error occurred")
      setIsCredentialsLoading(false)
    }
  }

  const handleRoleSelect = async (role: SignupRole) => {
    setSelectedRole(role)
    if (status === "authenticated") {
      setIsLoading(true)
      setError("")
      try {
        const response = await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        })
        if (response.ok) {
          router.push(`/auth/callback?signup=true&role=${role}`)
        } else {
          setError("Failed to update role. Please try again.")
        }
      } catch (err) {
        console.error("Error updating role:", err)
        setError("An unexpected error occurred.")
      } finally {
        setIsLoading(false)
      }
    } else {
      setStep("PASSWORD_SETUP")
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      const callbackUrl = selectedRole 
        ? `/auth/callback?signup=true&role=${selectedRole}`
        : "/auth/callback"
      await signIn("google", {
        callbackUrl,
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
        setStep("PASSWORD")
      } else {
        setSelectedRole("DOCTOR")
        setStep("PASSWORD_SETUP")
      }
    } catch (err) {
      console.error("SSO error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const signedIn = status === "authenticated" && !!session?.user
  const actionsDisabled = isLoading || isCredentialsLoading || (signedIn && step !== "ROLE_SELECTION")

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[65%] xl:w-[70%] relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-[#fafafa]">
        {/* Animated glowing background lines - Attrangi style */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes shine-sweep {
              0% { transform: translateX(-100vw) rotate(-15deg); }
              100% { transform: translateX(100vw) rotate(-15deg); }
            }
          `}} />
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#fff4ec] to-[#ffe8d6] opacity-80"></div>
          
          {/* Animated floating blobs (shine effect) */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-[#ff6b00]/20 to-transparent rounded-full blur-[80px] animate-[pulse_4s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[#ff9800]/20 to-transparent rounded-full blur-[80px] animate-[pulse_5s_ease-in-out_infinite] [animation-delay:2s]"></div>
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-[#ff5252]/10 rounded-full blur-[100px] animate-[pulse_6s_ease-in-out_infinite] [animation-delay:1s]"></div>
          
          {/* Static Diagonal bands for structure */}
          <div className="absolute top-[-50%] left-[0%] w-[15%] h-[200%] bg-white/30 -rotate-[15deg] mix-blend-overlay"></div>
          <div className="absolute top-[-50%] left-[25%] w-[8%] h-[200%] bg-white/40 -rotate-[15deg] mix-blend-overlay"></div>
          <div className="absolute top-[-50%] left-[45%] w-[12%] h-[200%] bg-white/20 -rotate-[15deg] mix-blend-overlay"></div>
          <div className="absolute top-[-50%] left-[70%] w-[20%] h-[200%] bg-white/30 -rotate-[15deg] mix-blend-overlay"></div>

          {/* Sweeping shining lights perfectly matching the band tilt */}
          <div className="absolute top-[-50%] bottom-[-50%] w-[40%] h-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent mix-blend-overlay animate-[shine-sweep_7s_infinite_linear]"></div>
          <div className="absolute top-[-50%] bottom-[-50%] w-[20%] h-[200%] bg-gradient-to-r from-transparent via-white/70 to-transparent mix-blend-overlay animate-[shine-sweep_11s_infinite_linear_3s]"></div>
        </div>

        <div className="relative z-10 w-fit flex items-center gap-3">
          <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-[2px]">
            <div className="bg-[#FFC107] rounded-tl-[4px]"></div>
            <div className="bg-[#FF5252] rounded-tr-[4px]"></div>
            <div className="bg-[#FF9800] rounded-bl-[4px]"></div>
            <div className="bg-[#E64A19] rounded-br-[4px]"></div>
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-gray-900">Hey Attrangi!</span>
        </div>

        <div className="relative z-10 mt-auto">
          <h2 className="text-2xl xl:text-[28px] font-bold text-[#14293f] leading-snug tracking-tight mb-6 max-w-2xl">
            Join the community with thousands of people already trusting the website
          </h2>
          <div className="flex flex-wrap items-center gap-8 text-[15px] font-semibold text-[#14293f]">
             <div className="flex items-center gap-2">
                <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> 24/7 AI Companion
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> Verified Therapists
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xl leading-none font-light text-[#ff6b00]">✧</span> Personalized Care
             </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-[35%] xl:w-[30%] flex items-center justify-center p-8 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          {/* Header section - Hidden in SSO Step */}
          {step !== "SSO" && (
            <div className="mb-8 text-left">
              <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-2">
                {step === "ROLE_SELECTION" ? "Choose Profile Type" : "Login or Signup to Hey Attrangi"}
              </h2>
              <p className="text-gray-500 text-sm font-normal leading-relaxed">
                {step === "EMAIL" && "Enter your email address to continue your mental wellness journey."}
                {step === "OTP" && "Verify the 6-digit OTP code sent to your email."}
                {step === "PASSWORD" && "Enter your password to sign in."}
                {step === "ROLE_SELECTION" && "Select your role to get started with Attrangi."}
                {step === "PASSWORD_SETUP" && "Create a secure password to complete your account."}
              </p>
            </div>
          )}

          {signedIn && step !== "ROLE_SELECTION" ? (
            <div className="mb-8 w-full flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#e26843] rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Authenticating...</h3>
              <p className="text-sm text-gray-500">Getting your dashboard ready</p>
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
                        className={`w-full px-4 py-3.5 rounded-[8px] border outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400 ${
                          error
                            ? "border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843]"
                        }`}
                        placeholder="Email address"
                      />
                      {error && (
                        <p className="text-red-500 text-sm font-medium mt-1">
                          {error}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={actionsDisabled}
                      className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
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
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
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

              {/* STEP: OTP ENTRY */}
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
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

              {/* STEP 2: PASSWORD FOR EXISTING USER */}
              {step === "PASSWORD" && (
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                    placeholder="Password"
                    required
                  />
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={actionsDisabled}
                    className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
                  >
                    {isCredentialsLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>SIGN IN</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="text-sm font-semibold text-[#e26843] hover:underline flex items-center gap-1"
                  >
                    &larr; Use a different email
                  </button>
                </form>
              )}

              {/* STEP 3: ROLE SELECTION FOR NEW USER */}
              {step === "ROLE_SELECTION" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect("DOCTOR")}
                      className={`relative overflow-hidden group text-left p-5 rounded-[24px] border-2 transition-all duration-300 ${selectedRole === "DOCTOR"
                          ? 'border-[#e26843] bg-white shadow-[0_8px_30px_rgb(226,104,67,0.08)] -translate-y-0.5'
                          : 'border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${selectedRole === "DOCTOR" ? 'bg-[#e26843]' : 'bg-transparent'}`}></div>
                      <RoleIcon role="DOCTOR" selected={selectedRole === "DOCTOR"} />
                      <h3 className={`mt-4 font-bold text-lg mb-1 transition-colors ${selectedRole === "DOCTOR" ? 'text-[#e26843]' : 'text-gray-900'}`}>I am a therapist</h3>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">Manage practice, connect with patients securely.</p>
                    </button>
                  </div>
                  {!signedIn && (
                    <button
                      type="button"
                      onClick={() => setStep("EMAIL")}
                      className="text-sm font-semibold text-[#e26843] hover:underline flex items-center gap-1"
                    >
                      &larr; Use a different email
                    </button>
                  )}
                </div>
              )}

              {/* STEP 4: PASSWORD SETUP FOR NEW USER */}
              {step === "PASSWORD_SETUP" && (
                <form onSubmit={handleCredentialsSignUp} className="space-y-4">
                  {!email && (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                      placeholder="Email address"
                      required
                    />
                  )}
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                    placeholder="Create a Password"
                    required
                  />
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={actionsDisabled}
                    className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
                  >
                    {isCredentialsLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>SIGN UP</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="text-sm font-semibold text-[#e26843] hover:underline flex items-center gap-1"
                  >
                    &larr; Back
                  </button>
                </form>
              )}

              {/* STEP 5: WORK EMAIL SSO STEP (Image 1 Style) */}
              {step === "SSO" && (
                <div className="space-y-6">
                  {/* Back arrow at top left matching Image 1 */}
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="text-gray-500 hover:text-gray-900 transition-colors self-start flex items-center"
                    aria-label="Back"
                  >
                    <svg className="w-6 h-6 text-[#e26843]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>

                  <div className="text-left mb-6">
                    <h2 className="text-[24px] font-bold text-gray-800 tracking-tight mb-2">
                      Welcome to Hey Attrangi
                    </h2>
                    <p className="text-gray-500 text-sm font-normal leading-relaxed">
                      Enter your work email address to proceed.
                    </p>
                  </div>

                  <form onSubmit={handleSSOSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Work Email Address*
                      </label>
                      <input
                        type="email"
                        value={workEmail}
                        onChange={(e) => setWorkEmail(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                        placeholder="Enter Work Email Address"
                        required
                      />
                    </div>

                    {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                    {ssoOrgName && (
                      <p className="text-green-600 text-sm font-medium">
                        ✓ Organization Found: {ssoOrgName}. Redirecting...
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-[30px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base uppercase tracking-wider"
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
                    onClick={() => setStep("SSO")}
                    className="text-sm font-semibold text-[#e26843] hover:underline underline-offset-4 bg-transparent border-none cursor-pointer"
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
