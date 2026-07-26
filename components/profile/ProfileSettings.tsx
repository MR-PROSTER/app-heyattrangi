"use client"

import { useState } from "react"
import { User, Patient } from "@prisma/client"
import PersonalInfoSection from "./PersonalInfoSection"
import BillingSection from "./BillingSection"
import CreditsSection from "./CreditsSection"
import VideoSettingsSection from "./VideoSettingsSection"
import SignOutButton from "@/components/auth/SignOutButton"

interface ProfileSettingsProps {
    user: User & {
        patient?: Patient | null
    }
}

type Section = "personal" | "billing" | "dev_billing" | "credits" | "video"

export default function ProfileSettings({ user }: ProfileSettingsProps) {
    const [activeSection, setActiveSection] = useState<Section>("personal")
    const [isSaving, setIsSaving] = useState(false)

    const allSidebarItems = [
        {
            id: "personal" as const,
            label: "Personal Info",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            )
        },
        {
            id: "billing" as const,
            label: "Billing & Payment",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
        {
            id: "dev_billing" as const,
            label: "Dev Billing (Test)",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
        {
            id: "credits" as const,
            label: "Care Credits",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
            )
        },
        {
            id: "video" as const,
            label: "Video Settings",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
            )
        }
    ]

    const isProduction = process.env.NODE_ENV === "production"
    const hiddenInProd = ["credits", "dev_billing"]

    const sidebarItems = isProduction
        ? allSidebarItems.filter(item => !hiddenInProd.includes(item.id))
        : allSidebarItems

    const sectionTitle =
        activeSection === "personal" ? "Personal information"
            : activeSection === "billing" ? "Billing & Payment"
                : activeSection === "dev_billing" ? "Dev Billing (Test Mode)"
                    : activeSection === "credits" ? "Care Credits"
                        : "Video Settings"

    return (
        <div className="flex h-full w-full bg-white overflow-hidden">
            {/* Desktop: User profile management sidebar */}
            <div className="hidden md:flex w-[280px] shrink-0 border-r border-gray-100 p-6 flex-col gap-6">
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    User profile<br />management
                </h2>

                <nav className="flex flex-col gap-1 flex-1">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveSection(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeSection === item.id
                                ? "bg-gray-50 text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
                                }`}
                        >
                            <span className={`${activeSection === item.id ? "text-gray-900" : "text-gray-400"}`}>
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <SignOutButton className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-sm font-medium text-red-500 hover:bg-red-50" />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 sm:px-6 md:p-10">
                    {/* Mobile section switcher */}
                    <div className="md:hidden mb-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 mb-3 pl-1">
                            Profile
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveSection(item.id)}
                                    className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold border transition-all ${
                                        activeSection === item.id
                                            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                    }`}
                                >
                                    <span className={activeSection === item.id ? "text-white" : "text-gray-400"}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <header className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {sectionTitle}
                        </h1>

                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-[#00a870]">
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving changes
                                </>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#00a870]" />
                                    All changes saved
                                </span>
                            )}
                        </div>
                    </header>

                    {activeSection === "personal" && (
                        <PersonalInfoSection user={user} onSavingChange={setIsSaving} />
                    )}

                    {activeSection === "billing" && (
                        <BillingSection user={user} />
                    )}

                    {activeSection === "dev_billing" && (
                        <BillingSection user={user} isTestMode={true} />
                    )}

                    {activeSection === "credits" && (
                        <CreditsSection />
                    )}

                    {activeSection === "video" && (
                        <VideoSettingsSection user={user} />
                    )}

                    {/* Mobile sign out */}
                    <div className="md:hidden mt-10 pt-6 border-t border-gray-100">
                        <SignOutButton className="flex items-center justify-center gap-3 px-4 py-3.5 w-full rounded-2xl transition-all duration-200 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100" />
                    </div>
                </div>
            </div>
        </div>
    )
}
