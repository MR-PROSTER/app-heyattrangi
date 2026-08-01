/**
 * Notification preference storage for Settings → Notifications.
 * Optimistic client persistence until a preferences API exists.
 */

export interface NotificationPrefs {
  moodReminders: boolean
  activityReminders: boolean
  productUpdates: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  moodReminders: false,
  activityReminders: false,
  productUpdates: true,
  emailNotifications: true,
  pushNotifications: false,
}

function key(userId: string) {
  return `attrangi:notification-prefs:${userId}`
}

export function readNotificationPrefs(userId: string): NotificationPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_NOTIFICATION_PREFS }
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return { ...DEFAULT_NOTIFICATION_PREFS, ...parsed }
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS }
  }
}

export function writeNotificationPrefs(userId: string, prefs: NotificationPrefs) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}
