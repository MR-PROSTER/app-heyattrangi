"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

type OnboardingData = {
    age: string
    orgId: string
    mood: string
    experience: string
    reasons: string[]
    emergencyContact: string
    emergencyPhone: string
    consentAgreed: boolean
}

const STEPS_COUNT = 7

export default function PatientOnboarding() {
    const router = useRouter()
    const { data: session } = useSession()

    const [step, setStep] = useState(0)
    const [data, setData] = useState<OnboardingData>({
        age: "",
        orgId: "",
        mood: "",
        experience: "",
        reasons: [],
        emergencyContact: "",
        emergencyPhone: "",
        consentAgreed: false,
    })
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
                            setStep(7)
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
                    color: "#3d838c",
                },
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.on("payment.failed", function (response: any) {
                alert(`Payment Failed: ${response.error.description}`)
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
        if (step === 5) {
            if (data.orgId && data.orgId !== "none") {
                setStep(7) // Skip pricing screen
            } else {
                setStep(6)
            }
        } else if (step === 6) {
            handlePayment()
        } else {
            setStep((s) => s + 1)
        }
    }

    const handleBack = () => {
        if (step === 7) {
            if (data.orgId && data.orgId !== "none") {
                setStep(5) // Skip pricing screen
            } else {
                setStep(6)
            }
        } else {
            setStep((s) => s - 1)
        }
    }

    const handleFinish = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/onboarding/patient", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age: data.age,
                    orgId: data.orgId === "none" ? undefined : data.orgId,
                    gender: "Not specified",
                    healthConcerns: data.reasons,
                    emergencyContact: data.emergencyContact,
                    emergencyPhone: data.emergencyPhone,
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

    const userName = session?.user?.name?.split(" ")[0] || "Sam" // Fallback to Sam for demo

    const toggleReason = (reason: string) => {
        setData((prev) => ({
            ...prev,
            reasons: prev.reasons.includes(reason)
                ? prev.reasons.filter((r) => r !== reason)
                : [...prev.reasons, reason],
        }))
    }

    const isContinueDisabled = (step === 0 && (!data.emergencyContact || !data.emergencyPhone || !data.consentAgreed)) || isProcessingPayment

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f0f7f8] overflow-hidden font-sans">

            {/* Background Abstract Shapes */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#4f9da6]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-10 right-20 w-32 h-32 bg-[#c9e4e7] rounded-full opacity-60" />
            <div className="absolute top-5 right-5 w-12 h-32 bg-[#8bc4c9] rounded-full opacity-40 rotate-12" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full max-w-4xl px-4 flex flex-col items-center"
                >
                    {/* Main Content Card */}
                    <div className="relative w-full bg-white rounded-[48px] p-10 md:p-16 flex flex-col items-center shadow-2xl shadow-teal-900/10 min-h-[480px]">

                        {/* Progress Bar */}
                        {step >= 1 && step <= 6 && (
                            <div className="absolute top-8 right-12 w-32 h-1.5 bg-[#e0f2f3] rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#3d838c]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(step / STEPS_COUNT) * 100}%` }}
                                />
                            </div>
                        )}

                        {/* Content Switcher */}
                        <div className="flex-1 w-full flex flex-col items-center justify-center text-center z-10">
                            {step === 0 && (
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
                            {step === 1 && <AgeScreen selected={data.age} onSelect={(a) => setData({ ...data, age: a })} />}
                            {step === 2 && <OrganizationScreen selected={data.orgId} onSelect={(o) => setData({ ...data, orgId: o })} />}
                            {step === 3 && <MoodScreen selected={data.mood} onSelect={(m) => setData({ ...data, mood: m })} />}
                            {step === 4 && <ExperienceScreen selected={data.experience} onSelect={(e) => setData({ ...data, experience: e })} />}
                            {step === 5 && <ReasonScreen selected={data.reasons} onToggle={toggleReason} />}
                            {step === 6 && (
                                <PricingScreen
                                    selectedPlan={selectedPlan}
                                    onSelectPlan={setSelectedPlan}
                                    onOpenTerms={() => setShowTermsModal(true)}
                                    onOpenPrivacy={() => setShowPrivacyModal(true)}
                                    onSkip={() => setStep(7)}
                                />
                            )}
                            {step === 7 && <FinalScreen userName={userName} />}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-12 flex flex-col items-center gap-6 z-10">
                            <div className="flex items-center gap-4">
                                {step === 0 && (
                                    <button onClick={() => setStep(7)} className="px-10 py-3.5 rounded-2xl bg-[#f0f7f8]/80 hover:bg-[#e0f2f3] text-[#666] font-bold text-sm transition-all">
                                        Skip
                                    </button>
                                )}
                                {step > 0 && step < 7 && (
                                    <button onClick={handleBack} className="px-10 py-3.5 rounded-2xl bg-[#f0f7f8]/80 hover:bg-[#e0f2f3] text-[#666] font-bold text-sm transition-all">
                                        Back
                                    </button>
                                )}

                                {step < 7 ? (
                                    <button
                                        onClick={handleNext}
                                        disabled={isContinueDisabled}
                                        className="px-12 py-3.5 rounded-2xl bg-[#3d838c] hover:bg-[#2c656d] text-white font-black text-sm shadow-xl shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {step === 6 ? (isProcessingPayment ? "Processing..." : "Pay & Continue") : "Continue"} <span className="text-lg">→</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleFinish}
                                        disabled={isLoading}
                                        className="px-14 py-4 rounded-2xl bg-[#3d838c] hover:bg-[#2c656d] text-white font-black text-base shadow-xl shadow-teal-200 transition-all flex items-center gap-2"
                                    >
                                        {isLoading ? "Starting..." : "Welcome to Attrangi!"} <span className="text-xl">→</span>
                                    </button>
                                )}
                            </div>

                            {/* Progress Dots Indicator */}
                            {step < 7 && (
                                <div className="flex gap-2.5">
                                    {[...Array(7)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${i === step ? "bg-[#3d838c] w-4" : "bg-[#e0f2f3]"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Absolute Illustrations */}
                        {step === 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute bottom-4 left-6 pointer-events-none hidden md:block"
                            >
                                <Image
                                    src="/onboarding_images/2.png"
                                    alt="Onboarding Illustration"
                                    width={220}
                                    height={150}
                                    className="object-contain"
                                />
                            </motion.div>
                        )}

                        {step === 7 && (
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute bottom-4 left-6 pointer-events-none hidden md:block"
                            >
                                <Image
                                    src="/onboarding_images/5.png"
                                    alt="Final Illustration"
                                    width={180}
                                    height={180}
                                    className="object-contain"
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

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
                            <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">

                                {/* Effective Dates */}
                                <div className="text-center border-b border-gray-100 pb-4 mb-6">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
                                    </p>
                                </div>

                                {/* PART I: INTRODUCTION & FOUNDATIONAL TERMS */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part I - Introduction &amp; Foundational Terms
                                    </h3>

                                    {/* 1. Introduction */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>
                                                Welcome to Hey Attrangi. These Terms &amp; Conditions (&quot;Terms&quot;) form a legally binding agreement between you (&quot;you&quot;, &quot;your&quot;, or &quot;User&quot;) and Aatrangi Private Limited (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) regarding your access to and use of the Hey Attrangi platform (the &quot;Platform&quot;).
                                            </p>
                                            <p>
                                                The Platform includes all websites, web applications, mobile applications, therapist portals, administrative dashboards, institutional dashboards, application programming interfaces (APIs), and any future products, modules, and official services we develop.
                                            </p>
                                            <p>
                                                By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Platform.
                                            </p>
                                            <p className="text-xs text-gray-400 italic">
                                                These Terms are published in compliance with the Information Technology Act, 2000, the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and other applicable laws of the Republic of India.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. Scope */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. Scope</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>These Terms apply to all Users of the Platform, including:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>Users who access AI-assisted wellness features.</li>
                                                <li>Patients who receive therapist-led clinical or therapeutic services.</li>
                                                <li>Caregivers who create and manage accounts for Minor Users.</li>
                                                <li>Licensed Therapists who provide Services through the Platform.</li>
                                                <li>Institutional Administrators representing partner institutions.</li>
                                                <li>Any other individual or entity accessing or using the Platform.</li>
                                            </ul>
                                            <p>These Terms apply to all products, services, websites, applications, and platforms operated under the Hey Attrangi brand, including all current and future offerings.</p>
                                        </div>
                                    </div>

                                    {/* 3. Relationship with Other Documents */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. Relationship with Other Documents</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-3">
                                            <p>These Terms should be read together with the following documents, which together form the complete legal framework governing your use of the Platform:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-gray-600 bg-gray-50 p-4 rounded-xl">
                                                <div>• General Treatment Consent</div>
                                                <div>• AI Assistance Consent</div>
                                                <div>• Teletherapy Consent</div>
                                                <div>• Session Recording Consent</div>
                                                <div>• Emergency Contact Authorization</div>
                                                <div>• Crisis Intervention Consent</div>
                                                <div>• Data Processing Consent</div>
                                                <div>• Electronic Communication Consent</div>
                                                <div>• Privacy Policy</div>
                                                <div>• Data Retention &amp; Deletion Policy</div>
                                            </div>
                                            <p><strong>Document Hierarchy:</strong> In the event of any conflict between these Terms and any other document:</p>
                                            <ul className="list-disc pl-6 space-y-1 text-xs">
                                                <li>Applicable law shall prevail over all documents.</li>
                                                <li>The General Treatment Consent shall prevail over these Terms with respect to therapist-led clinical services.</li>
                                                <li>The AI Assistance Consent shall prevail over these Terms with respect to AI-specific provisions.</li>
                                                <li>These Terms shall prevail over the Privacy Policy and Data Retention &amp; Deletion Policy with respect to contractual terms.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 4. Definitions */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">4. Definitions</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <ul className="space-y-2 text-sm">
                                                <li><strong>&quot;Platform&quot;</strong> means the digital mental health platform operated by the Company under the brand name &quot;Hey Attrangi&quot;, including all websites, web applications, mobile applications, therapist portals, dashboards, and future products.</li>
                                                <li><strong>&quot;Services&quot;</strong> means the mental wellness and therapeutic services provided through the Platform, including AI-assisted wellness features, therapist consultations, mood tracking, journaling, assessments, and related tools.</li>
                                                <li><strong>&quot;User&quot;</strong> means any individual who registers on, accesses, or uses any feature of the Platform.</li>
                                                <li><strong>&quot;Patient&quot;</strong> means a User who receives therapist-led clinical or therapeutic services through the Platform.</li>
                                                <li><strong>&quot;Minor&quot;</strong> means a User below the age of eighteen (18) years.</li>
                                                <li><strong>&quot;Caregiver&quot;</strong> means a parent or legal guardian who creates and manages an account for a Minor.</li>
                                                <li><strong>&quot;Licensed Therapist&quot;</strong> means a mental health professional who holds a valid license to practice and provides Services through the Platform.</li>
                                                <li><strong>&quot;AI System&quot;</strong> means the artificial intelligence-powered components of the Platform, including chatbots, algorithmic recommendations, and crisis detection models.</li>
                                                <li><strong>&quot;User Content&quot;</strong> means any content, information, data, journal entries, or logs submitted by you to the Platform.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 5. Amendments */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">5. Amendments</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>We reserve the right to amend these Terms at any time, in our sole discretion, subject to applicable law. When we make material changes to these Terms, we will notify you through the Platform, registered email, or in-app notifications.</p>
                                            <p>Your continued use of the Platform after the effective date of any changes constitutes your acceptance of the updated Terms.</p>
                                        </div>
                                    </div>

                                    {/* 6. Interpretation */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">6. Interpretation</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>• Headings are for convenience only and do not affect interpretation.</p>
                                            <p>• Singular words include the plural and vice versa.</p>
                                            <p>• &quot;Include&quot; or &quot;including&quot; means &quot;including without limitation&quot;.</p>
                                            <p>• &quot;Shall&quot; indicates a mandatory requirement; &quot;may&quot; indicates a discretionary action.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART II: ELIGIBILITY & ACCOUNTS */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part II - Eligibility &amp; Accounts
                                    </h3>

                                    {/* Eligibility */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">7. Eligibility</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>The Platform is available to individuals who are at least three (3) years of age.</p>
                                            <p><strong>Minor Users (Under 18):</strong> Individuals below the age of eighteen (18) years may only access the Platform under the following conditions:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>A Caregiver must create and manage the Minor User's account.</li>
                                                <li>The Caregiver must provide verifiable consent for data processing under the Digital Personal Data Protection Act, 2023.</li>
                                                <li>Therapy sessions with Licensed Therapists must always be managed by the Caregiver.</li>
                                                <li>The Minor User may independently access only the AI conversational companion, mood tracking, guided journaling, and wellness activities under supervision.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Account Creation & Authentication */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">8. Account Creation &amp; Authentication</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>To access the Services, you must create an account. Supported authentication methods include:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>Google Sign-In:</strong> Sign in via your Google account (grants name, email, profile photo).</li>
                                                <li><strong>Phone OTP:</strong> Sign in securely via a one-time password sent to your mobile.</li>
                                                <li><strong>Institutional Single Sign-On (SSO):</strong> Sign in using your partner institution credentials.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Caregiver Accounts */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">9. Caregiver Accounts</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>Caregiver accounts are created and managed by the Caregiver on behalf of a Minor User. The Caregiver is the legal account owner and is responsible for all activities, therapy-related decisions, accurate information updates, and supervision.</p>
                                        </div>
                                    </div>

                                    {/* Account Security */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">10. Account Security</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>You are responsible for keeping credentials secure, using unique strong passwords, enabling multi-factor authentication where available, and logging out after each session. The Company is not liable for unauthorized access resulting from user negligence.</p>
                                        </div>
                                    </div>

                                    {/* Account Verification */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">11. Account Verification</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>We may require you to verify your identity at any time (e.g. via government-issued ID, contact details confirmation) before accessing therapist-led services or updating sensitive account details.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART III: PLATFORM SERVICES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part III - Platform Services
                                    </h3>

                                    {/* Services Overview */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">12. Services Overview</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>The Platform provides AI Wellness tools, therapist video consultations, mood tracking, guided journaling, assessments, medication reminders, and wellness activities. We do not provide emergency services, psychiatric diagnosis via AI, voice calling, or direct user messaging.</p>
                                        </div>
                                    </div>

                                    {/* Service Availability */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">13. Service Availability</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>We aim for high availability but do not guarantee uninterrupted or error-free access. Maintenance, technical upgrades, server outages, or Force Majeure may cause temporary downtime.</p>
                                        </div>
                                    </div>

                                    {/* Beta Features */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">14. Beta Features</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>We may offer experimental or Beta Features which are provided &quot;as is&quot; and used at your own risk. These may contain bugs, change without notice, or be discontinued at any time.</p>
                                        </div>
                                    </div>

                                    {/* Modifications & Third Party */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">15. Modifications &amp; Third-Party Services</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>We reserve the right to modify or discontinue any Services or pricing at our sole discretion. Any integration with Third-Party Services is provided &quot;as is&quot;, and your use of them is governed by their respective third-party terms.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART IV: AI SERVICES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part IV - AI Services
                                    </h3>

                                    {/* AI Services */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">16. AI Services &amp; Limitations</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>The Platform incorporates AI wellness support. <strong>You acknowledge that the AI System is NOT a therapist, psychiatrist, doctor, or medical professional.</strong> It does not diagnose, prescribe medication, or replace professional human care.</p>
                                            <p>AI memory is kept to provide continuity of care, but you may request its deletion at any time where feasible.</p>
                                        </div>
                                    </div>

                                    {/* AI Crisis Detection */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">17. AI Crisis Detection Disclaimer</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>While our AI has crisis detection capabilities designed to identify potential indicators, it is not an emergency response service and must never be relied upon in critical situations.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART V: THERAPIST SERVICES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part V - Therapist Services
                                    </h3>

                                    {/* Therapist Services */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">18. Therapist Consultations &amp; Relationship</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>Therapy services are delivered exclusively by independent Licensed Therapists. The Platform acts solely as a facilitator for secure video consultations. The clinical relationship is strictly between the User and the therapist; the Company is not a party to this relationship and is not liable for their clinical decisions or services.</p>
                                        </div>
                                    </div>

                                    {/* Emergency Services */}
                                    <div>
                                        <h4 className="font-bold text-red-600 mb-2 uppercase text-[13px] lg:text-[15px]">19. Emergency Services Disclaimer</h4>
                                        <div className="pl-6 border-l-4 border-red-500 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-justify">
                                            HEY ATTRANGI IS NOT AN EMERGENCY RESPONSE SERVICE AND DOES NOT PROVIDE EMERGENCY CLINICAL CARE. IF YOU ARE EXPERIENCING A MENTAL HEALTH CRISIS, SEVERE DEPRESSION, OR THOUGHTS OF SELF-HARM/SUICIDE, YOU MUST IMMEDIATELY CALL YOUR LOCAL EMERGENCY SERVICES (SUCH AS 112 IN INDIA) OR VISIT THE NEAREST HOSPITAL EMERGENCY DEPARTMENT.
                                        </div>
                                    </div>
                                </div>

                                {/* PART VI: INSTITUTIONAL SERVICES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part VI - Institutional Services
                                    </h3>

                                    {/* Institutional Privacy */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">20. Institutional Services &amp; Privacy</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>We provide wellness services to partner institutions. <strong>Partner institutions do NOT receive:</strong> therapy conversation content, AI companion history, journal entries, assessment responses, or individual clinical records.</p>
                                            <p>They receive only aggregated statistical reports and wellbeing insights at an institutional, de-identified level.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART VII: SUBSCRIPTIONS & PAYMENTS */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part VII - Subscriptions &amp; Payments
                                    </h3>

                                    {/* Subscriptions & Payments */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">21. Subscriptions, Payments &amp; Refunds</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>Certain Services are subscription-based. Payments are processed through secure third-party gateways. Except as required by applicable laws or stated in our Refund Policy, all subscription and booking fees are non-refundable. Cancellations take effect at the end of the current billing cycle.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART VIII: USER CONTENT */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part VIII - User Content
                                    </h3>

                                    {/* User Content */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">22. User Content &amp; License</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>You retain ownership of any text, mood logs, or inputs you submit. You grant the Company a royalty-free, worldwide, non-exclusive license to use and store User Content solely to provide Services, improve AI features, and generate anonymous wellness plans under strict privacy safeguards.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART IX: INTELLECTUAL PROPERTY */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Part IX - Intellectual Property &amp; Developer Terms
                                    </h3>

                                    {/* Intellectual Property */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">23. Company Intellectual Property</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>All software, branding, trademarks, logos, source code, algorithms, and AI models on the Platform are the exclusive property of the Company. You are granted a limited, personal, non-commercial license to access the Platform, which terminates upon breach of these Terms.</p>
                                        </div>
                                    </div>

                                    {/* Feedback & APIs */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">24. Feedback &amp; API Terms</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>Any suggestions or feedback you submit become the exclusive property of the Company. Use of Platform APIs is subject to rate-limiting, authentication controls, and suspension rules, and may be modified or retired at any time.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART X & XI: SECURITY & ACCEPTABLE USE */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Parts X &amp; XI - Platform Security &amp; Acceptable Use
                                    </h3>

                                    {/* Security */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">25. Platform Security</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>We maintain reasonable encryption, access controls, and monitoring in compliance with the Digital Personal Data Protection Act, 2023. Vulnerabilities and security breaches must be reported immediately to: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span>.</p>
                                        </div>
                                    </div>

                                    {/* Acceptable Use */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">26. Acceptable Use &amp; Prohibited Conduct</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>You agree to use the Platform in a lawful manner. Prohibited conduct includes:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>Illegal activity or harassment/discrimination.</li>
                                                <li>Hate speech, obscenity, or sharing malicious/harmful code.</li>
                                                <li>Attempting prompt injections, jailbreaking, or algorithmic manipulation.</li>
                                                <li>Decompiling, scraping, or data mining the Platform.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* PART XII TO XV: SUSPENSION, DISCLAIMERS & LIMITATIONS */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Parts XII to XV - Liability, Disclaimers &amp; Indemnity
                                    </h3>

                                    {/* Suspension & Termination */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">27. Account Suspension &amp; Termination</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>We reserve the right to suspend or terminate your account immediately if you breach these Terms, pose security risks, or violate applicable laws. You may delete your account at any time via the Platform settings.</p>
                                        </div>
                                    </div>

                                    {/* Disclaimers */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">28. Disclaimers</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>THE PLATFORM AND SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND. AI output accuracy is not guaranteed, and therapist recommendations are the sole responsibility of the independent Licensed Therapists.</p>
                                        </div>
                                    </div>

                                    {/* Limitation of Liability */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">29. Limitation of Liability</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY IS NOT LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR PUNITIVE DAMAGES. THE TOTAL LIABILITY OF THE COMPANY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE PRECEDING TWELVE (12) MONTHS OR INR 5,000, WHICHEVER IS GREATER.</p>
                                        </div>
                                    </div>

                                    {/* Indemnification */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">30. Indemnification</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-1">
                                            <p>You agree to indemnify and hold harmless the Company, its officers, employees, and independent therapists from claims arising out of your misuse of the Platform, User Content, or violation of these Terms or applicable laws.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PART XVI & XVII: DISPUTE RESOLUTION & GENERAL */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Parts XVI &amp; XVII - Dispute Resolution &amp; General Provisions
                                    </h3>

                                    {/* Governing Law & Dispute Resolution */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">31. Governing Law &amp; Dispute Resolution</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>These Terms are governed by the laws of the Republic of India. Any disputes will be resolved first via mediation and then final binding arbitration in Dharwad, Karnataka, under the Arbitration and Conciliation Act, 1996. The courts of Dharwad have exclusive jurisdiction. Class action is waived.</p>
                                        </div>
                                    </div>

                                    {/* General Provisions */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">32. General Legal Provisions</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 text-justify space-y-2">
                                            <p>• <strong>Force Majeure:</strong> Neither party is liable for defaults due to events beyond reasonable control (natural disasters, network outages, pandemics, cyberattacks).</p>
                                            <p>• <strong>Severability:</strong> If any provision is found illegal, the rest remain fully in force.</p>
                                            <p>• <strong>Entire Agreement:</strong> These Terms constitute the complete legal framework governing your use of the Platform.</p>
                                        </div>
                                    </div>

                                    {/* Contact Us */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">33. Contact Us</h4>
                                        <div className="pl-6 border-l-4 border-gray-300 space-y-3">
                                            <p className="font-bold text-gray-900">Aatrangi Private Limited</p>
                                            <div className="pl-6 border-l-4 border-gray-200 text-gray-700 mt-1">
                                                Email: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span><br />
                                                Website: <span className="font-bold text-[#3d838c]">www.heyattrangi.com</span><br />
                                                Address: Jai Jinendra Banglow, Hubli–Dharwad Road, KHB Colony, Narayanpura, Dharwad, Karnataka – 580009, India
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="px-6 py-2.5 bg-[#3d838c] hover:bg-[#2c656d] text-white rounded-xl font-bold text-sm transition-all"
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
                                            <p>To exercise these rights, email: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span>.</p>
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
                                                Email: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span><br />
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
                                className="px-6 py-2.5 bg-[#3d838c] hover:bg-[#2c656d] text-white rounded-xl font-bold text-sm transition-all"
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
                            <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">

                                {/* Effective Dates */}
                                <div className="text-center border-b border-gray-100 pb-4 mb-6">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
                                    </p>
                                </div>

                                {/* SECTION I: INTRODUCTION & PURPOSE */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section I - Introduction &amp; Scope
                                    </h3>

                                    {/* 1. Introduction */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>
                                                Welcome to Hey Attrangi. This AI Transparency, Safety &amp; Responsible AI Statement explains how we design, deploy, monitor, evaluate, and govern Artificial Intelligence systems across our Platform.
                                            </p>
                                            <p>
                                                We are committed to responsible, ethical, and transparent AI deployment in digital mental healthcare. This Statement demonstrates our commitment to ensuring that AI serves humanity, benefits people's lives, and addresses potential harms while fostering responsible innovation.
                                            </p>
                                            <p className="text-xs text-gray-400 italic">
                                                This Statement is designed to comply with applicable laws of the Republic of India, including the Digital Personal Data Protection Act, 2023, and the Information Technology Act, 2000. It is also informed by the World Health Organization's guidance on the ethics and governance of artificial intelligence for health.
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2 & 3. What AI Is Used For & Limitations */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. AI Boundaries &amp; Scope</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p><strong>What AI Is Used For:</strong> AI assists with conversational emotional support, mood tracking analytics, personalized wellness recommendations, crisis detection indicators, clinical documentation support, and therapist workflow assistance.</p>
                                            <p><strong>What AI Cannot Do:</strong> The AI System is NOT a doctor, therapist, or psychiatrist. It does not diagnose, prescribe medication, or replace human clinical judgment. It cannot guarantee any specific outcome and should never be used as the sole source of mental health support or emergency services.</p>
                                        </div>
                                    </div>

                                    {/* 4 & 5. Therapists and Rights */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. The Role of Therapists &amp; User Rights</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Licensed Therapists remain solely responsible for all clinical decisions and retain full authority to review, modify, or disregard AI suggestions. As a User, you have the right to understand how AI is used, request plain-language explanations of outputs, manage AI memory, or withdraw consent at any time.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION II: RESPONSIBLE AI PRINCIPLES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section II - Principles of Responsible AI
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">1. Human Oversight</strong>
                                            <p className="text-gray-600">AI augments rather than replaces human clinical judgment. Clinical actions require therapist review.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">2. Safety First</strong>
                                            <p className="text-gray-600">Safety thresholds and "Do No Harm" parameters guide all deployment and incident response workflows.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">3. Privacy by Design</strong>
                                            <p className="text-gray-600">Data minimization, DPDP safeguards, and caregiver consent validations are built into the design.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">4. Clinical Responsibility</strong>
                                            <p className="text-gray-600">Clinical notes clearly distinguish between AI-generated content suggestions and actual clinician inputs.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">5. Transparency &amp; Explainability</strong>
                                            <p className="text-gray-600">You are clearly notified when interacting with AI. Plain-language output explanations can be requested.</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-1">
                                            <strong className="text-gray-900 text-[13px] font-bold">6. Fairness &amp; Bias Mitigation</strong>
                                            <p className="text-gray-600">AI models are continuously evaluated across diverse user populations to prevent unfair bias and discrimination.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION III: SAFETY & GOVERNANCE */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section III - Capabilities, Safety &amp; Governance
                                    </h3>

                                    {/* Capabilities */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">10. Model Capabilities &amp; Origin</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We combine proprietary internal models, open-source architectures, and trusted third-party commercial AI models. All deployments, regardless of origin, are subject to this Statement. Capabilities include conversational listening, sentiment tracking, screening assessment delivery, multilingual chat support, and clinical helper utilities.</p>
                                        </div>
                                    </div>

                                    {/* AI Safety */}
                                    <div>
                                        <h4 className="font-bold text-red-600 mb-2 uppercase text-[13px] lg:text-[15px]">11. Risk Escalation &amp; Safety Thresholds</h4>
                                        <div className="pl-6 border-l-4 border-red-500 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-justify space-y-2">
                                            <p><strong>Emergency Indicators:</strong> The AI System uses internal risk detection confidence scores to identify severe clinical risks (suicide risk, self-harm, severe psychosis). Triggering thresholds initiate automated risk notifications and escalate clinical records directly to our human care response teams and Emergency Contacts.</p>
                                            <p className="text-xs">Note: Confidence scores and safety thresholds are kept confidential to protect the integrity of safety systems and prevent manipulation.</p>
                                        </div>
                                    </div>

                                    {/* AI Governance */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">12. Governance Offices</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2 text-sm">
                                            <p>Our governance is distributed across multiple specialized administrative units:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>AI Governance Office:</strong> Overlooks AI compliance, conducts impact assessments, and manages system logs.</li>
                                                <li><strong>Clinical Governance:</strong> Oversees clinical validation, quality testing, and clinician oversight workflows.</li>
                                                <li><strong>Privacy &amp; Compliance Office:</strong> Validates alignment with DPDP Act, user control options, and caregiver parameters.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 13. Grievances */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">13. Grievance Redressal</h4>
                                        <div className="pl-6 border-l-4 border-gray-300 space-y-2">
                                            <p>For questions, support, or complaints regarding our AI implementations, contact: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span>.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowAiModal(false)}
                                className="px-6 py-2.5 bg-[#3d838c] hover:bg-[#2c656d] text-white rounded-xl font-bold text-sm transition-all"
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
                            <div className="font-poppins text-[12px] lg:text-[16px] text-justify bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-6 text-gray-800 leading-relaxed">

                                {/* Effective Dates */}
                                <div className="text-center border-b border-gray-100 pb-4 mb-6">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                        Effective Date: 23 JUL 2026 | Last Updated: 23 JUL 2026
                                    </p>
                                </div>

                                {/* SECTION I: INTRODUCTION & PRINCIPLES */}
                                <div className="space-y-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section I - Introduction &amp; Core Principles
                                    </h3>

                                    {/* 1. Introduction & Scope */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">1. Introduction &amp; Scope</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>
                                                This Data Processing Consent governs how we collect, process, store, analyze, share, and protect your Personal Data, Sensitive Personal Data, and Health Information when you use the Hey Attrangi platform.
                                            </p>
                                            <p>
                                                We process your data in compliance with the Digital Personal Data Protection Act, 2023 (the &quot;DPDP Act&quot;), the Information Technology Act, 2000, the Mental Healthcare Act, 2017, and other applicable laws of the Republic of India.
                                            </p>
                                            <p>
                                                This Consent applies to all users (adult users and minor users through their caregivers) who access any features of the Platform (AI conversational support, therapist video streams, mood tracks, and diaries).
                                            </p>
                                        </div>
                                    </div>

                                    {/* 2. Processing Principles */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">2. Core Processing Principles</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We adopt and strictly adhere to the following principles:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>Lawfulness &amp; Fairness:</strong> Processing occurs solely under clear consent or legal exemptions.</li>
                                                <li><strong>Data Minimization:</strong> We collect and process only the minimal data required to deliver requested features.</li>
                                                <li><strong>Storage Limitation:</strong> Records are deleted once the processing purpose is fulfilled, subject to clinical documentation rules.</li>
                                                <li><strong>Privacy &amp; Security by Design:</strong> Security metrics and access restrictions are integrated from day one.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION II: CATEGORIES & PURPOSES */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section II - Categories of Data &amp; Processing Purposes
                                    </h3>

                                    {/* 3. Categories of Data */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">3. Data Categories We Process</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li><strong>Identity &amp; Contact:</strong> Name, phone, email, date of birth, caregiver verification details.</li>
                                                <li><strong>Health &amp; Clinical Information:</strong> Mood tracking charts, guided reflections, assessments, clinical session transcripts, and therapist logs.</li>
                                                <li><strong>Technical &amp; Security Logs:</strong> Device models, IP addresses, authentication history logs, and browser agents.</li>
                                                <li><strong>Transaction Details:</strong> Payment addresses and order details (processed securely via payment gateways).</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 4. Purposes of Processing */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">4. Purpose of Processing</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Data processing is conducted for:</p>
                                            <ul className="list-disc pl-6 space-y-1">
                                                <li>Creating and managing your user profile and verifying identity.</li>
                                                <li>Facilitating therapist consultations, treatment objectives, and clinical logs.</li>
                                                <li>Maintaining AI conversational continuous context and memory features.</li>
                                                <li>Ensuring crisis detection, emergency contact notifications, and platform security.</li>
                                                <li>Anonymized clinical research and AI safety benchmarking audits.</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* 5. Automated AI Processing */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">5. Automated Processing &amp; AI Oversight</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>The AI system assists with automated recommendation generations, risk triage, and transcript summaries. <strong>You understand that automated systems do not replace clinical judgment.</strong> All automated processing actions remain subject to human supervisor controls.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION III: DISCLOSURES, SECURITY & RIGHTS */}
                                <div className="space-y-6 pt-6">
                                    <h3 className="text-center font-bold text-[#243460] border-y border-gray-200 py-2 text-[14px] lg:text-[16px] uppercase tracking-widest bg-gray-50/50 rounded-lg">
                                        Section III - Third Parties, Rights &amp; Withdrawals
                                    </h3>

                                    {/* 6. Third Parties & Cross-Border */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">6. Third-Party Access &amp; Localization</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>We engage trusted providers (cloud storage, SMS systems, video stream hosts) who are contractually bound by confidentiality and security obligations. Your data is localized and primarily processed within India, subject to DPDP transfer rules.</p>
                                        </div>
                                    </div>

                                    {/* 7. Research & Development */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">7. Research &amp; AI Development Safeguards</h4>
                                        <div className="pl-6 border-l-4 border-[#3d838c]/40 text-gray-700 space-y-2">
                                            <p>Appropriately de-identified, anonymized, or pseudonymized data may be processed to benchmark model quality or publish research findings. No research analytics or publications will disclose individual identities.</p>
                                        </div>
                                    </div>

                                    {/* 8. Withdrawal of Consent */}
                                    <div>
                                        <h4 className="font-bold text-red-600 mb-2 uppercase text-[13px] lg:text-[15px]">8. Withdrawal &amp; Erasure Rights</h4>
                                        <div className="pl-6 border-l-4 border-red-500 text-red-700 bg-red-50 p-4 rounded-xl border border-red-100 text-justify space-y-2">
                                            <p>You have the right to withdraw your data consent at any time by emailing: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span>. Upon receipt, we will cease processing and erase your data.</p>
                                            <p className="text-xs font-semibold">Exceptions: Data required for compliance, statutory record storage, or therapist notes required under Section 25 of the Mental Healthcare Act, 2017, will be retained as legally mandated.</p>
                                        </div>
                                    </div>

                                    {/* 9. Acknowledgment & Signature */}
                                    <div>
                                        <h4 className="font-bold text-[#243460] mb-2 uppercase text-[13px] lg:text-[15px]">9. Digital Acknowledgment</h4>
                                        <div className="pl-6 border-l-4 border-gray-300 space-y-1">
                                            <p>By checking the consent box, you verify that you have read, understood, and voluntarily agree to this Data Processing Consent. You acknowledge that this digital signature is legally binding under Indian law.</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowDataConsentModal(false)}
                                className="px-6 py-2.5 bg-[#3d838c] hover:bg-[#2c656d] text-white rounded-xl font-bold text-sm transition-all"
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
                                            <p>We welcome white-hat disclosures. Researchers who identify vulnerabilities should report them responsibly to: <span className="font-bold text-[#3d838c]">contact@heyattrangi.com</span>. Please include steps to reproduce and do not exfiltrate user data, disrupt services, or make public disclosures before remediation.</p>
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
                                className="px-6 py-2.5 bg-[#3d838c] hover:bg-[#2c656d] text-white rounded-xl font-bold text-sm transition-all"
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
            <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center">
                Consent &amp; Emergency Contact
            </h2>
            <p className="text-gray-500 text-sm font-medium text-center mb-6">
                Your safety is our top priority. Please provide your emergency contact details and review our documents.
            </p>

            {/* Emergency Contact Fields */}
            <div className="bg-teal-50/30 p-6 rounded-3xl border border-teal-100/50 space-y-4">
                <h3 className="font-bold text-gray-800 text-[15px] uppercase tracking-wider">
                    Emergency Contact Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Contact Name &amp; Relationship
                        </label>
                        <input
                            type="text"
                            value={data.emergencyContact}
                            onChange={(e) => onChange({ emergencyContact: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-[#3d838c] focus:border-[#3d838c] outline-none text-[14px] text-gray-800 bg-white"
                            placeholder="e.g. Jane Doe (Mother)"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={data.emergencyPhone}
                            onChange={(e) => onChange({ emergencyPhone: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-[#3d838c] focus:border-[#3d838c] outline-none text-[14px] text-gray-800 bg-white"
                            placeholder="e.g. 1234567890"
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Consent Checkbox */}
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200/50 space-y-4">
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
                                className="text-[#3d838c] hover:underline font-bold text-left cursor-pointer outline-none bg-transparent animate-pulse"
                            >
                                Terms &amp; Conditions
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenPrivacy}
                                className="text-[#3d838c] hover:underline font-bold text-left cursor-pointer outline-none bg-transparent animate-pulse"
                            >
                                Privacy Policy
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenAi}
                                className="text-[#3d838c] hover:underline font-bold text-left cursor-pointer outline-none bg-transparent animate-pulse"
                            >
                                AI Transparency Statement
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenTrustSafety}
                                className="text-[#3d838c] hover:underline font-bold text-left cursor-pointer outline-none bg-transparent animate-pulse"
                            >
                                Trust, Safety &amp; Acceptable Use Policy
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={onOpenDataConsent}
                                className="text-[#3d838c] hover:underline font-bold text-left cursor-pointer outline-none bg-transparent animate-pulse"
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
                        className="w-5 h-5 mt-0.5 rounded text-[#3d838c] focus:ring-[#3d838c] border-gray-300"
                    />
                    <span className="text-[13px] text-gray-600 font-semibold leading-relaxed">
                        I have read and agree to all the documents mentioned above.
                    </span>
                </label>
            </div>
        </div>
    )
}

function AgeScreen({ selected, onSelect }: { selected: string; onSelect: (a: string) => void }) {
    return (
        <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">Are you 18 or older?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <button
                    onClick={() => onSelect("18")}
                    className={`p-7 rounded-[32px] text-left transition-all duration-300 ${selected === "18"
                            ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-teal-50"
                        }`}
                >
                    <h4 className="font-black text-lg mb-2 leading-tight">Yes, I am 18+</h4>
                    <p className={`text-xs font-medium ${selected === "18" ? "text-white/80" : "text-gray-400"}`}>Student Account</p>
                </button>

                <button
                    onClick={() => onSelect("17")}
                    className={`p-7 rounded-[32px] text-left transition-all duration-300 ${selected === "17"
                            ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105"
                            : "bg-gray-50 text-gray-600 hover:bg-teal-50"
                        }`}
                >
                    <h4 className="font-black text-lg mb-2 leading-tight">No, I am under 18</h4>
                    <p className={`text-xs font-medium ${selected === "17" ? "text-white/80" : "text-gray-400"}`}>Caregiver Account</p>
                </button>
            </div>
        </div>
    )
}

import { useEffect, useState as useReactState } from "react"
function OrganizationScreen({ selected, onSelect }: { selected: string; onSelect: (o: string) => void }) {
    const [orgs, setOrgs] = useReactState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useReactState(true)

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
        <div className="w-full max-w-lg">
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Are you joining from an institution?</h2>
            <p className="text-gray-500 font-medium mb-10">Select your organization to access premium benefits.</p>

            {loading ? (
                <p className="text-gray-400 animate-pulse">Loading organizations...</p>
            ) : (
                <div className="space-y-4 text-left">
                    <select
                        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-[#3d838c] focus:outline-none focus:ring-4 focus:ring-teal-50 transition-all font-medium text-gray-700 bg-white"
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
        <div className="w-full">
            <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">How are you feeling today?</h2>
            <div className="flex flex-wrap justify-center gap-5">
                {moods.map((m) => (
                    <button
                        key={m.label}
                        onClick={() => onSelect(m.label)}
                        className={`w-24 h-24 rounded-[32px] flex flex-col items-center justify-center transition-all duration-300 ${selected === m.label
                                ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-110"
                                : "bg-gray-50 text-gray-400 hover:bg-white hover:text-gray-900"
                            }`}
                    >
                        <span className="text-4xl mb-2">{m.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${selected === m.label ? "text-white" : "text-gray-400"}`}>
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
        <div className="w-full max-w-2xl">
            <h2 className="text-3xl font-black text-gray-900 mb-12 tracking-tight">What is your experience level with therapy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onSelect(opt.id)}
                        className={`p-7 rounded-[32px] text-left transition-all duration-300 ${selected === opt.id
                                ? "bg-[#3d838c] text-white shadow-xl shadow-teal-200 scale-105"
                                : "bg-gray-50 text-gray-600 hover:bg-teal-50"
                            }`}
                    >
                        <h4 className="font-black text-lg mb-2 leading-tight">{opt.title}</h4>
                        <p className={`text-xs font-medium ${selected === opt.id ? "text-white/80" : "text-gray-400"}`}>{opt.sub}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}

function ReasonScreen({ selected, onToggle }: { selected: string[]; onToggle: (r: string) => void }) {
    const reasons = [
        { label: "Stress & anxiety", bg: "bg-[#7196cb]/20", text: "text-[#7196cb]", card: "bg-[#7196cb]" },
        { label: "Falling asleep", bg: "bg-[#545a7d]/20", text: "text-[#545a7d]", card: "bg-[#545a7d]" },
        { label: "Personal growth", bg: "bg-[#a686b2]/20", text: "text-[#a686b2]", card: "bg-[#a686b2]" },
        { label: "Work & productivity", bg: "bg-[#587c6b]/20", text: "text-[#587c6b]", card: "bg-[#587c6b]" },
        { label: "Revise & repeat", bg: "bg-[#dc7a6b]/20", text: "text-[#dc7a6b]", card: "bg-[#dc7a6b]" },
        { label: "Physical health", bg: "bg-[#e8b38a]/20", text: "text-[#e8b38a]", card: "bg-[#e8b38a]" },
    ]

    return (
        <div className="w-full max-w-lg">
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">What brings you to Attrangi?</h2>
            <p className="text-gray-500 font-medium mb-10">We&apos;ll tailor the experience for you.</p>
            <div className="grid grid-cols-1 gap-3.5">
                {reasons.map((r) => (
                    <button
                        key={r.label}
                        onClick={() => onToggle(r.label)}
                        className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all duration-300 font-black ${selected.includes(r.label)
                                ? `${r.card} text-white shadow-lg -translate-y-1`
                                : `${r.bg} ${r.text} hover:scale-[1.02]`
                            }`}
                    >
                        <span>{r.label}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected.includes(r.label) ? "border-white" : "border-current opacity-40"}`}>
                            {selected.includes(r.label) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
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
    return (
        <div className="w-full max-w-xl mx-auto flex flex-col items-center">
            {/* Testimonial Header */}
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <p className="text-gray-900 font-extrabold text-lg md:text-xl leading-relaxed max-w-md">
                    &ldquo;Like a mini therapist in my pocket&rdquo;
                </p>
                <span className="text-gray-400 text-xs font-semibold mt-1">Ally</span>

                {/* Mock Pagination Indicator */}
                <div className="flex gap-1.5 justify-center mt-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-200" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-900" />
                </div>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
                Start your journey
            </h2>

            {/* Plans List */}
            <div className="w-full space-y-4 text-left">
                {/* Card 1: Companion (Premium) */}
                <div
                    onClick={() => onSelectPlan("PREMIUM")}
                    className={`relative border-2 rounded-3xl p-5 md:p-6 cursor-pointer flex items-center justify-between transition-all duration-300 select-none ${selectedPlan === "PREMIUM"
                            ? "border-[#ff7a3d] bg-[#fffbf7] shadow-xl shadow-orange-500/5 scale-[1.02]"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30"
                        }`}
                >
                    <div className="flex flex-col gap-2.5 flex-1 pr-4">
                        <span
                            className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${selectedPlan === "PREMIUM"
                                    ? "bg-[#ff7a3d] text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            Best Offer
                        </span>
                        <div>
                            <h4 className="font-black text-xl text-gray-900 leading-tight">Companion</h4>
                            <p className="text-xs font-medium text-gray-500 mt-1 leading-snug">
                                Unlimited AI support &amp; long-term memory
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <span className="block font-black text-2xl text-gray-900">₹149.00</span>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">per month</span>
                        </div>

                        <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "PREMIUM"
                                    ? "bg-gray-900 border-gray-900"
                                    : "border-gray-200"
                                }`}
                        >
                            {selectedPlan === "PREMIUM" && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Listener (Essential) */}
                <div
                    onClick={() => onSelectPlan("ESSENTIAL")}
                    className={`relative border-2 rounded-3xl p-5 md:p-6 cursor-pointer flex items-center justify-between transition-all duration-300 select-none ${selectedPlan === "ESSENTIAL"
                            ? "border-[#ff7a3d] bg-[#fffbf7] shadow-xl shadow-orange-500/5 scale-[1.02]"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/30"
                        }`}
                >
                    <div className="flex flex-col gap-2.5 flex-1 pr-4">
                        <span
                            className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full w-max ${selectedPlan === "ESSENTIAL"
                                    ? "bg-[#ff7a3d] text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                        >
                            Easy Start
                        </span>
                        <div>
                            <h4 className="font-black text-xl text-gray-900 leading-tight">Listener</h4>
                            <p className="text-xs font-medium text-gray-500 mt-1 leading-snug">
                                Daily check-ins &amp; basic mood tracking
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <span className="block font-black text-2xl text-gray-900">₹49.00</span>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">per month</span>
                        </div>

                        <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === "ESSENTIAL"
                                    ? "bg-gray-900 border-gray-900"
                                    : "border-gray-200"
                                }`}
                        >
                            {selectedPlan === "ESSENTIAL" && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Anytime Notice */}
            <div className="flex items-center gap-2.5 mt-8 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Cancel anytime</span>
            </div>

            {/* Terms & Privacy Links */}
            <div className="flex gap-4 mt-4 text-xs font-semibold text-gray-400">
                <button onClick={onOpenTerms} className="underline hover:text-gray-600 transition-colors">
                    Terms
                </button>
                <button onClick={onOpenPrivacy} className="underline hover:text-gray-600 transition-colors">
                    Privacy Policy
                </button>
            </div>

            {/* Skip Button */}
            <button
                onClick={onSkip}
                className="mt-6 text-sm font-bold text-gray-500 hover:text-gray-800 underline transition-all"
            >
                Skip, continue with Free Plan
            </button>
        </div>
    )
}

function FinalScreen({ userName }: { userName: string }) {
    return (
        <div className="max-w-md">
            <h2 className="text-3xl italic font-black text-gray-900 leading-[1.2] mb-12">
                Thanks for sharing {userName}.<br />We&apos;re here with you.
            </h2>
        </div>
    )
}
