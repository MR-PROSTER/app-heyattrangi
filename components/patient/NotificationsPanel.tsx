"use client"

import { useState, useEffect } from "react"

type Notification = {
    id: string
    title: string
    message: string
    type: string
    isRead: boolean
    createdAt: string
}

export default function NotificationsPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/patient/notifications")
            const data = await res.json()
            if (data.notifications) {
                setNotifications(data.notifications)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const markAsRead = async (id: string) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            await fetch("/api/patient/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationId: id })
            })
        } catch (error) {
            console.error(error)
        }
    }

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            await fetch("/api/patient/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            })
        } catch (error) {
            console.error(error)
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifications
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">You have no notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div 
                                key={notif.id} 
                                className={`p-5 rounded-2xl border transition-all ${notif.isRead ? "bg-white border-gray-100" : "bg-indigo-50 border-indigo-100 shadow-sm"}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${notif.isRead ? "text-gray-800" : "text-indigo-900"}`}>
                                        {notif.title}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={`text-sm leading-relaxed mb-4 ${notif.isRead ? "text-gray-600" : "text-indigo-800"}`}>
                                    {notif.message}
                                </p>
                                {!notif.isRead && (
                                    <button 
                                        onClick={() => markAsRead(notif.id)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {notifications.some(n => !n.isRead) && (
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button 
                            onClick={markAllAsRead}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
