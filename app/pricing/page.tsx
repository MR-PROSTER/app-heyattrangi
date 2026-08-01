"use client"

import Link from "next/link"
import { useState } from "react"

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true)

    return (
        <div className="min-h-screen bg-[#fcfcfc] font-sans text-gray-900 pb-24">
            {/* Minimal Top Nav */}
            <nav className="w-full flex justify-between items-center py-6 px-8 max-w-7xl mx-auto mb-8">
                <Link href="/" className="font-extrabold text-2xl tracking-tighter text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] grid place-items-center">
                        <span className="text-white text-lg leading-none">A</span>
                    </div>
                    Attrangi
                </Link>
                <div className="flex gap-4 font-bold text-sm">
                    <Link href="/auth" className="px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors">Log In</Link>
                    <Link href="/auth/signup" className="px-5 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors">Sign Up</Link>
                </div>
            </nav>

            {/* Header */}
            <div className="max-w-3xl mx-auto px-4 text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
                    Simple, transparent pricing.
                </h1>
                <p className="text-lg md:text-xl font-medium text-gray-600 mb-10">
                    No hidden fees. Whether you're seeking support or providing it, we have a plan designed specifically for you.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-14 h-8 bg-gray-900 rounded-full relative p-1 cursor-pointer transition-colors"
                        aria-label="Toggle billing cycle"
                    >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
                        Annually <span className="ml-1 text-[10px] uppercase tracking-widest bg-[#d6e3cd] text-[#4a5d23] px-2 py-0.5 rounded-full">Save 20%</span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">

                    {/* Essential Plan */}
                    <div className="bg-white border-2 border-gray-100 rounded-[40px] p-10 flex flex-col relative overflow-hidden transition-all hover:border-gray-200">
                        <div className="mb-8 relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Essential</h3>
                            <p className="text-sm font-medium text-gray-500">For those wanting basic tracking tools.</p>
                        </div>
                        <div className="mb-8 relative z-10">
                            <span className="text-5xl font-black tracking-tighter text-gray-900">₹49</span>
                            <span className="text-gray-500 font-medium">/mo</span>
                        </div>
                        <Link href="/auth/signup" className="w-full py-4 text-center rounded-2xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors mb-10">Get Started</Link>

                        <ul className="space-y-4 flex-1 relative z-10">
                            <li className="flex items-start gap-3">
                                <span className="text-gray-400 mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-600">Daily mood tracking</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-gray-400 mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-600">Basic self-assessments</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-gray-400 mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-600">Limited AI Companion chat</span>
                            </li>
                        </ul>
                    </div>

                    {/* Plus Plan (Primary) */}
                    <div className="bg-[#ebd9fb] rounded-[40px] p-10 flex flex-col relative overflow-hidden shadow-2xl scale-100 md:scale-105 z-10">
                        <div className="absolute top-0 right-0 bg-[#d8b4e8] text-[#5e3871] font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-bl-2xl">Recommended</div>

                        <div className="mb-8 relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Premium</h3>
                            <p className="text-sm font-medium text-gray-700">Enhanced access, more credits, and premium support.</p>
                        </div>
                        <div className="mb-8 relative z-10 flex items-end">
                            <span className="text-5xl font-black tracking-tighter text-gray-900">₹{isAnnual ? '249' : '299'}</span>
                            <span className="text-gray-600 font-medium mb-1">/mo</span>
                        </div>
                        <Link href="/auth/signup" className="w-full py-4 text-center rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors mb-10 shadow-lg">Start Free Trial</Link>

                        <ul className="space-y-4 flex-1 relative z-10 border-t border-[#d8b4e8]/40 pt-6">
                            <li className="flex items-start gap-3">
                                <span className="text-gray-900 font-bold mt-0.5">✔</span>
                                <span className="text-sm font-bold text-gray-800">Unlimited 24/7 AI Companion</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-gray-900 font-bold mt-0.5">✔</span>
                                <span className="text-sm font-bold text-gray-800">Advanced mental health analytics</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-gray-900 font-bold mt-0.5">✔</span>
                                <span className="text-sm font-bold text-gray-800">1x Dedicated Therapist session / mo</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-gray-900 font-bold mt-0.5">✔</span>
                                <span className="text-sm font-bold text-gray-800">Priority matching with specialists</span>
                            </li>
                        </ul>
                    </div>

                    {/* Therapist Pro */}
                    <div className="bg-[#fff8e7] border border-[#f4b860]/20 rounded-[40px] p-10 flex flex-col relative overflow-hidden">
                        <div className="mb-8 relative z-10">
                            <h3 className="text-xl font-black text-gray-900 mb-2">Organization</h3>
                            <p className="text-sm font-medium text-gray-500">College or corporate plan with managed billing.</p>
                        </div>
                        <div className="mb-8 relative z-10 flex items-end mt-4 mb-2">
                            <span className="text-5xl font-black tracking-tighter text-gray-900">Custom</span>
                        </div>
                        <Link href="/auth/signup" className="w-full py-4 text-center rounded-2xl bg-white text-gray-900 font-bold border-2 border-gray-900 hover:bg-gray-50 shadow-[offset-2] transition-all mb-10">Join Network</Link>

                        <ul className="space-y-4 flex-1 relative z-10 border-t border-[#f4b860]/20 pt-6">
                            <li className="flex items-start gap-3">
                                <span className="text-[#d89332] font-bold mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-700">Unlimited verified patient matches</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#d89332] font-bold mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-700">Built-in secure video platform</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#d89332] font-bold mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-700">Automated billing and invoicing</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-[#d89332] font-bold mt-0.5">✔</span>
                                <span className="text-sm font-medium text-gray-700">Clinical notes & documentation tools</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* FAQ / Trust Segment */}
            <div className="max-w-3xl mx-auto mt-24 px-4 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Secure & Confidential</p>
                <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Enterprise-grade security for your data.</h2>
                <p className="text-gray-500 font-medium mb-8">All payments are processed securely through Stripe. HIPAA compliant infrastructure guarantees your medical data is encrypted and completely private at all times.</p>
            </div>
        </div>
    )
}
