"use client"

import { signIn, useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

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

export default function SignInPage() {
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
            router.push("/auth/signup")
            break
        }
      } else {
        if (data.role) {
          router.push(`/onboarding?role=${data.role}`)
        } else {
          router.push("/auth/signup")
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

  const handleDirectSignIn = async () => {
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", {
        callbackUrl: "/auth/callback",
        redirect: true,
      })
    } catch (error) {
      console.error("Sign in error:", error)
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

  const signedIn = status === "authenticated" && !!session?.user
  const actionsDisabled = isLoading || isCredentialsLoading || signedIn

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
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 font-medium">Log in to continue your mental wellness journey.</p>
          </div>

          {signedIn && session?.user ? (
            <div className="mb-8 w-full flex flex-col items-center justify-center py-10">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#d89332] rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Authenticating...</h3>
              <p className="text-sm text-gray-500">Getting your dashboard ready</p>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleDirectSignIn}
                disabled={actionsDisabled}
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all rounded-[20px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <GoogleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base">Continue with Google</span>
                  </>
                )}
              </button>

              <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                <button
                  type="submit"
                  disabled={actionsDisabled}
                  className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-gray-800 transition-all rounded-[20px] py-4 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isCredentialsLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="font-bold text-base">Sign In with Email</span>
                  )}
                </button>
              </form>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-semibold uppercase tracking-widest">New here?</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all rounded-[20px] py-4 shadow-sm hover:shadow-md font-bold text-base"
              >
                Create an account
              </Link>
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
