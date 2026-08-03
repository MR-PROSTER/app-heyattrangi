"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import TermsAndConditionsContent from "@/components/legal/TermsAndConditionsContent"
import AiTransparencyStatementContent from "@/components/legal/AiTransparencyStatementContent"
import DataProcessingConsentContent from "@/components/legal/DataProcessingConsentContent"

type OnboardingData = {
    dob: string
    age: string
    orgId: string
    mood: string
    experience: string
    reasons: string[]
    emergencyContact: string
    emergencyPhone: string
    consentAgreed: boolean
    name?: string
    preferredLanguage?: string
    heardAboutUs?: string
}

export default function PatientOnboarding() {
    const router = useRouter()
    const { data: session } = useSession()

    const [step, setStep] = useState(0)
    const [data, setData] = useState<OnboardingData>({
        dob: "",
        age: "",
        orgId: "",
        mood: "",
        experience: "",
        reasons: [],
        emergencyContact: "",
        emergencyPhone: "",
        consentAgreed: false,
        name: "",
        preferredLanguage: "English",
        heardAboutUs: "",
    })

    useEffect(() => {
        if (session?.user?.name) {
            setData((prev) => ({
                ...prev,
                name: prev.name || session.user.name || ""
            }))
        }
    }, [session])
    const [isLoading, setIsLoading] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [showPrivacyModal, setShowPrivacyModal] = useState(false)
    const [showAiModal, setShowAiModal] = useState(false)
    const [showDataConsentModal, setShowDataConsentModal] = useState(false)
    const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)

    // Pricing & Payment State
    const [selectedPlan, setSelectedPlan] = useState<"ESSENTIAL" | "PREMIUM">("PREMIUM")
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handlePayment = async () => {
        setIsProcessingPayment(true)
        const amount = selectedPlan === "ESSENTIAL" ? 49 : 149
        try {
            const isLoaded = await loadRazorpayScript()
            if (!isLoaded) {
                alert("Razorpay SDK failed to load. Are you online?")
                return
            }

            const orderRes = await fetch("/api/payments/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: selectedPlan,
                    amount,
                }),
            })

            const orderData = await orderRes.json()
            if (!orderData.success) throw new Error(orderData.error || "Failed to initiate payment")

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T2HN6tpPOHf8Mw",
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Hey Attrangi",
                description: `${selectedPlan === "PREMIUM" ? "Companion" : "Listener"} Plan Subscription`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch("/api/payments/subscribe/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                plan: selectedPlan,
                                amount,
                            }),
                        })

                        const verifyData = await verifyRes.json()
                        if (verifyData.success) {
                            alert(`Successfully subscribed to ${selectedPlan === "PREMIUM" ? "Companion" : "Listener"} plan!`)
                            setStep(4)
                        } else {
                            alert(verifyData.error || "Payment verification failed.")
                        }
                    } catch (err: any) {
                        console.error("Verification error:", err)
                        alert(err.message || "Failed to verify payment.")
                    }
                },
                prefill: {
                    name: session?.user?.name || "",
                    email: session?.user?.email || "",
                },
                theme: {
                    color: "#e26843",
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.on("payment.failed", function (response: any) {
                const reason = response?.error?.description || "Payment was declined"
                void fetch("/api/payments/notify-status", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "FAILED",
                        amount,
                        description: `${selectedPlan === "PREMIUM" ? "Companion" : "Listener"} plan subscription`,
                        paymentId: response?.error?.metadata?.payment_id || null,
                        orderId: orderData.orderId,
                        reason,
                    }),
                }).catch(() => {})
                alert(`Payment Failed: ${reason}`)
            })
            rzp.open()
        } catch (error: any) {
            console.error("Payment error:", error)
            alert(error.message || "An error occurred during payment initiation.")
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const handleNext = () => {
        if (step === 2) {
            handlePayment()
        } else {
            setStep((s) => s + 1)
        }
    }

    const handleBack = () => {
        setStep((s) => s - 1)
    }

    const handleFinish = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/onboarding/patient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    age: data.age,
                    dob: data.dob,
                    orgId: data.orgId === "none" ? undefined : data.orgId,
                    gender: "Not specified",
                    healthConcerns: data.reasons,
                    emergencyContact: data.emergencyContact,
                    emergencyPhone: data.emergencyPhone,
                    preferredLanguage: data.preferredLanguage,
                    heardAboutUs: data.heardAboutUs,
                }),
            })

            if (response.ok) {
                router.push("/patient/dashboard")
            } else {
                alert("Something went wrong.")
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const userName = data.name?.split(" ")[0] || session?.user?.name?.split(" ")[0] || "Sam"

    const isContinueDisabled =
        (step === 0 && (!data.name?.trim() || !data.dob)) ||
        (step === 1 && (!data.emergencyContact || !data.emergencyPhone || data.emergencyPhone.length !== 10 || !data.consentAgreed))

    return (
        <div className="min-h-screen w-full flex bg-white font-sans relative overflow-hidden">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-[60%] xl:w-[65%] relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-[#fafafa]">
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
            <div className={`w-full lg:w-[40%] xl:w-[35%] flex items-start lg:items-center justify-center px-5 pt-4 pb-6 sm:px-10 sm:py-10 md:p-12 bg-white relative overflow-y-auto min-h-screen ${step === 2 ? "lg:overflow-hidden" : ""}`}>
                <div className={`w-full max-w-[450px] flex flex-col ${step === 2 ? "min-h-0 lg:min-h-0 gap-3" : "min-h-[calc(100dvh-2rem)] lg:min-h-[550px] gap-8"}`}>
                    <div className={`w-full ${step === 2 ? "flex flex-col" : "flex-1"}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="w-full z-10 text-left">
                                    {step === 0 && (
                                        <PersonalizationScreen
                                            data={data}
                                            onChange={(fields) => setData({ ...data, ...fields })}
                                            onBack={() => router.back()}
                                        />
                                    )}
                                    {step === 1 && (
                                        <ConsentScreen
                                            data={data}
                                            onChange={(fields) => setData({ ...data, ...fields })}
                                            onOpenTerms={() => setShowTermsModal(true)}
                                            onOpenPrivacy={() => setShowPrivacyModal(true)}
                                            onOpenAi={() => setShowAiModal(true)}
                                            onOpenDataConsent={() => setShowDataConsentModal(true)}
                                            onOpenTrustSafety={() => setShowTrustSafetyModal(true)}
                                        />
                                    )}
                                    {step === 2 && (
                                        <PricingScreen
                                            selectedPlan={selectedPlan}
                                            onSelectPlan={setSelectedPlan}
                                            onOpenTerms={() => setShowTermsModal(true)}
                                            onOpenPrivacy={() => setShowPrivacyModal(true)}
                                            onSkip={() => setStep(3)}
                                        />
                                    )}
                                    {step === 3 && <FinalScreen userName={userName} />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons and Dots Indicator */}
                    <div className={`z-10 w-full shrink-0 ${step === 2 ? "pt-2" : ""}`}>
                        <div className="flex w-full gap-3">
                            {step > 0 && step < 2 && (
                                <button
                                    onClick={handleBack}
                                    className="flex-1 flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 transition-all rounded-full py-3.5 font-semibold text-[15px] lg:font-bold lg:text-sm lg:uppercase lg:tracking-wider cursor-pointer"
                                >
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={isContinueDisabled}
                                    className={`${step > 0 && step !== 2 ? "flex-1" : "w-full"} flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-full py-3.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[16px] lg:font-bold lg:text-sm lg:uppercase lg:tracking-wider cursor-pointer`}
                                >
                                    {step === 2 ? "Subscribe & Pay" : "Continue"}
                                </button>
                            ) : (
                                <button
                                    onClick={handleFinish}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center bg-[#e26843] hover:bg-[#d05732] text-white transition-all rounded-full py-3.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-[16px] lg:font-bold lg:text-sm lg:uppercase lg:tracking-wider cursor-pointer"
                                >
                                    {isLoading ? "Starting..." : "Welcome to Attrangi!"}
                                </button>
                            )}
                        </div>

                        {/* Skip under full-width Subscribe CTA */}
                        {step === 2 && (
                            <button
                                onClick={() => setStep(3)}
                                className="mt-4 w-full text-center text-sm font-semibold text-[#e26843] hover:text-[#d05732] underline transition-all bg-transparent border-none cursor-pointer"
                            >
                                Skip, continue with Free Plan
                            </button>
                        )}

                        {/* Progress Dots — desktop only; mobile matches Figma without dots */}
                        {step < 4 && (
                            <div className="hidden lg:flex gap-2.5 justify-center mt-6">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ${i === step ? "bg-[#e26843] w-4" : "bg-[#ffe8d6]"}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terms & Conditions Modal Overlay */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50 relative">
                            <div className="text-center w-full">
                                <h1 className="font-poppins text-[18px] lg:text-[25px] font-bold text-[#243460]">
                                    Terms & Conditions
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 absolute right-6 top-6"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/20">
                            <TermsAndConditionsContent />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="px-6 py-2.5 bg-[#e26843] hover:bg-[#d05732] text-white rounded-[30px] font-bold text-sm transition-all cursor-pointer"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Privacy Policy Modal Overlay */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50 relative">
                            <div className="text-center w-full">
                                <h1 className="font-poppins text-[18px] lg:text-[25px] font-bold text-[#243460]">
                                    Privacy Policy
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 absolute right-6 top-6"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/20">
                            <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">

                                {/* Effective Dates */}
                                <div className="text-center border-b border-gray-100 pb-4 mb-6">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
                                    </p>
                                </div>

                                {/* SECTION I: INTRODUCTION & DEFINITIONS */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section I - Introduction &amp; Definitions
                                    </h3>

                                    {/* 1. Introduction */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>
                                                Aatrangi Private Limited (the &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Hey Attrangi platform (the &quot;Platform&quot;), an AI-assisted mental wellness platform providing emotional wellbeing support, therapist consultations, and related services.
                                            </p>
                                            <p>
                                                This Privacy Policy (this &quot;Policy&quot;) describes how we collect, use, process, store, share, and protect the personal information of individuals who visit our website, use our web application, mobile applications (Android and iOS), or otherwise interact with our Platform and Services.
                                            </p>
                                            <p>
                                                We process personal data only for lawful, specific, and necessary purposes, and implement appropriate safeguards to protect your information under the Digital Personal Data Protection Act, 2023 (the &quot;DPDP Act&quot;), the Mental Healthcare Act, 2017, and other applicable laws of the Republic of India.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. Scope */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. Scope</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>This Policy applies to all individuals who interact with the Platform, including:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>Users:</strong> Individuals who register on, access, or use the Platform.</li>
                                                <li><strong>Patients:</strong> Users who receive therapist-led clinical or therapeutic services.</li>
                                                <li><strong>Caregivers:</strong> Parents/guardians who manage accounts for Minor Users.</li>
                                                <li><strong>Therapists:</strong> Licensed mental health professionals providing services.</li>
                                                <li><strong>Institutional Administrators:</strong> Representatives of partner organizations/schools.</li>
                                            </ul>
                                            <p>It covers all current and future offerings operated under the Hey Attrangi brand (websites, Android/iOS apps, portals, dashboards, and APIs).</p>
                                        </div>
                                    </div>

                                    {/* 3. Definitions */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. Definitions</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <ul className="space-y-2 text-sm">
                                                <li><strong>&quot;Personal Data&quot;:</strong> Any data about an individual who is identifiable by or in relation to such data, as defined under the DPDP Act.</li>
                                                <li><strong>&quot;Sensitive Personal Data&quot;:</strong> Data that may pose a higher risk of harm if compromised (e.g. mental health history, health records).</li>
                                                <li><strong>&quot;Data Principal&quot;:</strong> The individual to whom the personal data relates.</li>
                                                <li><strong>&quot;Data Fiduciary&quot;:</strong> The Company, which determines the purpose and means of processing personal data.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION II: INFORMATION WE COLLECT */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section II - Information We Collect &amp; How We Use It
                                    </h3>

                                    {/* 4. Information We Collect */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">4. Information We Collect</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-3">
                                            <p>We collect information provided directly by you, automatically through use, or from third-parties:</p>
                                            <ul className="list-disc pl-6 space-y-2">
                                                <li><strong>Account Details:</strong> Name, phone, email, date of birth, preferences. Google Sign-In, phone OTP, or institutional SSO.</li>
                                                <li><strong>Caregiver Information:</strong> Consents, government IDs (where required), and relationship info for Minors.</li>
                                                <li><strong>Health Information:</strong> Mood logs, journal entries, psychological assessments, medication schedules, audio recordings/transcripts of therapy, and AI conversation histories.</li>
                                                <li><strong>Clinical Info:</strong> Documentation created by Licensed Therapists (treatment plans, diagnostic impressions, progress notes).</li>
                                                <li><strong>Automatic Analytics:</strong> Click/tap/scroll behaviors, system error logs, device identifiers, IP addresses, and geolocation data.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 5. How We Use Information */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">5. How We Use Information</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We process your personal data under the consent obtained or legitimate uses (Section 7 of the DPDP Act) for:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>Delivering services, video consultations, and maintaining conversation context.</li>
                                                <li>Powering conversational AI wellness features and crisis detection triggers.</li>
                                                <li>Fulfilling legal compliance, research benchmarking, and product optimization.</li>
                                                <li>Preventing fraud, safeguarding user safety, and maintaining system logs.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 6. AI Processing */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">6. AI Processing &amp; Limitations</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>The Platform uses artificial intelligence technologies (proprietary and third-party) to assist with wellness suggestions. <strong>The AI System is not a doctor, psychologist, or psychiatrist and does not diagnose, prescribe, or make clinical decisions.</strong> It is a supportive tool designed to complement human-led care.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION III: DISCLOSURE & SHARING OF DATA */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section III - Information Sharing &amp; Privacy Protections
                                    </h3>

                                    {/* 7. Information Sharing */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">7. Data Disclosures</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We do not sell individual data. We share details only under strict guidelines:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>Therapists:</strong> Shared with your assigned therapist to support clinical care.</li>
                                                <li><strong>Caregivers:</strong> Clinical progress updates and notifications shared for Minor Users.</li>
                                                <li><strong>Emergency:</strong> Contact details, location, and nature of threat shared with emergency services or designated contacts.</li>
                                                <li><strong>Service Providers:</strong> Cloud hosting, secure video streams, SMS platforms, and payment processors bound by strong confidentiality contracts.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 8. Institutional Privacy */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">8. Institutional Privacy Guarantee</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2 bg-teal-50/20 p-4 rounded-xl">
                                            <p><strong>Partner institutions (schools, universities, employers) DO NOT receive:</strong></p>
                                            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                                                <li>Your individual chat conversations with the AI or human therapists.</li>
                                                <li>Your personal mood tracker logs, journal entries, or assessment scores.</li>
                                                <li>Any information that can identify you individually in relation to your mental health.</li>
                                            </ul>
                                            <p className="mt-2 text-xs font-semibold">Institutions only receive de-identified, aggregated statistical summaries regarding overall population engagement.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION IV: USER RIGHTS, RETENTION & SECURITY */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section IV - Rights, Security &amp; Data Deletion
                                    </h3>

                                    {/* 9. Cookies */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">9. Cookies &amp; Tracking</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-1">
                                            <p>We use essential cookies for platform security, functional cookies to remember settings, and analytics cookies to optimize performance. You can manage your preferences through browser configurations.</p>
                                        </div>
                                    </div>

                                    {/* 10. User Rights */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">10. Your Rights as a Data Principal</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Under the DPDP Act, you possess the rights to access, correct, update, and request erasure of your data, withdraw consent easily, nominate a representative, and seek redressal for grievances.</p>
                                            <p>To exercise these rights, email: <span className="font-bold text-[#3d838c]">support@heyattrangi.com</span>.</p>
                                        </div>
                                    </div>

                                    {/* 11 & 12. Account Deletion & AI Memory */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">11. Account Deletion &amp; AI Memory Clear</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Upon requesting deletion, we deactivate your account. AI conversational memory and chat history are wiped. However, clinical record notes must be legally retained in accordance with Section 25 of the Mental Healthcare Act, 2017.</p>
                                        </div>
                                    </div>

                                    {/* 13 & 14. Security & Breaches */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">12. Security Controls &amp; Incident Actions</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Data is secured using transit and rest encryption, role-based controls, audits, and multi-factor logins. In the event of a breach, we act immediately to contain, mitigate, notify affected users, and alert the Data Protection Board of India where required by law.</p>
                                        </div>
                                    </div>

                                    {/* 15 to 17. International, Retention & Minor consent */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">13. Data Governance</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>• <strong>Data Localization:</strong> Processing takes place within India. Cross-border transfers adhere to central notifications.</p>
                                            <p>• <strong>Retention:</strong> Retained only as long as needed for operational purposes and legal storage rules.</p>
                                            <p>• <strong>Minor Privacy:</strong> Verifiable caregiver consent is mandatory under the DPDP Act for users under 18 years.</p>
                                        </div>
                                    </div>

                                    {/* 18 & 19. Changes & Contact */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">14. Grievances &amp; Contacts</h4>
                                        <div className="pl-6 border-l-4 border-gray-300 space-y-2">
                                            <p className="font-semibold text-gray-900">For issues, queries, or notices:</p>
                                            <div className="pl-6 border-l-4 border-gray-200 text-gray-700">
                                                Email: <span className="font-bold text-[#3d838c]">support@heyattrangi.com</span><br />
                                                Website: <span className="font-bold text-[#3d838c]">www.heyattrangi.com</span><br />
                                                Grievances: Right to approach the Data Protection Board of India if issues remain unresolved.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="px-6 py-2.5 bg-[#e26843] hover:bg-[#d05732] text-white rounded-[30px] font-bold text-sm transition-all cursor-pointer"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* AI Transparency Statement Modal Overlay */}
            {showAiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50 relative">
                            <div className="text-center w-full">
                                <h1 className="font-poppins text-[16px] lg:text-[22px] font-bold text-[#243460]">
                                    AI Transparency, Safety &amp; Responsible AI Statement
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 absolute right-6 top-6"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/20">
                            <AiTransparencyStatementContent />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-6 py-2.5 bg-[#e26843] hover:bg-[#d05732] text-white rounded-[30px] font-bold text-sm transition-all cursor-pointer"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Data Processing Consent Modal Overlay */}
            {showDataConsentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50 relative">
                            <div className="text-center w-full">
                                <h1 className="font-poppins text-[18px] lg:text-[25px] font-bold text-[#243460]">
                                    Data Processing Consent
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowDataConsentModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 absolute right-6 top-6"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/20">
                            <DataProcessingConsentContent />
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowDataConsentModal(false)}
                                className="px-6 py-2.5 bg-[#e26843] hover:bg-[#d05732] text-white rounded-[30px] font-bold text-sm transition-all cursor-pointer"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Trust, Safety & Acceptable Use Policy Modal Overlay */}
            {showTrustSafetyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 relative"
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center bg-gray-50/50 relative">
                            <div className="text-center w-full">
                                <h1 className="font-poppins text-[16px] lg:text-[22px] font-bold text-[#243460]">
                                    Trust, Safety &amp; Acceptable Use Policy
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowTrustSafetyModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 absolute right-6 top-6"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/20">
                            <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">

                                {/* Effective Dates */}
                                <div className="text-center border-b border-gray-100 pb-4 mb-6">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
                                    </p>
                                </div>

                                {/* SECTION I: SCOPE & PROHIBITED ACTIVITIES */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section I - Introduction, Scope &amp; General Rules
                                    </h3>

                                    {/* 1. Introduction */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>
                                                Welcome to Hey Attrangi. This Trust, Safety &amp; Acceptable Use Policy (&quot;Policy&quot;) sets forth the standards of conduct, safety expectations, and prohibited activities governing your use of our Platform.
                                            </p>
                                            <p>
                                                This Policy is designed to protect the safety, integrity, and trustworthiness of our Platform; to ensure compliance with applicable laws; and to promote a respectful, secure, and therapeutic environment for all Users.
                                            </p>
                                            <p className="text-xs text-gray-400 italic">
                                                We are committed to the principles of an Open, Safe &amp; Trusted, and Accountable internet. Our role as an intermediary under the Information Technology Act, 2000 carries with it the obligation to exercise due diligence in hosting and managing User content.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2 & 3. Who This Policy Applies To & Responsible Use */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. Who This Policy Applies To &amp; Responsible Use</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>This Policy applies universally to all adult users, minor users (through caregivers), licensed therapists, institutional administrators, and support personnel. Responsible use means respecting the rights and wellbeing of others, protecting Platform security, and upholding the integrity of clinical treatment.</p>
                                        </div>
                                    </div>

                                    {/* 4. Prohibited Activities */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. Prohibited Activities</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Users shall not:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>Harass, threaten, stalk, bully, or abuse any individual.</li>
                                                <li>Post or transmit Content that is defamatory, obscene, or hateful.</li>
                                                <li>Manipulate, deceive, or exploit AI Systems, or engage in prompt injection/jailbreaking.</li>
                                                <li>Violate privacy rights or access other users' personal info without authorization.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION II: SPECIFIC ACTIONS */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section II - AI Safety &amp; Therapist Protections
                                    </h3>

                                    {/* AI Safety & Misuse */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">4. AI Safety &amp; Misuse</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                                                <strong>Anti-Jailbreaking:</strong> Attempting to bypass or override AI system restrictions, safety filters, or content moderation is strictly prohibited.
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                                                <strong>Prompt Injection:</strong> Attempting to manipulate AI behavior or extract instructions through injection scripts is prohibited.
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                                                <strong>Reverse Engineering:</strong> Decompiling underlying algorithms or tracking patterns to copy AI logic is prohibited.
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-150">
                                                <strong>Malicious Content:</strong> Using AI conversational systems to generate harmful or discriminatory text is prohibited.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Therapist Protection */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">5. Therapist Safeguards</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Licensed Therapists must be treated with professional respect. Users are prohibited from recording sessions without authorization, sharing a therapist's personal contact details, attempting to circumvent the Platform booking process, or offering off-platform payments to avoid platform fees.</p>
                                        </div>
                                    </div>

                                    {/* Minor Safety */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">6. Minor Safety &amp; Safeguarding</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We enforce a zero-tolerance policy against any conduct that exploits or harms minors. We comply with the Protection of Children from Sexual Offences (POCSO) Act, 2012, and will escalate any child abuse material or predatory behavior directly to legal authorities.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION III: SECURITY & ENFORCEMENT */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section III - Security, Responsible Research &amp; Enforcement
                                    </h3>

                                    {/* Platform Security */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">7. Platform Security &amp; Credentials</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Users must maintain account security by using strong credentials and not sharing log-ins. The following are strictly prohibited: data scraping, reverse-engineering the codebase, introducing malware, phishing, spoofing, or launching DDoS/DoS attacks.</p>
                                        </div>
                                    </div>

                                    {/* Responsible Security Research */}
                                    <div>
                                        <h4 className="font-bold text-[#3d838c] mb-2 uppercase text-[13px] lg:text-[15px]">8. Responsible Security Research</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 bg-teal-50/30 p-4 rounded-xl border border-teal-100 text-justify space-y-2">
                                            <p>We welcome white-hat disclosures. Researchers who identify vulnerabilities should report them responsibly to: <span className="font-bold text-[#3d838c]">support@heyattrangi.com</span>. Please include steps to reproduce and do not exfiltrate user data, disrupt services, or make public disclosures before remediation.</p>
                                        </div>
                                    </div>

                                    {/* Enforcement & Warnings */}
                                    <div>
                                        <h4 className="font-bold text-red-600 mb-2 uppercase text-[13px] lg:text-[15px]">9. Policy Enforcement &amp; Appeals</h4>
                                        <div className="pl-6 border-l-4 border-red-500 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-justify space-y-2">
                                            <p>Violations will result in proportionate action, including formal warnings, temporary feature restrictions, content removal, or permanent account ban. Appeals can be requested by emailing us within 30 days, except where clinical safety or emergency legal holds are involved.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowTrustSafetyModal(false)}
                                className="px-6 py-2.5 bg-[#e26843] hover:bg-[#d05732] text-white rounded-[30px] font-bold text-sm transition-all cursor-pointer"
                            >
                                I Understand
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

// --- SCREEN COMPONENTS ---

function ConsentScreen({
    data,
    onChange,
    onOpenTerms,
    onOpenPrivacy,
    onOpenAi,
    onOpenDataConsent,
    onOpenTrustSafety,
}: {
    data: OnboardingData
    onChange: (fields: Partial<OnboardingData>) => void
    onOpenTerms: () => void
    onOpenPrivacy: () => void
    onOpenAi: () => void
    onOpenDataConsent: () => void
    onOpenTrustSafety: () => void
}) {
    return (
        <div className="w-full max-w-xl text-left space-y-6">
            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-2 text-left">
                Consent &amp; Emergency Contact
            </h2>
            <p className="text-gray-500 text-sm font-normal leading-relaxed text-left mb-6">
                Your safety is our top priority. Please provide your emergency contact details and review our documents.
            </p>

            {/* Emergency Contact Fields */}
            <div className="bg-gray-50/50 p-5 rounded-[16px] border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 text-[15px] uppercase tracking-wider">
                    Emergency Contact Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Contact Name &amp; Relationship
                        </label>
                        <input
                            type="text"
                            value={data.emergencyContact}
                            onChange={(e) => onChange({ emergencyContact: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 placeholder-gray-400"
                            placeholder="e.g. Bharath (Brother)"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Phone Number
                        </label>
                        <div className="flex rounded-[8px] border border-gray-300 focus-within:ring-1 focus-within:ring-[#e26843] focus-within:border-[#e26843] overflow-hidden transition-all bg-white">
                            <span className="flex items-center justify-center bg-gray-50 px-4 text-gray-500 text-[15px] font-semibold border-r border-gray-200 select-none">
                                +91
                            </span>
                            <input
                                type="tel"
                                maxLength={10}
                                value={data.emergencyPhone}
                                onChange={(e) => onChange({ emergencyPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                                className="flex-1 px-4 py-3.5 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
                                placeholder="e.g. 7995736278"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Consent Checkbox */}
            <div className="bg-gray-50/50 p-5 rounded-[16px] border border-gray-100 space-y-4">
                <h3 className="font-bold text-gray-800 text-[15px] uppercase tracking-wider">
                    Consent &amp; Agreements
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                    <p className="font-semibold text-[13px] text-gray-800">Documents Included:</p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 list-disc pl-5 text-[12px] text-gray-500 font-semibold">
                        <li>
                            <button
                                type="button"
                                onClick={onOpenTerms}
                                className="text-[#e26843] hover:underline font-semibold text-left cursor-pointer outline-none bg-transparent"
                            >
                                Terms &amp; Conditions
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenPrivacy}
                                className="text-[#e26843] hover:underline font-semibold text-left cursor-pointer outline-none bg-transparent"
                            >
                                Privacy Policy
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenAi}
                                className="text-[#e26843] hover:underline font-semibold text-left cursor-pointer outline-none bg-transparent"
                            >
                                AI Transparency Statement
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenTrustSafety}
                                className="text-[#e26843] hover:underline font-semibold text-left cursor-pointer outline-none bg-transparent"
                            >
                                Trust, Safety &amp; Acceptable Use Policy
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenDataConsent}
                                className="text-[#e26843] hover:underline font-semibold text-left cursor-pointer outline-none bg-transparent"
                            >
                                Data Processing Consent
                            </button>
                        </li>
                    </ul>
                </div>

                <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={data.consentAgreed}
                        onChange={(e) => onChange({ consentAgreed: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded text-[#e26843] focus:ring-[#e26843] border-gray-300 cursor-pointer"
                    />
                    <span className="text-[13px] text-gray-600 font-semibold leading-relaxed">
                        I have read and agree to all the documents mentioned above.
                    </span>
                </label>
            </div>
        </div>
    )
}

function PersonalizationScreen({
    data,
    onChange,
    onBack,
}: {
    data: OnboardingData
    onChange: (fields: Partial<OnboardingData>) => void
    onBack?: () => void
}) {
    const handleDobChange = (dobValue: string) => {
        if (dobValue) {
            const birthDate = new Date(dobValue)
            const today = new Date()
            let calculatedAge = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--
            }
            onChange({
                dob: dobValue,
                age: calculatedAge.toString()
            })
        } else {
            onChange({ dob: "", age: "" })
        }
    }

    const languages = [
        { code: "English", name: "English" },
        { code: "Hindi", name: "Hindi" },
        { code: "Telugu", name: "Telugu" },
        { code: "Tamil", name: "Tamil" },
        { code: "Kannada", name: "Kannada" },
        { code: "Malayalam", name: "Malayalam" },
        { code: "Marathi", name: "Marathi" },
        { code: "Bengali", name: "Bengali" },
    ]

    const heardAboutOptions = [
        "Instagram",
        "LinkedIn",
        "WhatsApp",
        "Google Search",
        "Friend / Family",
        "Workplace",
        "Other",
    ]

    const fieldClass =
        "w-full px-4 py-3.5 rounded-[10px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-900 placeholder:text-gray-400 bg-white appearance-none"

    return (
        <div className="w-full max-w-xl text-left">
            {/* Mobile back chevron — matches Figma */}
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Go back"
                    className="lg:hidden mb-5 -ml-1 p-1 text-gray-900 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}

            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] text-left mb-2">
                Help us personalize your experience
            </h2>
            <p className="text-gray-500 text-[15px] font-normal leading-relaxed text-left mb-8">
                Please provide a few details to help us customize the platform for you.
            </p>

            <div className="space-y-6">
                {/* 1. Name */}
                <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        What&apos;s your name?
                    </label>
                    <input
                        type="text"
                        value={data.name || ""}
                        onChange={(e) => onChange({ name: e.target.value })}
                        className={fieldClass}
                        placeholder="Enter your name"
                        required
                    />
                </div>

                {/* 2. Birthday */}
                <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        Birthday
                    </label>
                    <input
                        type="date"
                        value={data.dob || ""}
                        onChange={(e) => handleDobChange(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className={`${fieldClass} cursor-pointer`}
                        required
                    />
                </div>

                {/* 3. Language */}
                <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        What&apos;s your preferred language?
                    </label>
                    <div className="relative">
                        <select
                            value={data.preferredLanguage || "English"}
                            onChange={(e) => onChange({ preferredLanguage: e.target.value })}
                            className={`${fieldClass} cursor-pointer pr-10`}
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* 4. Heard About Us */}
                <div>
                    <label className="block text-[15px] font-bold text-gray-900 mb-2">
                        How did you hear about us?{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                        <select
                            value={data.heardAboutUs || ""}
                            onChange={(e) => onChange({ heardAboutUs: e.target.value })}
                            className={`${fieldClass} cursor-pointer pr-10`}
                        >
                            <option value="" disabled>
                                Select an option
                            </option>
                            {heardAboutOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}

function OrganizationScreen({ selected, onSelect }: { selected: string; onSelect: (o: string) => void }) {
    const [orgs, setOrgs] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/public/organizations")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrgs(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <div className="w-full max-w-lg text-left">
            <h2 className="text-[22px] font-semibold text-gray-800 tracking-tight text-left mb-2">Are you joining from an institution?</h2>
            <p className="text-gray-500 text-sm font-normal leading-relaxed text-left mb-6">Select your organization to access premium benefits.</p>

            {loading ? (
                <p className="text-gray-400 animate-pulse">Loading organizations...</p>
            ) : (
                <div className="space-y-4 text-left">
                    <select
                        className="w-full px-4 py-3.5 rounded-[8px] border border-gray-300 focus:ring-1 focus:ring-[#e26843] focus:border-[#e26843] outline-none transition-all text-[15px] text-gray-800 bg-white font-medium cursor-pointer"
                        value={selected}
                        onChange={(e) => onSelect(e.target.value)}
                    >
                        <option value="" disabled>Select your organization</option>
                        <option value="none">I am not part of an organization</option>
                        {orgs.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    {selected === "none" && (
                        <p className="text-sm text-gray-400 pl-2">You will continue with a standard account.</p>
                    )}
                </div>
            )}
        </div>
    )
}

function MoodScreen({ selected, onSelect }: { selected: string; onSelect: (m: string) => void }) {
    const moods = [
        { label: "Cry", icon: "😭" },
        { label: "Angry", icon: "😠" },
        { label: "Neutral", icon: "😐" },
        { label: "Sad", icon: "😔" },
        { label: "Smile", icon: "😊" },
    ]

    return (
        <div className="w-full text-left">
            <h2 className="text-[22px] font-semibold text-gray-800 tracking-tight text-left mb-6">How are you feeling today?</h2>
            <div className="flex flex-wrap justify-center gap-3">
                {moods.map((m) => (
                    <button
                        key={m.label}
                        onClick={() => onSelect(m.label)}
                        className={`w-20 h-20 rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${selected === m.label
                            ? "bg-[#e26843] text-white shadow-[0_8px_30px_rgb(226,104,67,0.15)] scale-105"
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                    >
                        <span className="text-3xl mb-1">{m.icon}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${selected === m.label ? "text-white" : "text-gray-400"}`}>
                            {m.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ExperienceScreen({ selected, onSelect }: { selected: string; onSelect: (e: string) => void }) {
    const options = [
        { id: "new", title: "Just Getting Started", sub: "First time trying therapy" },
        { id: "some", title: "Some experience", sub: "Been to a few sessions before" },
        { id: "pro", title: "Veteran", sub: "Regular therapy participant" },
    ]

    return (
        <div className="w-full max-w-2xl text-left">
            <h2 className="text-[22px] font-semibold text-gray-800 tracking-tight text-left mb-6">What is your experience level with therapy?</h2>
            <div className="grid grid-cols-1 gap-3.5">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className={`w-full p-5 rounded-[16px] text-left transition-all duration-300 border-2 cursor-pointer ${selected === opt.id
                            ? "bg-white border-[#e26843] text-[#e26843] shadow-[0_8px_30px_rgb(226,104,67,0.08)] scale-[1.02]"
                            : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100 hover:border-gray-200"
                            }`}
                    >
                        <h4 className={`font-bold text-base mb-1 ${selected === opt.id ? "text-[#e26843]" : "text-gray-800"}`}>{opt.title}</h4>
                        <p className={`text-xs ${selected === opt.id ? "text-[#e26843]/80" : "text-gray-400"}`}>{opt.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

function PricingScreen({
    selectedPlan,
    onSelectPlan,
    onOpenTerms,
    onOpenPrivacy,
    onSkip,
}: {
    selectedPlan: "ESSENTIAL" | "PREMIUM"
    onSelectPlan: (plan: "ESSENTIAL" | "PREMIUM") => void
    onOpenTerms: () => void
    onOpenPrivacy: () => void
    onSkip: () => void
}) {
    const unlockFeatures = [
        {
            title: "Personalised Wellbeing Plan",
            subtitle: "5-min a day to rewire your mindset",
            bg: "bg-[#f3a69a]",
            icon: (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l1.4 4.3h4.5l-3.6 2.7 1.4 4.3L12 10.6 8.3 13.3l1.4-4.3-3.6-2.7h4.5L12 2zm7 12l.9 2.7h2.8l-2.3 1.7.9 2.7-2.3-1.7-2.3 1.7.9-2.7-2.3-1.7h2.8L19 14zm-14 0l.9 2.7h2.8l-2.3 1.7.9 2.7-2.3-1.7-2.3 1.7.9-2.7-2.3-1.7h2.8L5 14z" />
                </svg>
            ),
        },
        {
            title: "AI Insights",
            subtitle: "Uncover surprising patterns about you",
            bg: "bg-[#c4b0d8]",
            icon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h3l2-5 3 10 3-7 2 2h5" />
                </svg>
            ),
        },
        {
            title: "Mood Dashboard",
            subtitle: "Keep track of your progress",
            bg: "bg-[#e8c96a]",
            icon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-5 3 3 5-7 4 4" />
                </svg>
            ),
        },
        {
            title: "Longer Conversations",
            subtitle: "Record up to 20 minutes per entry",
            bg: "bg-[#8eb8d8]",
            icon: (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm5-3a5 5 0 01-10 0M12 19v3m-4 0h8" />
                </svg>
            ),
        },
    ]

    return (
        <div className="w-full max-w-xl text-left flex flex-col">
            {/* Unlock more ways to feel better */}
            <div className="mb-4">
                <h2 className="text-[24px] lg:text-[26px] font-bold text-gray-900 tracking-tight leading-[1.2] text-left mb-3">
                    Unlock more ways to feel better
                </h2>
                <div className="flex flex-col gap-3">
                    {unlockFeatures.map((feature) => (
                        <div key={feature.title} className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-[10px] ${feature.bg} flex items-center justify-center shrink-0`}>
                                {feature.icon}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-[14px] text-gray-900 leading-snug">{feature.title}</h4>
                                <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{feature.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Title */}
            <h2 className="text-[24px] lg:text-[26px] font-bold text-gray-900 tracking-tight leading-[1.2] text-left mb-3">
                Start your journey
            </h2>

            {/* Plans List */}
            <div className="w-full space-y-2.5 text-left">
                {/* Card 1: Companion (Premium) */}
                <div
                    onClick={() => onSelectPlan("PREMIUM")}
                    className={`relative border-2 rounded-[16px] p-3.5 cursor-pointer flex items-center justify-between transition-all duration-300 select-none ${selectedPlan === "PREMIUM"
                        ? "border-[#e26843] bg-[#fffbf7] shadow-lg shadow-orange-500/5"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30"
                        }`}
                >
                    <div className="flex flex-col gap-1.5 flex-1 pr-3">
                        <span
                            className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-max ${selectedPlan === "PREMIUM"
                                ? "bg-[#e26843] text-white"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            Best Offer
                        </span>
                        <div>
                            <h4 className="font-bold text-base text-gray-900 leading-tight">Companion</h4>
                            <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-snug">
                                Unlimited AI support &amp; long-term memory
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-right">
                        <div>
                            <span className="block font-black text-lg text-gray-900">₹149.00</span>
                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">per month</span>
                        </div>

                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "PREMIUM"
                                ? "bg-[#e26843] border-[#e26843]"
                                : "border-gray-200"
                                }`}
                        >
                            {selectedPlan === "PREMIUM" && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Listener (Essential) */}
                <div
                    onClick={() => onSelectPlan("ESSENTIAL")}
                    className={`relative border-2 rounded-[16px] p-3.5 cursor-pointer flex items-center justify-between transition-all duration-300 select-none ${selectedPlan === "ESSENTIAL"
                        ? "border-[#e26843] bg-[#fffbf7] shadow-lg shadow-orange-500/5"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30"
                        }`}
                >
                    <div className="flex flex-col gap-1.5 flex-1 pr-3">
                        <span
                            className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-max ${selectedPlan === "ESSENTIAL"
                                ? "bg-[#e26843] text-white"
                                : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            Easy Start
                        </span>
                        <div>
                            <h4 className="font-bold text-base text-gray-900 leading-tight">Listener</h4>
                            <p className="text-[11px] font-medium text-gray-500 mt-0.5 leading-snug">
                                Daily check-ins &amp; basic mood tracking
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-right">
                        <div>
                            <span className="block font-black text-lg text-gray-900">₹49.00</span>
                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">per month</span>
                        </div>

                        <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "ESSENTIAL"
                                ? "bg-[#e26843] border-[#e26843]"
                                : "border-gray-200"
                                }`}
                        >
                            {selectedPlan === "ESSENTIAL" && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer cluster — tight under plans, no large empty gap */}
            <div className="mt-4 flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold tracking-wide">
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Cancel anytime</span>
                </div>

                <div className="flex gap-5 mt-2 text-xs font-semibold text-gray-400">
                    <button onClick={onOpenTerms} className="underline hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
                        Terms
                    </button>
                    <button onClick={onOpenPrivacy} className="underline hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer">
                        Privacy Policy
                    </button>
                </div>
            </div>
        </div>
    )
}

function FinalScreen({ userName }: { userName: string }) {
    return (
        <div className="w-full text-left">
            <h2 className="text-[22px] font-bold text-gray-800 text-left leading-[1.3] mb-6">
                Thanks for sharing, {userName}.<br />We&apos;re here with you.
            </h2>
        </div>
    )
}
