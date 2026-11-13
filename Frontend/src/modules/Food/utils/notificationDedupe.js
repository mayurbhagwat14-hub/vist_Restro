// Shared Notification Deduplicator & Alert Debouncer
// Prevents duplicate toasts/alerts when both Socket.IO and Firebase Cloud Messaging (FCM)
// receive the same broadcast/order notification at the same time.

const recentAlerts = new Map();

/**
 * Returns false if an identical alert was recently shown within debounceMs (default 12s).
 */
export const shouldShowNotificationAlert = (keyOrTitle, message = '', debounceMs = 12000) => {
  const normalizedKey = `${String(keyOrTitle || '').trim().toLowerCase()}:::${String(message || '').trim().toLowerCase()}`;
  const now = Date.now();

  // Prune expired entries
  for (const [k, timestamp] of recentAlerts.entries()) {
    if (now - timestamp > debounceMs) {
      recentAlerts.delete(k);
    }
  }

  if (recentAlerts.has(normalizedKey)) {
    return false;
  }

  recentAlerts.set(normalizedKey, now);
  return true;
};

/**
 * Clean existing dirty localStorage notifications to remove duplicates.
 */
export const cleanDuplicateLocalNotifications = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('food_user_notifications');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    const seen = new Set();
    const cleanList = [];

    for (const item of list) {
      const key = `${String(item?.title || '').trim().toLowerCase()}:::${String(item?.message || '').trim().toLowerCase()}`;
      if (!key || seen.has(key)) {
        continue; // duplicate
      }
      seen.add(key);
      cleanList.push(item);
    }

    if (cleanList.length !== list.length) {
      localStorage.setItem('food_user_notifications', JSON.stringify(cleanList));
      window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    }
    return cleanList;
  } catch {
    return [];
  }
};
