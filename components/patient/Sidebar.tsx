"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import NotificationsPanel from "./NotificationsPanel"

// --- Custom Icons matching the Mockup ---
type IconProps = { className?: string }
const iconBase = "h-7 w-7 shrink-0"

const GridIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
)

const CalendarIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const ListIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const ChartIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M17 9v6" />
        <path d="M12 11v4" />
        <path d="M7 13v2" />
    </svg>
)

const ChatIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
    </svg>
)

const SettingsIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

const UsersIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const LibraryIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="m16 6 4 14" />
        <path d="M12 6v14" />
        <path d="M8 8v12" />
        <path d="M4 4v16" />
    </svg>
)

const WalletIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
)

const LeafIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
)

const BellIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
)

const SidebarToggleIcon = ({ className, isCollapsed }: IconProps & { isCollapsed: boolean }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={`${iconBase} transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""} ${className ?? ""}`}>
        <polyline points="15 18 9 12 15 6" />
    </svg>
)

const HomeIcon = ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${iconBase} ${className ?? ""}`}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
)

interface SidebarItem {
    label: string
    href: string
    icon: ReactNode
    badge?: number
}

const generalItems: SidebarItem[] = [
    // { label: "Dashboard", href: "/patient/dashboard", icon: <GridIcon /> },
    // { label: "Therapists", href: "/patient/therapists", icon: <UsersIcon /> },
    // { label: "Schedule", href: "/patient/appointments", icon: <CalendarIcon /> },
    // { label: "Mood Tracking", href: "/patient/mood", icon: <ChartIcon /> },
]

const toolItems: SidebarItem[] = [
    {
        label: "Home",
        href: "/patient/dashboard",
        icon: <GridIcon />,
    },
    {
        label: "Explore",
        href: "/patient/library",
        icon: <LibraryIcon />,
    },
    {
        label: "My Wellbeing",
        href: "/patient/wellbeing",
        icon: <LeafIcon />,
    },
]


export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [isCollapsed, setIsCollapsed] = useState(true) // Always closed
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Mount + after panel closes (avoid refetch while opening)
        if (isNotifOpen) return

        const controller = new AbortController()
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/patient/notifications", {
                    signal: controller.signal,
                })
                const data = await res.json()
                if (data.notifications) {
                    const unread = data.notifications.filter((n: any) => !n.isRead).length
                    setUnreadCount(unread)
                }
            } catch (e: any) {
                if (e?.name === "AbortError") return
                console.error(e)
            }
        }
        fetchUnread()
        return () => controller.abort()
    }, [isNotifOpen])

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    // Lock body scroll while mobile drawer is open
    useEffect(() => {
        if (!isMobileOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = prev
        }
    }, [isMobileOpen])

    const drawerItems: SidebarItem[] = toolItems

    const renderNavLink = (item: SidebarItem, opts?: { expanded?: boolean; onNavigate?: () => void }) => {
        const expanded = opts?.expanded ?? !isCollapsed
        const isActive =
            item.href === "/patient/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href)

        return (
            <Link
                key={item.label}
                href={item.href}
                onClick={opts?.onNavigate}
                title={!expanded ? item.label : undefined}
                className={`flex items-center rounded-2xl transition-all duration-300 font-bold relative
                    ${expanded ? "px-4 py-3 justify-between" : "w-12 h-12 mx-auto justify-center"}
                    ${isActive
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                        : "text-orange-100/60 hover:text-white hover:bg-white/10"
                    }
                `}
            >
                <div className={`flex items-center ${expanded ? "gap-3" : "justify-center w-full"}`}>
                    <div className="flex items-center justify-center [&_svg]:h-6 [&_svg]:w-6">
                        {item.icon}
                    </div>
                    {expanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </div>
                {item.badge ? (
                    <div className={`bg-[#0066ff] text-white text-[10px] flex items-center justify-center rounded-full shadow-sm ${expanded ? "w-5 h-5 ml-auto" : "absolute top-1 right-1 w-4 h-4"}`}>
                        {item.badge}
                    </div>
                ) : null}
            </Link>
        )
    }

    const renderMobileNavLink = (item: SidebarItem, onNavigate?: () => void) => {
        const isActive =
            item.href === "/patient/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href)

        let icon = item.icon
        if (item.label === "Home") {
            icon = <HomeIcon className={isActive ? "text-[#3B82F6]" : "text-slate-500"} />
        } else if (item.label === "Explore") {
            icon = <GridIcon className={isActive ? "text-[#3B82F6]" : "text-slate-500"} />
        } else if (item.label === "My Wellbeing") {
            icon = <LeafIcon className={isActive ? "text-[#3B82F6]" : "text-slate-500"} />
        }

        return (
            <Link
                key={item.label}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm relative
                    ${isActive
                        ? "bg-[#EFF4FF] text-[#3B82F6] shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }
                `}
            >
                <div className="flex items-center justify-center [&_svg]:h-6 [&_svg]:w-6">
                    {icon}
                </div>
                <span>{item.label}</span>
            </Link>
        )
    }

    if (pathname === "/patient/ai-bot") {
        return null;
    }

    return (
        <>
        {/* Mobile hamburger — hidden on Profile */}
        {pathname !== "/dashboard/profile" ? (
        <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden fixed top-2.5 left-2.5 min-[360px]:top-3 min-[360px]:left-3 z-50 flex h-9 w-9 min-[360px]:h-10 min-[360px]:w-10 min-[390px]:h-11 min-[390px]:w-11 items-center justify-center rounded-xl min-[390px]:rounded-2xl bg-[#4A3020] text-white shadow-lg shadow-black/20 border border-white/10"
            aria-label="Open menu"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
        </button>
        ) : null}

        {/* Mobile drawer overlay */}
        <div
            className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ${
                isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                aria-label="Close menu"
                onClick={() => setIsMobileOpen(false)}
            />
            <aside
                className={`absolute top-0 left-0 h-full w-[min(82vw,300px)] flex flex-col py-6 px-4 shadow-2xl transition-transform duration-300 ease-out bg-white border-r border-slate-100 ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                <div className="flex items-center justify-between mb-10">
                    <Link href="/patient/dashboard" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 min-w-0">
                        <Image
                            src="/images/logo_dark.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="object-contain shrink-0"
                        />
                        <div className="flex items-center gap-0.5 tracking-tighter">
                            <span className="text-xl font-black text-[#1A1A2E]">hey</span>
                            <span className="text-xl font-black text-[var(--color-brand)]">attrangi</span>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="6" y1="18" x2="18" y2="6" />
                        </svg>
                    </button>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {drawerItems.map((item) => renderMobileNavLink(item, () => setIsMobileOpen(false)))}
                </nav>

                <button
                    onClick={() => signOut({ callbackUrl: "/auth" })}
                    className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-[#1A202C] hover:bg-slate-50 w-full text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-[#FFF5F5] text-[#FF4949] flex items-center justify-center shrink-0 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </div>
                    <span>Sign Out</span>
                </button>
            </aside>
        </div>

        {/* Desktop left rail */}
        <div
            className={`relative hidden md:block h-full bg-white border-r border-slate-200/80 transition-all duration-300 ${isCollapsed ? "w-[90px]" : "w-[260px]"} shrink-0 z-40`}
        >

            <aside className={`flex flex-col h-full py-6 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-3 md:px-0" : "pl-3 pr-5"}`}>

                {/* Header / Logo */}
                <Link href="/patient/dashboard" className={`flex items-center transition-all ${isCollapsed ? "justify-center mt-6 mb-10" : "pl-0 mb-6 gap-3"}`}>
                    <div className="shrink-0">
                        <Image
                            src="/images/logo_dark.png"
                            alt="Logo"
                            width={isCollapsed ? 36 : 40}
                            height={isCollapsed ? 36 : 40}
                            className="object-contain"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center gap-0.5 tracking-tighter">
                            <span className="text-2xl font-black text-[#1A1A2E]">hey</span>
                            <span className="text-2xl font-black text-[var(--color-brand)]">attrangi</span>
                        </div>
                    )}
                </Link>

                {/* Tools Section */}
                <div className={`mb-8 w-full flex-1 flex flex-col justify-center ${isCollapsed ? "px-2" : "pl-2"}`}>
                    {!isCollapsed && <h3 className="text-[11px] font-bold text-slate-400 mb-3 px-2 uppercase tracking-wide">Tools</h3>}
                    <nav className={`flex flex-col ${isCollapsed ? "gap-6" : "gap-1.5"}`}>
                        {toolItems.map((item) => {
                            const isActive =
                                item.href === "/patient/dashboard"
                                    ? pathname === item.href
                                    : pathname === item.href || pathname.startsWith(item.href)

                            let icon = item.icon
                            if (item.label === "Home") {
                                icon = <HomeIcon className={isActive ? "text-[#3B82F6]" : "text-slate-400"} />
                            } else if (item.label === "Explore") {
                                icon = <GridIcon className={isActive ? "text-[#3B82F6]" : "text-slate-400"} />
                            } else if (item.label === "My Wellbeing") {
                                icon = <LeafIcon className={isActive ? "text-[#3B82F6]" : "text-slate-400"} />
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center rounded-2xl transition-all duration-300 font-bold relative
                                        ${isCollapsed ? "w-12 h-12 mx-auto justify-center" : "px-4 py-3 justify-between"}
                                        ${isActive
                                            ? "bg-[#EFF4FF] text-[#3B82F6] shadow-sm"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                                        <div className="flex items-center justify-center [&_svg]:h-6 [&_svg]:w-6">
                                            {icon}
                                        </div>
                                        {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                                    </div>
                                    {item.badge && (
                                        <div className={`bg-[#0066ff] text-white text-[10px] flex items-center justify-center rounded-full shadow-sm ${isCollapsed ? "absolute top-1 right-1 w-4 h-4" : "w-5 h-5 ml-auto"}`}>
                                            {item.badge}
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom CTA / Sign Out */}
                <div className={`mt-auto mb-6 w-full ${isCollapsed ? "mx-auto flex justify-center px-2" : "mx-4"}`}>
                    {isCollapsed ? (
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth" })}
                            className="w-12 h-12 rounded-full bg-[#FFF5F5] text-[#FF4949] flex items-center justify-center shadow-sm hover:bg-red-100/50 transition-all cursor-pointer shrink-0"
                            title="Sign Out"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={() => signOut({ callbackUrl: "/auth" })}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold text-sm text-[#1A202C] hover:bg-slate-50 w-full text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#FFF5F5] text-[#FF4949] flex items-center justify-center shrink-0 shadow-sm">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                            </div>
                            <span>Sign Out</span>
                        </button>
                    )}
                </div>

            </aside>
        </div>

            {/* Slide-over Notifications Panel */}
            <NotificationsPanel
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
            />
        </>
    )
}
