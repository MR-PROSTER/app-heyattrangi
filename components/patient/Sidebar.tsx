"use client"

import { useState, useEffect, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
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
        label: "Pragya AI",
        href: "/patient/ai-bot",
        icon: (
            <svg viewBox="0 0 122 122" fill="none" className="h-7 w-7">
                <g clipPath="url(#clip0_3553_406)">
                    <path d="M19.9498 137.086C18.2971 136.657 15.3311 136.914 13.3018 136.62C3.53704 135.205 -5.51385 129.635 -10.7656 121.229C-13.3387 117.059 -14.9804 112.381 -15.5783 107.517C-16.2019 102.525 -15.9499 96.4928 -15.9484 91.3667L-15.955 66.3252L-15.95 35.617L-15.9562 26.5901C-15.9601 22.1649 -16.0798 18.607 -15.0597 14.1958C-13.0854 5.72498 -7.84402 -1.62268 -0.477184 -6.24683C8.1893 -11.6427 14.667 -10.9284 24.2391 -10.9592L47.6861 -10.9657L83.9367 -10.9612L92.9893 -10.9712C97.1508 -11.0045 102.264 -11.1522 106.242 -10.2253C114.84 -8.18747 129.15 -5.75891 128 4C130.695 8.35948 131.343 14.6775 131.805 19.7531C132.099 22.9779 131.975 26.9404 131.971 30.2337L131.965 48.3687L131.966 84.4182L131.968 95.5395C131.968 100.874 132.126 105.234 130.867 110.522C128.757 119.473 123.14 127.201 115.277 131.972C110.909 134.657 105.63 136.305 100.538 136.849C99.2915 136.981 96.4706 136.614 95.54 137.086H19.9498ZM90.4802 135.352C91.5159 135.35 92.5569 135.339 93.5915 135.38C95.0009 130.456 96.7557 125.541 98.1761 120.473C101.234 109.965 103.266 99.1848 104.244 88.2844C105.166 78.7274 105.198 69.5377 104.615 59.9494C104.536 58.657 103.377 50.0103 103.757 49.3878C104.979 48.8467 106.804 48.6137 108.121 48.1393C116.386 45.1659 121.286 35.3049 117.46 27.1109C115.492 22.8968 112.067 19.4239 107.764 17.7961C103.744 16.2376 99.2653 16.3639 95.3397 18.1466C93.6196 18.9319 92.0808 20.4548 90.5009 21.2826C90.2419 21.4183 85.93 19.1946 85.2976 18.892C83.8646 18.2062 81.9395 17.6092 80.5632 16.9422C79.5326 15.1887 76.3127 7.50815 73.0798 8.51122C72.0417 8.83337 72.3228 11.3002 71.3639 11.6371C70.4659 11.1685 69.3639 10.2805 68.4866 9.68279C66.3671 8.23885 54.5192 0.819781 57.9826 9.2515C58.2606 9.92861 58.8792 11.0266 58.9602 11.7015C58.4368 12.5681 54.8432 12.1929 53.7565 12.2764C50.852 12.4996 47.9598 12.7515 45.0705 13.1356C43.9674 13.2654 39.5213 14.3954 38.9131 14.0925C38.0005 13.0396 37.373 11.7766 36.4779 10.7068C33.3285 6.94265 27.9303 4.39166 22.9709 5.00756C18.2336 5.39804 14.3896 7.31961 11.4069 10.8744C4.79404 18.7559 9.29081 26.0051 15.8242 31.9742C16.2792 32.3899 19.1183 34.6461 19.1466 35.5338C17.1352 39.3529 14.113 42.7627 11.4758 46.1836C6.15109 52.636 0.276621 58.4688 -5.7191 64.2778C-8.26425 66.7437 -12.1342 69.7352 -14.3183 72.3803C-14.4865 78.229 -14.3102 84.3579 -14.339 90.3008C-14.4012 103.17 -15.4412 114.371 -6.0298 124.703C0.173624 131.513 8.22285 134.957 17.3977 135.342C20.2504 135.461 23.7473 135.344 26.6642 135.345L46.3891 135.343C61.0086 135.347 75.8837 135.5 90.4802 135.352ZM-14.4107 70.1395C-11.71 67.3842 -8.24587 64.3848 -5.37288 61.6281C3.37407 53.2347 10.517 45.4295 17.3979 35.4803C14.5178 33.3674 9.58063 28.2378 7.97519 24.9476C2.98936 14.7292 11.8516 4.81078 21.8047 3.38957C26.4067 2.74454 31.0747 3.97708 34.7582 6.81003C36.7525 8.31518 38.7135 10.3395 39.7414 12.6395C42.4229 11.6179 48.9229 11.0734 51.8775 10.7509C53.033 10.6248 55.3694 10.8644 56.4903 10.6175C56.4573 9.75507 55.6002 7.69534 55.6295 7.17617C56.1024 -1.05709 67.2716 7.1511 70.4019 8.85266C70.4934 8.90244 70.7258 8.66056 70.7649 8.60426C74.8752 2.67768 80.4044 12.1653 81.5287 15.5147C84.5642 17.0623 87.0222 17.7421 90.3229 19.6027C102.084 8.91117 121.375 18.7831 120.294 34.2717C119.996 38.5646 118.762 41.2901 116.091 44.6141C114.178 46.8745 111.627 48.5689 108.879 49.6412C107.694 50.1037 106.435 50.1015 105.359 50.6704C105.34 50.6806 105.356 51.3048 105.361 51.3709C105.577 53.8757 106 56.4769 106.165 58.9769C107.638 79.4859 105.567 100.095 100.042 119.901C99.0761 123.426 98.0393 126.93 96.932 130.413C96.4786 131.852 95.8501 134.043 95.3262 135.384C97.396 135.365 99.2771 135.381 101.337 135.133C108.726 134.234 115.592 130.856 120.812 125.55C125.185 121.066 128.182 115.423 129.448 109.288C130.508 104.366 130.377 98.146 130.374 93.1062L130.364 77.1771L130.372 24.4764C130.294 15.0043 129.274 4.8483 122.5 -2C120.5 -4.5 111.054 -7.65406 104.775 -8.85941C100.782 -9.62581 96.0962 -9.40905 91.962 -9.40966L74.4651 -9.40982L35.9475 -9.40872C29.2614 -9.40948 22.3838 -9.49446 15.718 -9.39944C15.3152 -9.39273 14.9127 -9.38128 14.5103 -9.3651C5.60205 -8.51787 -1.37418 -5.16706 -7.15968 1.81375C-10.3004 5.56409 -12.4785 10.0242 -13.5051 14.807C-14.5538 19.7155 -14.2769 28.7457 -14.279 34.1305L-14.3059 55.7132C-14.3091 60.4345 -14.2371 65.4498 -14.4107 70.1395Z" fill="currentColor" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M50.4434 63.8076C51.5407 63.7844 53.1038 63.7243 54.3213 63.8057L54.3223 63.8047C60.4775 64.1671 65.9629 66.8247 70.0918 71.416C73.8463 75.5913 76.6136 81.7871 77.3027 87.9824C77.9923 94.182 76.6159 100.652 71.7002 105.032C66.0648 110.053 58.6807 110.399 52.1025 110.073L52.0312 110.069L51.9609 110.06C49.5687 109.718 46.9783 109.344 44.5518 108.686C40.2048 107.506 35.344 105.502 31.5234 102.429C27.6782 99.3359 24.8029 95.0805 24.7432 89.4932C24.6826 83.7993 27.3433 78.3756 31.1582 74.0625C34.976 69.7462 40.0697 66.4003 45.1445 64.8975C46.8902 64.3807 48.5738 64.1057 50.2217 63.8291L50.3311 63.8105L50.4434 63.8076ZM59.6494 73.499C56.2427 72.2562 52.6175 71.7218 48.9971 71.9277L48.9375 71.9307L48.8779 71.9395C47.7195 72.0967 46.3786 72.4749 45.3643 73.3281C44.2409 74.2731 43.6691 75.6806 43.9902 77.415C44.2582 78.8619 45.1183 80.1873 45.9502 81.249C46.3188 81.7195 46.7217 82.183 47.1113 82.6172C46.0965 83.0111 45.2292 83.0731 44.4922 82.9082C43.3874 82.6609 42.2272 81.8295 41.126 80.0361C41.0968 79.9887 40.8654 79.5786 40.7139 79.3574C40.5207 79.0756 40.188 78.6553 39.6514 78.3809L39.2344 78.168L38.7695 78.2236C38.1989 78.2918 37.6772 78.5243 37.2666 78.9248C36.8735 79.3084 36.6669 79.7636 36.5576 80.1543C36.3507 80.8948 36.421 81.666 36.4922 82.1406C36.8792 84.7176 38.1568 86.9983 40.334 88.5762L40.3379 88.5791C42.4637 90.1088 45.1207 90.7052 47.6963 90.2324L47.6973 90.2334L47.6992 90.2324C47.7021 90.2319 47.7051 90.231 47.708 90.2305C48.9751 90.0048 50.1534 89.5271 51.2197 88.9307C52.1113 90.6588 53.3757 92.2987 55.6328 93.2334L55.6357 93.2354C55.7795 93.2945 55.9251 93.3513 56.0713 93.4053L56.1133 93.4209L56.6406 93.5732C59.0447 94.2271 61.2826 94.2395 63.8086 92.9854H63.8096C64.8971 92.4452 66.1224 91.3612 67.0352 90.1865C67.5021 89.5855 67.93 88.9066 68.2236 88.1963C68.5122 87.4979 68.7136 86.6656 68.5898 85.8096L68.542 85.4785L68.3594 85.1963L68.2031 84.9541L67.8418 84.3945L67.1865 84.2754C66.4449 84.1408 65.785 84.4008 65.3809 84.6016C64.9394 84.8209 64.5152 85.119 64.1602 85.3867C63.8165 85.6458 63.4224 85.9665 63.1484 86.1807C62.8299 86.4296 62.6166 86.5808 62.4756 86.6582L62.4668 86.6631L62.4082 86.6953C62.4277 86.6847 62.4112 86.6992 62.3066 86.7197C62.2554 86.7298 62.1933 86.7398 62.1104 86.751C62.069 86.7566 62.0263 86.7613 61.9775 86.7676L61.8232 86.7881C59.99 87.0377 58.5605 86.5917 57.6191 85.418C58.7978 84.8484 59.9425 84.2508 61.1309 83.5293C63.5148 82.0822 65.2159 80.1209 64.6602 77.791C64.4024 76.7108 63.6943 75.8411 62.8418 75.1689C61.9866 74.4948 60.891 73.9417 59.6484 73.499H59.6494Z" fill="currentColor"/>
                    <path d="M100.503 23.5562C102.649 23.4464 104.261 23.5482 106.29 24.5244C111.295 26.9329 113.226 33.2188 110.808 38.1244C109.398 40.9864 107.009 42.5705 104.076 43.5442C103.388 43.7919 102.944 43.9584 102.219 44.1089C101.47 43.6475 100.845 40.5328 100.588 39.6035C99.6652 36.2604 98.4687 33.9515 96.208 31.2991C95.471 30.4344 93.6533 28.7785 93.3162 27.8637C94.2225 25.5172 98.1638 23.9942 100.503 23.5562ZM95.3025 27.7387C98.6938 31.4097 101.117 34.4188 102.269 39.4463C102.27 39.452 102.272 39.4581 102.273 39.4645C102.363 39.8569 102.757 41.5778 102.992 41.9937C103.085 42.0188 103.177 42.044 103.269 42.0691L103.837 41.9228C108.655 40.1064 111.553 35.6732 109.652 30.5771C108.888 28.5153 107.337 26.8407 105.341 25.9212C104.396 25.4957 102.78 25.0879 101.739 25.0295C98.9067 25.389 97.5476 26.0432 95.3025 27.7387Z" fill="currentColor"/>
                    <path d="M95.3025 27.7387C98.6938 31.4097 101.117 34.4188 102.269 39.4463L102.273 39.4645C102.363 39.8569 102.757 41.5778 102.992 41.9937L103.269 42.0691L103.837 41.9228C108.655 40.1064 111.553 35.6732 109.652 30.5771C108.888 28.5153 107.337 26.8407 105.341 25.9212C104.396 25.4957 102.78 25.0879 101.739 25.0295C98.9067 25.389 97.5476 26.0432 95.3025 27.7387Z" fill="currentColor"/>
                    <path d="M102.273 39.4645C102.272 39.4581 102.27 39.452 102.269 39.4463C101.117 34.4188 98.6938 31.4097 95.3025 27.7387C97.5476 26.0432 98.9067 25.389 101.739 25.0295C102.78 25.0879 104.396 25.4957 105.341 25.9212C107.337 26.8407 108.888 28.5153 109.652 30.5771C111.553 35.6732 108.655 40.1064 103.837 41.9228L103.269 42.0691C103.177 42.044 103.085 42.0188 102.992 41.9937M102.269 39.4463L102.273 39.4645M103.269 42.0691L102.992 41.9937C102.757 41.5778 102.363 39.8569 102.273 39.4645M100.503 23.5562C102.649 23.4464 104.261 23.5482 106.29 24.5244C111.295 26.9329 113.226 33.2188 110.808 38.1244C109.398 40.9864 107.009 42.5705 104.076 43.5442C103.388 43.7919 102.944 43.9584 102.219 44.1089C101.47 43.6475 100.845 40.5328 100.588 39.6035C99.6652 36.2604 98.4687 33.9515 96.208 31.2991C95.471 30.4344 93.6533 28.7785 93.3162 27.8637C94.2225 25.5172 98.1638 23.9942 100.503 23.5562Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M23.2384 11.5047C27.593 11.256 31.4869 13.4803 33.4862 17.5888C33.8637 18.3647 32.7268 19.0275 32.1158 19.3701C28.6525 21.3126 26.1101 23.924 24.0802 27.315C23.6727 28.0499 23.1357 29.2833 22.3954 29.6008C22.0477 29.6079 21.821 29.5405 21.5252 29.3591C18.9962 27.8031 16.8432 25.5958 16.0761 22.6529C15.0183 18.5945 16.7021 14.32 20.5038 12.4223C21.4452 11.9524 22.2298 11.7688 23.2384 11.5047ZM21.953 27.6579C22.3937 26.8757 22.8088 26.1223 23.302 25.3703C25.672 22.0329 28.0861 19.6799 31.7477 17.7281C29.7797 14.9362 27.296 12.7182 23.5989 13.0916C21.351 13.6303 19.7427 14.3999 18.466 16.47C17.4524 18.1155 17.1536 20.1031 17.6384 21.9739C18.2376 24.3761 19.9125 26.3273 21.953 27.6579Z" fill="currentColor"/>
                    <path d="M21.953 27.6579C22.3937 26.8757 22.8088 26.1223 23.302 25.3703C25.672 22.0329 28.0861 19.6799 31.7477 17.7281C29.7797 14.9362 27.296 12.7182 23.5989 13.0916C21.351 13.6303 19.7427 14.3999 18.466 16.47C17.4524 18.1155 17.1536 20.1031 17.6384 21.9739C18.2376 24.3761 19.9125 26.3273 21.953 27.6579Z" fill="currentColor"/>
                    <path d="M23.2384 11.5047C27.593 11.256 31.4869 13.4803 33.4862 17.5888C33.8637 18.3647 32.7268 19.0275 32.1158 19.3701C28.6525 21.3126 26.1101 23.924 24.0802 27.315C23.6727 28.0499 23.1357 29.2833 22.3954 29.6008C22.0477 29.6079 21.821 29.5405 21.5252 29.3591C18.9962 27.8031 16.8432 25.5958 16.0761 22.6529C15.0183 18.5945 16.7021 14.32 20.5038 12.4223C21.4452 11.9524 22.2298 11.7688 23.2384 11.5047ZM21.953 27.6579C22.3937 26.8757 22.8088 26.1223 23.302 25.3703C25.672 22.0329 28.0861 19.6799 31.7477 17.7281C29.7797 14.9362 27.296 12.7182 23.5989 13.0916C21.351 13.6303 19.7427 14.3999 18.466 16.47C17.4524 18.1155 17.1536 20.1031 17.6384 21.9739C18.2376 24.3761 19.9125 26.3273 21.953 27.6579Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M21.953 27.6579C22.3937 26.8757 22.8088 26.1223 23.302 25.3703C25.672 22.0329 28.0861 19.6799 31.7477 17.7281C29.7797 14.9362 27.296 12.7182 23.5989 13.0916C21.351 13.6303 19.7427 14.3999 18.466 16.47C17.4524 18.1155 17.1536 20.1031 17.6384 21.9739C18.2376 24.3761 19.9125 26.3273 21.953 27.6579Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M81.9615 45.6844C84.8355 45.4122 87.4474 45.9218 89.8222 47.5993C92.1206 49.2202 93.6766 51.6918 94.1447 54.4652C94.3198 55.4583 94.8047 58.7386 93.5357 58.9306C92.8653 58.656 91.9754 56.8673 91.5621 56.1502C88.472 51.5199 84.1184 49.1736 78.6069 49.1671C77.8585 49.1663 77.4254 49.2306 76.7951 48.7727C76.5856 48.3883 76.6057 48.5589 76.7201 48.1357C77.7843 46.8503 80.401 46.102 81.9615 45.6844ZM91.4726 53.2288C91.8724 53.726 92.1662 54.1037 92.6376 54.5439C92.1958 53.3703 91.7526 52.1548 91.0306 51.1193C89.2885 48.6207 86.1709 47.0495 83.1186 47.1755C82.5226 47.2202 81.8331 47.2464 81.4222 47.7168L81.4577 47.8384C81.7146 47.8569 82.2011 47.7645 82.32 47.7964C86.2148 48.8422 88.6684 50.4654 91.4726 53.2288Z" fill="currentColor"/>
                    <path d="M91.4726 53.2288C91.8724 53.726 92.1662 54.1037 92.6376 54.5439C92.1958 53.3703 91.7526 52.1548 91.0306 51.1193C89.2885 48.6207 86.1709 47.0495 83.1186 47.1755C82.5226 47.2202 81.8331 47.2464 81.4222 47.7168L81.4577 47.8384C81.7146 47.8569 82.2011 47.7645 82.32 47.7964C86.2148 48.8422 88.6684 50.4654 91.4726 53.2288Z" fill="currentColor"/>
                    <path d="M81.9615 45.6844C84.8355 45.4122 87.4474 45.9218 89.8222 47.5993C92.1206 49.2202 93.6766 51.6918 94.1447 54.4652C94.3198 55.4583 94.8047 58.7386 93.5357 58.9306C92.8653 58.656 91.9754 56.8673 91.5621 56.1502C88.472 51.5199 84.1184 49.1736 78.6069 49.1671C77.8585 49.1663 77.4254 49.2306 76.7951 48.7727C76.5856 48.3883 76.6057 48.5589 76.7201 48.1357C77.7843 46.8503 80.401 46.102 81.9615 45.6844ZM91.4726 53.2288C91.8724 53.726 92.1662 54.1037 92.6376 54.5439C92.1958 53.3703 91.7526 52.1548 91.0306 51.1193C89.2885 48.6207 86.1709 47.0495 83.1186 47.1755C82.5226 47.2202 81.8331 47.2464 81.4222 47.7168L81.4577 47.8384C81.7146 47.8569 82.2011 47.7645 82.32 47.7964C86.2148 48.8422 88.6684 50.4654 91.4726 53.2288Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M91.4726 53.2288C91.8724 53.726 92.1662 54.1037 92.6376 54.5439C92.1958 53.3703 91.7526 52.1548 91.0306 51.1193C89.2885 48.6207 86.1709 47.0495 83.1186 47.1755C82.5226 47.2202 81.8331 47.2464 81.4222 47.7168L81.4577 47.8384C81.7146 47.8569 82.2011 47.7645 82.32 47.7964C86.2148 48.8422 88.6684 50.4654 91.4726 53.2288Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M36.3876 37.0846C38.9452 36.785 42.0922 37.97 44.0741 39.5729C44.8252 40.1804 46.426 41.5388 46.2506 42.6021C46.0399 42.8447 45.7136 43.0505 45.3929 42.9368C42.2279 41.815 38.0919 41.1064 34.7074 42.2208L34.6014 42.2565C32.767 42.7763 31.2867 43.5205 29.7351 44.6238C29.1581 45.0341 27.7829 46.1767 27.146 46.0781C26.0955 45.2595 27.9964 42.1103 28.6717 41.2362C30.6773 38.6394 33.214 37.4903 36.3876 37.0846ZM29.5088 42.8335C31.2466 41.6607 32.8188 41.0922 34.8487 40.5478C36.2884 40.1738 37.7748 40.0115 39.2612 40.0664C39.806 40.0833 41.6383 40.3155 41.9028 40.2028C41.2435 38.8896 37.0189 38.6748 35.6832 38.7895C33.0873 39.3027 31.0405 40.6799 29.5088 42.8335Z" fill="currentColor"/>
                    <path d="M29.5088 42.8335C31.2466 41.6607 32.8188 41.0922 34.8487 40.5478C36.2884 40.1738 37.7748 40.0115 39.2612 40.0664C39.806 40.0833 41.6383 40.3155 41.9028 40.2028C41.2435 38.8896 37.0189 38.6748 35.6832 38.7895C33.0873 39.3027 31.0405 40.6799 29.5088 42.8335Z" fill="currentColor"/>
                    <path d="M36.3876 37.0846C38.9452 36.785 42.0922 37.97 44.0741 39.5729C44.8252 40.1804 46.426 41.5388 46.2506 42.6021C46.0399 42.8447 45.7136 43.0505 45.3929 42.9368C42.2279 41.815 38.0919 41.1064 34.7074 42.2208L34.6014 42.2565C32.767 42.7763 31.2867 43.5205 29.7351 44.6238C29.1581 45.0341 27.7829 46.1767 27.146 46.0781C26.0955 45.2595 27.9964 42.1103 28.6717 41.2362C30.6773 38.6394 33.214 37.4903 36.3876 37.0846ZM29.5088 42.8335C31.2466 41.6607 32.8188 41.0922 34.8487 40.5478C36.2884 40.1738 37.7748 40.0115 39.2612 40.0664C39.806 40.0833 41.6383 40.3155 41.9028 40.2028C41.2435 38.8896 37.0189 38.6748 35.6832 38.7895C33.0873 39.3027 31.0405 40.6799 29.5088 42.8335Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M29.5088 42.8335C31.2466 41.6607 32.8188 41.0922 34.8487 40.5478C36.2884 40.1738 37.7748 40.0115 39.2612 40.0664C39.806 40.0833 41.6383 40.3155 41.9028 40.2028C41.2435 38.8896 37.0189 38.6748 35.6832 38.7895C33.0873 39.3027 31.0405 40.6799 29.5088 42.8335Z" stroke="currentColor" strokeWidth="3.07274"/>
                    <path d="M36.6347 45.6207C39.0027 45.4755 40.8997 46.1613 42.2343 47.5416C43.5247 48.8762 44.1158 50.6809 44.2968 52.4693C44.6543 56.003 43.4832 60.1583 41.6923 62.6842C40.5926 64.235 39.6088 65.5826 38.3466 66.6392C37.0368 67.7355 35.5071 68.4589 33.3818 68.9732L33.2841 68.9976L33.1835 69.0084C31.6508 69.1724 30.1068 68.818 28.7988 68.0025L28.789 67.9957C25.9082 66.1678 25.3436 62.7039 25.6034 59.7428C25.8692 56.7157 27.027 53.5822 28.374 51.6109C30.3547 48.7124 32.5358 46.5164 36.3935 45.6539L36.5126 45.6275L36.6347 45.6207Z" fill="currentColor"/>
                    <path d="M81.2147 53.9737C83.785 53.8961 85.7723 54.9593 87.1356 56.671C88.4507 58.3221 89.1339 60.5019 89.3895 62.6876C89.647 64.8905 89.4868 67.2327 88.993 69.3321C88.5356 71.2769 87.762 73.1417 86.6502 74.4962L86.4227 74.7598C85.6368 75.6324 84.9503 76.3224 84.1073 76.8341C83.249 77.3549 82.3341 77.6294 81.1942 77.8721L81.1092 77.8897L81.0243 77.8985C80.3356 77.9661 79.5754 77.8725 78.9061 77.7061C78.2396 77.5404 77.5178 77.2657 76.9383 76.8682C73.9529 74.8206 72.7795 71.2738 72.6415 67.8946C72.5029 64.4997 73.3823 60.9213 74.9149 58.378C76.3734 55.9579 78.3511 54.6247 80.9041 54.0147L81.0565 53.9786L81.2147 53.9737Z" fill="currentColor"/>
                </g>
                <defs>
                    <clipPath id="clip0_3553_406">
                        <rect width="122" height="121.2" fill="currentColor"/>
                    </clipPath>
                </defs>
            </svg>
        )
    },
    {
        label: "Library",
        href: "/patient/library",
        icon: <LibraryIcon />
    },
    { label: "Therapist", href: "/patient/therapists", icon: <UsersIcon /> },
]


export default function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(true) // Always closed
    const { data: session } = useSession()
    
    const [isNotifOpen, setIsNotifOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Fetch unread count on mount and optionally poll
        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/patient/notifications")
                const data = await res.json()
                if (data.notifications) {
                    const unread = data.notifications.filter((n: any) => !n.isRead).length
                    setUnreadCount(unread)
                }
            } catch (e) {
                console.error(e)
            }
        }
        fetchUnread()
    }, [isNotifOpen]) // Re-fetch when panel closes

    return (
        <div 
            className={`relative h-full transition-all duration-300 ${isCollapsed ? "w-[90px]" : "w-[260px]"} shrink-0 z-40`}
            style={{ backgroundImage: 'linear-gradient(to bottom, #4A3020, #26150C)' }}
        >

            {/* Toggle Button centered on the vertical border */}
            {/* <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute top-1/2 -translate-y-1/2 -right-3.5 text-zinc-400 hover:text-white transition-colors z-50 bg-[#18181b] p-1.5 rounded-full border border-[#3f3f46] shadow-lg flex items-center justify-center cursor-pointer"
                aria-label="Toggle Sidebar"
                title="Toggle Sidebar"
            >
                <SidebarToggleIcon className="w-4 h-4" isCollapsed={isCollapsed} />
            </button> */}

            <aside className={`flex flex-col h-full py-6 overflow-y-auto overflow-x-hidden shadow-inner ${isCollapsed ? "px-3 md:px-0" : "pl-3 pr-5"}`}>

                {/* Header / Logo */}
                <Link href="/patient/dashboard" className={`flex items-center transition-all ${isCollapsed ? "justify-center mt-6 mb-10" : "pl-0 mb-6 gap-3"}`}>
                    <div className="shrink-0">
                        <Image
                            src="/images/logo_light.png"
                            alt="Logo"
                            width={isCollapsed ? 36 : 40}
                            height={isCollapsed ? 36 : 40}
                            className="object-contain"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex items-center gap-0.5 tracking-tighter">
                            <span className="text-2xl font-black text-white">hey</span>
                            <span className="text-2xl font-black text-[var(--color-brand)]">attrangi</span>
                        </div>
                    )}
                </Link>

                {/* General Section */}
                {generalItems.length > 0 && (
                    <div className={`mb-8 ${isCollapsed ? "px-2" : "pl-2"}`}>
                        {!isCollapsed && <h3 className="text-[11px] font-bold text-orange-200/50 mb-3 px-2 uppercase tracking-wide">General</h3>}
                        <nav className="flex flex-col gap-1.5">
                            {generalItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/patient/dashboard' && pathname.startsWith(item.href.split('?')[0]) && item.label !== "Calendar")

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        title={isCollapsed ? item.label : undefined}
                                        className={`flex items-center rounded-2xl transition-all duration-300 font-bold
                                            ${isCollapsed ? "w-12 h-12 mx-auto justify-center" : "px-4 py-3 justify-between"}
                                            ${isActive
                                                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                                : "text-orange-100/60 hover:text-white hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                            {!isCollapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                                        </div>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}

                {/* Tools Section */}
                <div className={`mb-8 w-full flex-1 flex flex-col justify-center ${isCollapsed ? "px-2" : "pl-2"}`}>
                    {!isCollapsed && <h3 className="text-[11px] font-bold text-orange-200/50 mb-3 px-2 uppercase tracking-wide">Tools</h3>}
                    <nav className={`flex flex-col ${isCollapsed ? "gap-6" : "gap-1.5"}`}>
                        {toolItems.map((item) => {
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    title={isCollapsed ? item.label : undefined}
                                    className={`flex items-center rounded-2xl transition-all duration-300 font-bold relative
                                        ${isCollapsed ? "w-12 h-12 mx-auto justify-center" : "px-4 py-3 justify-between"}
                                        ${isActive
                                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                                            : "text-orange-100/60 hover:text-white hover:bg-white/10"
                                        }
                                    `}
                                >
                                    <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                                        <div className="flex items-center justify-center">
                                            {item.icon}
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

                {/* Notifications Button */}
                <div className={`mb-3 ${isCollapsed ? "mx-auto w-full flex justify-center px-2" : "mx-4"}`}>
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        className={`flex items-center rounded-2xl transition-all duration-300 font-bold relative group
                            ${isCollapsed ? "w-12 h-12 justify-center" : "px-4 py-3 justify-between w-full"}
                            hover:bg-white/10 text-orange-100/60 hover:text-white
                        `}
                        title={isCollapsed ? "Notifications" : undefined}
                    >
                        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3"}`}>
                            <div className="flex items-center justify-center">
                                <BellIcon />
                            </div>
                            {!isCollapsed && <span className="text-sm whitespace-nowrap">Notifications</span>}
                        </div>
                        {unreadCount > 0 && (
                            <div className={`bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full shadow-sm absolute ${isCollapsed ? "top-1 right-1 w-4 h-4" : "right-3 w-5 h-5"}`}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </button>
                </div>

                {/* Profile Card / Button */}
                {!isCollapsed ? (
                    <div className="mt-auto mb-6 mx-4">
                        <Link
                            href="/patient/profile"
                            className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all duration-300 group shadow-sm select-none cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-black/20 shrink-0 border border-white/10 shadow-sm flex items-center justify-center">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-bold text-orange-100/60">
                                        {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-black text-white leading-none tracking-wide truncate">
                                    {session?.user?.name || "Patient"}
                                </span>
                                <span className="text-[11px] font-bold text-orange-300 mt-1 uppercase tracking-wider leading-none">
                                    View Profile
                                </span>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="mt-auto mb-6 mx-auto w-full flex justify-center px-2">
                        <Link
                            href="/patient/profile"
                            className="w-12 h-12 rounded-2xl overflow-hidden relative bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 group flex items-center justify-center shadow-sm cursor-pointer shrink-0"
                            title={session?.user?.name || "Profile"}
                        >
                            {session?.user?.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-base font-black text-orange-100/60">
                                    {session?.user?.name ? session.user.name[0].toUpperCase() : "U"}
                                </span>
                            )}
                        </Link>
                    </div>
                )}

                {/* Bottom CTA */}
                {/* {!isCollapsed && (
                    <div className="mb-6 mx-4">
                        <button className="w-full bg-white hover:bg-zinc-200 text-black rounded-[14px] py-3.5 shadow-lg flex items-center justify-center gap-2.5 transition-all">
                            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white text-base leading-none font-medium mb-[1px]">+</span>
                            </div>
                            <span className="text-[14px] font-bold tracking-wide">Book Appointment</span>
                        </button>
                    </div>
                )} */}

            </aside>

            {/* Slide-over Notifications Panel */}
            <NotificationsPanel 
                isOpen={isNotifOpen} 
                onClose={() => setIsNotifOpen(false)} 
            />
        </div>
    )
}
