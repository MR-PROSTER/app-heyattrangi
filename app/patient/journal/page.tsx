"use client";

import { useState } from "react";
import Link from "next/link";
import JournalEditor from "@/components/patient/journal/JournalEditor";
import JournalHistory from "@/components/patient/journal/JournalHistory";
import JournalAnalytics from "@/components/patient/journal/JournalAnalytics";

type Tab = "write" | "history" | "analytics";

export default function JournalPage() {
    const [activeTab, setActiveTab] = useState<Tab>("write");

    return (
        <div className="flex h-screen bg-[#fafdfc] overflow-hidden">
            <div className="flex-1 flex flex-col h-full overflow-y-auto px-6 md:px-8 xl:px-10 py-8 md:py-10">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/patient/dashboard">
                                <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                        <line x1="19" y1="12" x2="5" y2="12"></line>
                                        <polyline points="12 19 5 12 12 5"></polyline>
                                    </svg>
                                </button>
                            </Link>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                                Daily Reflection
                            </h1>
                        </div>
                        <p className="text-gray-500 font-medium">Capture your thoughts, track your mood, and grow.</p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-max">
                    <button 
                        onClick={() => setActiveTab("write")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'write' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Write Entry
                    </button>
                    <button 
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        History
                    </button>
                    <button 
                        onClick={() => setActiveTab("analytics")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        Analytics
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full max-w-4xl">
                    {activeTab === "write" && (
                        <JournalEditor onSaveSuccess={() => setActiveTab("history")} />
                    )}
                    {activeTab === "history" && (
                        <JournalHistory />
                    )}
                    {activeTab === "analytics" && (
                        <JournalAnalytics />
                    )}
                </div>
            </div>
        </div>
    );
}
