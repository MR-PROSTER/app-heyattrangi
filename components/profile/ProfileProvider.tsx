"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { User, Patient } from "@prisma/client"
import { getMembershipTier } from "@/components/profile/membership/membershipUtils"
import {
  buildProfileHash,
  isSectionAvailable,
  parseProfileHash,
  type ProfileSectionId,
} from "@/lib/profile/sections"
import { PROFILE_NAV_ITEMS, type ProfileNavItem } from "@/components/profile/profileNav"

export type ProfileUser = User & {
  patient?: Patient | null
}

export type IdentitySnapshot = {
  name: string
  age: string
  gender: string
}

export type EmergencyFields = {
  emergencyContact: string
  emergencyPhone: string
}

interface ProfileContextValue {
  user: ProfileUser
  hasUser: boolean
  hasPatient: boolean
  isSaving: boolean
  setSaving: (saving: boolean) => void
  activeSection: ProfileSectionId
  highlightedSection: ProfileSectionId | null
  contentRef: RefObject<HTMLDivElement | null>
  identitySnapshot: IdentitySnapshot
  setIdentitySnapshot: (values: IdentitySnapshot) => void
  emergencyFields: EmergencyFields
  setEmergencyFields: (values: EmergencyFields) => void
  healthConcerns: string
  showEmergency: boolean
  showDevExtras: boolean
  showVideoSettings: boolean
  setShowVideoSettings: (open: boolean) => void
  navItems: ProfileNavItem[]
  scrollToSection: (
    id: ProfileSectionId,
    opts?: { updateHash?: boolean; highlight?: boolean }
  ) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

const HIGHLIGHT_MS = 1200
const SCROLL_LOCK_MS = 700

const EMPTY_USER = {
  id: "",
  name: null,
  email: null,
  image: null,
  patient: null,
} as ProfileUser

interface ProfileProviderProps {
  user: ProfileUser | null | undefined
  children: ReactNode
}

/**
 * Single Profile shell state: saving status, nav, deep links, identity/emergency snapshots.
 */
export function ProfileProvider({ user, children }: ProfileProviderProps) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const isScrollingRef = useRef(false)
  const deepLinkDone = useRef(false)

  const resolvedUser = user ?? EMPTY_USER
  const hasUser = Boolean(user?.id)
  const hasPatient = Boolean(user?.patient)

  const [isSaving, setIsSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<ProfileSectionId>("identity")
  const [highlightedSection, setHighlightedSection] = useState<ProfileSectionId | null>(null)
  const [showVideoSettings, setShowVideoSettings] = useState(false)

  const [identitySnapshot, setIdentitySnapshot] = useState<IdentitySnapshot>({
    name: user?.name || "",
    age: user?.patient?.age?.toString() || "",
    gender: user?.patient?.gender || "",
  })

  const [emergencyFields, setEmergencyFields] = useState<EmergencyFields>({
    emergencyContact: user?.patient?.emergencyContactName || "",
    emergencyPhone: user?.patient?.emergencyContactPhone || "",
  })

  const membershipTier = useMemo(() => getMembershipTier(user?.plan), [user?.plan])
  const showEmergency = membershipTier === "committed"
  const showDevExtras = process.env.NODE_ENV !== "production"

  const healthConcerns = useMemo(
    () => user?.patient?.healthConcerns?.join(", ") || "",
    // eslint-disable-next-line react-hooks/exhaustive-deps -- join is derived from array contents
    [user?.patient?.healthConcerns]
  )

  const navItems = useMemo(
    () => PROFILE_NAV_ITEMS.filter((item) => item.id !== "emergency" || showEmergency),
    [showEmergency]
  )

  useEffect(() => {
    setIdentitySnapshot({
      name: user?.name || "",
      age: user?.patient?.age?.toString() || "",
      gender: user?.patient?.gender || "",
    })
    setEmergencyFields({
      emergencyContact: user?.patient?.emergencyContactName || "",
      emergencyPhone: user?.patient?.emergencyContactPhone || "",
    })
  }, [
    user?.name,
    user?.patient?.age,
    user?.patient?.gender,
    user?.patient?.emergencyContactName,
    user?.patient?.emergencyContactPhone,
  ])

  const flashHighlight = useCallback((id: ProfileSectionId) => {
    setHighlightedSection(id)
    const el = document.getElementById(id)
    el?.classList.add("profile-section-flash")
    window.setTimeout(() => {
      el?.classList.remove("profile-section-flash")
      setHighlightedSection((curr) => (curr === id ? null : curr))
    }, HIGHLIGHT_MS)
  }, [])

  const scrollToSection = useCallback(
    (id: ProfileSectionId, opts?: { updateHash?: boolean; highlight?: boolean }) => {
      const updateHash = opts?.updateHash !== false
      const highlight = opts?.highlight === true

      if (!isSectionAvailable(id, { showEmergency })) {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        if (updateHash) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
        }
        setActiveSection("identity")
        return
      }

      const el = document.getElementById(id)
      if (!el) {
        contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      isScrollingRef.current = true
      setActiveSection(id)
      el.scrollIntoView({ behavior: "smooth", block: "start" })

      if (updateHash) {
        window.history.replaceState(null, "", buildProfileHash(id))
      }
      if (highlight) flashHighlight(id)

      window.setTimeout(() => {
        isScrollingRef.current = false
      }, SCROLL_LOCK_MS)
    },
    [flashHighlight, showEmergency]
  )

  useEffect(() => {
    const applyHash = (highlight: boolean) => {
      const parsed = parseProfileHash(window.location.hash)
      if (!parsed) {
        if (window.location.hash && window.location.hash !== "#") {
          contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
        }
        return
      }
      window.setTimeout(() => {
        scrollToSection(parsed, { updateHash: false, highlight })
      }, deepLinkDone.current ? 50 : 150)
    }

    if (!deepLinkDone.current) {
      deepLinkDone.current = true
      applyHash(true)
    }

    const onHashChange = () => applyHash(true)
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [scrollToSection])

  useEffect(() => {
    const root = contentRef.current
    if (!root) return

    const ids = navItems.map((item) => item.id)
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        const id = top?.target?.id as ProfileSectionId | undefined
        if (id && ids.includes(id)) setActiveSection(id)
      },
      { root, rootMargin: "-12% 0px -60% 0px", threshold: [0.1, 0.25, 0.5] }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [navItems])

  const value = useMemo<ProfileContextValue>(
    () => ({
      user: resolvedUser,
      hasUser,
      hasPatient,
      isSaving,
      setSaving: setIsSaving,
      activeSection,
      highlightedSection,
      contentRef,
      identitySnapshot,
      setIdentitySnapshot,
      emergencyFields,
      setEmergencyFields,
      healthConcerns,
      showEmergency,
      showDevExtras,
      showVideoSettings,
      setShowVideoSettings,
      navItems,
      scrollToSection,
    }),
    [
      resolvedUser,
      hasUser,
      hasPatient,
      isSaving,
      activeSection,
      highlightedSection,
      identitySnapshot,
      emergencyFields,
      healthConcerns,
      showEmergency,
      showDevExtras,
      showVideoSettings,
      navItems,
      scrollToSection,
    ]
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
