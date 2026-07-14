"use client"

import { signIn, useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type SignupRole = "PATIENT" | "DOCTOR"

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
      <div className={`w-12 h-12 rounded-full grid place-items-center transition-colors ${selected ? 'bg-[#ebd9fb] text-[#8a63d2]' : 'bg-gray-100 text-gray-400'}`}>
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  }
  return (
    <div className={`w-12 h-12 rounded-full grid place-items-center transition-colors ${selected ? 'bg-[#d6e3cd] text-[#4a5d23]' : 'bg-gray-100 text-gray-400'}`}>
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
  )
}

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<SignupRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      checkAndRedirect()
    }
  }, [session, status])

  const checkAndRedirect = async () => {
    try {
      const response = await fetch("/api/auth/check-onboarding")
      const data = await response.json()
      if (data.completed) {
        const role = data.role
        switch (role) {
          case "PATIENT":
          case "CAREGIVER": router.push("/patient/dashboard"); break
          case "DOCTOR": router.push("/doctor/dashboard"); break
          case "ADMIN": router.push("/admin/dashboard"); break
        }
      } else {
        if (data.role) {
          router.push(`/onboarding?role=${data.role}`)
        }
      }
    } catch (error) {
      console.error("Error checking onboarding:", error)
    }
  }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false)

  const handleGoogleSignUp = async () => {
    if (!selectedRole) return
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", {
        callbackUrl: `/auth/callback?signup=true&role=${selectedRole}`,
        redirect: true,
      })
    } catch (error) {
      console.error("Sign up error:", error)
      setIsLoading(false)
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
      // Register user
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

      // Sign in after successful registration
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

  const signedIn = status === "authenticated" && !!session?.user
  const actionsDisabled = isLoading || isCredentialsLoading || signedIn
  const googleDisabled = actionsDisabled || !selectedRole

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
        <div className="w-full max-w-[460px]">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Create your account</h2>
            <p className="text-gray-500 font-medium">Select your role to get started with Attrangi.</p>
          </div>

          {signedIn && session?.user ? (
            <div className="mb-8 w-full flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#d89332] rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Authenticating...</h3>
              <p className="text-sm text-gray-500">Getting your dashboard ready</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Role Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole((r) => (r === "PATIENT" ? null : "PATIENT"))}
                  className={`relative overflow-hidden group text-left p-5 rounded-[24px] border-2 transition-all duration-300 ${selectedRole === "PATIENT"
                      ? 'border-[#8a63d2] bg-white shadow-[0_8px_30px_rgb(138,99,210,0.12)] -translate-y-1'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${selectedRole === "PATIENT" ? 'bg-[#8a63d2]' : 'bg-transparent'}`}></div>
                  <RoleIcon role="PATIENT" selected={selectedRole === "PATIENT"} />
                  <h3 className={`mt-4 font-bold text-lg mb-1 transition-colors ${selectedRole === "PATIENT" ? 'text-[#8a63d2]' : 'text-gray-900'}`}>I am seeking support</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Find therapy, join check-ins, and track wellbeing.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole((r) => (r === "DOCTOR" ? null : "DOCTOR"))}
                  className={`relative overflow-hidden group text-left p-5 rounded-[24px] border-2 transition-all duration-300 ${selectedRole === "DOCTOR"
                      ? 'border-[#4a5d23] bg-white shadow-[0_8px_30px_rgb(74,93,35,0.12)] -translate-y-1'
                      : 'border-gray-100 bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${selectedRole === "DOCTOR" ? 'bg-[#4a5d23]' : 'bg-transparent'}`}></div>
                  <RoleIcon role="DOCTOR" selected={selectedRole === "DOCTOR"} />
                  <h3 className={`mt-4 font-bold text-lg mb-1 transition-colors ${selectedRole === "DOCTOR" ? 'text-[#4a5d23]' : 'text-gray-900'}`}>I am a therapist</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">Manage practice, connect with patients securely.</p>
                </button>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={googleDisabled}
                  className={`w-full flex items-center justify-center gap-3 transition-all rounded-[20px] py-4 shadow-sm font-bold text-base border-2 ${!selectedRole
                      ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer group'
                    }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <GoogleIcon className={`w-6 h-6 ${selectedRole ? 'group-hover:scale-110 transition-transform text-[#ea4335]' : 'text-gray-400'}`} />
                      <span>{selectedRole ? 'Continue with Google' : 'Select a role to continue'}</span>
                    </>
                  )}
                </button>

                <form onSubmit={handleCredentialsSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!selectedRole}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!selectedRole}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                  <button
                    type="submit"
                    disabled={googleDisabled || isCredentialsLoading}
                    className={`w-full flex items-center justify-center gap-3 transition-all rounded-[20px] py-4 shadow-sm font-bold text-base border-2 ${!selectedRole
                        ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed'
                        : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 hover:border-gray-800 hover:shadow-md cursor-pointer group'
                      }`}
                  >
                    {isCredentialsLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>{selectedRole ? 'Sign Up with Email' : 'Select a role to continue'}</span>
                    )}
                  </button>
                </form>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-widest">or</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <Link
                  href="/auth/signin"
                  className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-gray-800 transition-all rounded-[20px] py-4 shadow-md hover:shadow-lg font-bold text-base"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          )}

          <p className="mt-12 text-center text-[13px] font-medium text-gray-400 max-w-sm mx-auto">
            By continuing, you agree to our <Link href="#" className="text-gray-700 underline underline-offset-2">Terms of Service</Link> and <Link href="#" className="text-gray-700 underline underline-offset-2">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
