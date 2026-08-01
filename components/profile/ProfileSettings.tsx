"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { memo } from "react"
import PersonalInfoSection from "./PersonalInfoSection"
import BillingSection from "./BillingSection"
import CreditsSection from "./CreditsSection"
import ProfileDivider from "./ui/ProfileDivider"
import { PROFILE_CARD_SURFACE } from "./ui/profileChrome"
import MembershipCard from "./membership/MembershipCard"
import EmergencyContactCard from "./emergency/EmergencyContactCard"
import { ProfileProvider, useProfile, type ProfileUser } from "./ProfileProvider"
import ProfileErrorBoundary from "./ProfileErrorBoundary"
import {
  AccountSkeleton,
  IdentitySkeleton,
  MindMatrixSkeleton,
  PreferencesSkeleton,
  PrivacySkeleton,
} from "./ProfileSkeletons"
import type { ProfileSectionId } from "@/lib/profile/sections"

const VideoSettingsSection = dynamic(() => import("./VideoSettingsSection"), {
  ssr: false,
  loading: () => (
    <p className="text-sm text-gray-400 font-medium py-4">Loading video settings…</p>
  ),
})

const MindMatrixCard = dynamic(() => import("./mind-matrix/MindMatrixCard"), {
  loading: () => <MindMatrixSkeleton />,
})

const PreferencesCard = dynamic(() => import("./preferences/PreferencesCard"), {
  loading: () => <PreferencesSkeleton />,
})

const PrivacyConsentCard = dynamic(() => import("./privacy/PrivacyConsentCard"), {
  loading: () => <PrivacySkeleton />,
})

const AccountActionsCard = dynamic(() => import("./account/AccountActionsCard"), {
  loading: () => <AccountSkeleton />,
})

const MemoMembershipCard = memo(MembershipCard)

interface ProfileSettingsProps {
  user: ProfileUser
}

function navButtonClass(active: boolean, compact = false) {
  return `flex items-center gap-3 rounded-xl transition-colors duration-150 text-sm font-medium
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
    ${compact ? "min-h-11 px-3.5 py-2.5 shrink-0" : "min-h-11 px-4 py-3 w-full"}
    ${
      active
        ? compact
          ? "bg-gray-900 text-white border border-gray-900 shadow-sm"
          : "bg-gray-50 text-gray-900 shadow-sm"
        : compact
          ? "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
    }`
}

function ProfileShell() {
  const {
    user,
    hasUser,
    isSaving,
    activeSection,
    contentRef,
    showEmergency,
    showDevExtras,
    showVideoSettings,
    setShowVideoSettings,
    navItems,
    scrollToSection,
  } = useProfile()

  const go = (id: ProfileSectionId) => {
    scrollToSection(id, { updateHash: true, highlight: true })
  }

  if (!hasUser) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#fafbfc] p-8" role="alert">
        <div className="max-w-sm text-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Profile unavailable</h2>
          <p className="mt-2 text-sm font-medium text-gray-500 leading-relaxed">
            We couldn&apos;t load your account. Please refresh or sign in again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full bg-[#fafbfc] md:bg-[#fafbfc] overflow-hidden max-md:bg-[#EEF0F8]">
      <aside
        className="hidden md:flex w-[260px] lg:w-[280px] shrink-0 border-r border-gray-100 bg-white
          sticky top-0 h-full max-h-screen flex-col gap-5 p-5 lg:p-6"
        aria-label="Profile settings"
      >
        <div className="shrink-0 px-1">
          <h1 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Profile</h1>
          <p className="mt-1 text-sm font-medium text-gray-500 leading-snug">
            Manage your account settings
          </p>
        </div>

        <nav
          className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5"
          aria-label="Settings sections"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={activeSection === item.id ? "true" : undefined}
              className={navButtonClass(activeSection === item.id)}
            >
              <span
                className={`shrink-0 ${activeSection === item.id ? "text-gray-900" : "text-gray-400"}`}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="truncate text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div
          className="shrink-0 pt-4 border-t border-gray-100 text-[12px] font-medium text-[#00a870]"
          aria-live="polite"
        >
          {isSaving ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00a870]" aria-hidden="true" />
              All changes saved
            </span>
          )}
        </div>
      </aside>

      <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto scroll-smooth overscroll-y-contain">
        <div className="mx-auto w-full max-w-[1000px] px-4 sm:px-6 md:px-8 lg:px-10 pt-2 pb-20 sm:pt-3 md:pt-10 md:pb-24 max-md:px-4">
          <div className="md:hidden sticky top-0 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2 pb-2 mb-1 bg-[#EEF0F8]/95 backdrop-blur-sm">
            <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
              <Link
                href="/patient/dashboard"
                aria-label="Back to dashboard"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-900
                  hover:bg-white/70 transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>

              <h1 className="text-center text-lg font-bold text-gray-900 tracking-tight">Profile</h1>

              <button
                type="button"
                onClick={() => go("preferences")}
                aria-label="Open preferences"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-900
                  hover:bg-white/70 transition-colors duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <p className="sr-only" aria-live="polite">
              {isSaving ? "Saving changes" : "All changes saved"}
            </p>

            <div
              className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              role="tablist"
              aria-label="Settings sections"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSection === item.id}
                  onClick={() => go(item.id)}
                  className={navButtonClass(activeSection === item.id, true)}
                >
                  <span
                    className={`shrink-0 ${activeSection === item.id ? "text-white" : "text-gray-400"}`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6 md:space-y-7 max-md:space-y-4">
            <ProfileErrorBoundary title="Identity unavailable" description="We couldn't load your identity details.">
              <PersonalInfoSection />
            </ProfileErrorBoundary>

            <div className="space-y-4 sm:space-y-5">
              <ProfileErrorBoundary title="Membership unavailable">
                <MemoMembershipCard user={user} />
              </ProfileErrorBoundary>

              <div className={PROFILE_CARD_SURFACE}>
                <BillingSection user={user} />
              </div>

              <div className={PROFILE_CARD_SURFACE}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">Video Settings</p>
                    <p className="text-sm text-gray-500 font-medium mt-0.5 leading-relaxed">
                      Camera and microphone preferences for sessions.
                    </p>
                  </div>
                  {!showVideoSettings && (
                    <button
                      type="button"
                      onClick={() => setShowVideoSettings(true)}
                      className="shrink-0 inline-flex items-center justify-center min-h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-800
                        hover:bg-gray-100 transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Open settings
                    </button>
                  )}
                </div>
                {showVideoSettings && <VideoSettingsSection user={user} />}
              </div>

              {showDevExtras && (
                <>
                  <ProfileDivider label="Developer" />
                  <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-5 sm:p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-4">
                      Dev Billing (Test Mode)
                    </p>
                    <BillingSection user={user} isTestMode={true} />
                  </div>
                  <div className={PROFILE_CARD_SURFACE}>
                    <p className="text-sm font-bold text-gray-900 mb-4">Care Credits</p>
                    <CreditsSection />
                  </div>
                </>
              )}
            </div>

            {showEmergency && (
              <ProfileErrorBoundary title="Emergency Contact unavailable">
                <EmergencyContactCard />
              </ProfileErrorBoundary>
            )}

            <ProfileErrorBoundary
              title="Mind Matrix unavailable"
              description="Your check-in history couldn't be loaded right now."
            >
              <MindMatrixCard />
            </ProfileErrorBoundary>

            <ProfileErrorBoundary title="Preferences unavailable">
              <PreferencesCard />
            </ProfileErrorBoundary>

            <ProfileErrorBoundary title="Privacy unavailable">
              <PrivacyConsentCard />
            </ProfileErrorBoundary>

            <ProfileErrorBoundary title="Account actions unavailable">
              <AccountActionsCard />
            </ProfileErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Patient Profile settings shell — production entry for `/patient/profile`.
 */
export default function ProfileSettings({ user }: ProfileSettingsProps) {
  return (
    <ProfileErrorBoundary
      title="Profile unavailable"
      description="Something went wrong loading your profile. Please try again."
    >
      <ProfileProvider user={user}>
        <ProfileShell />
      </ProfileProvider>
    </ProfileErrorBoundary>
  )
}

/** Exported for tests / docs — identity loading placeholder. */
export { IdentitySkeleton }
