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

const normalizeContent = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

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

    const cleanList = [];

    for (const item of list) {
      const normTitle = normalizeContent(item?.title);
      const normMsg = normalizeContent(item?.message);
      const isDuplicate = cleanList.some((existing) => {
        const exTitle = normalizeContent(existing?.title);
        const exMsg = normalizeContent(existing?.message);
        if (normTitle && exTitle && normTitle === exTitle && normMsg === exMsg) return true;
        if (normTitle && exTitle && normTitle === exTitle) {
          const prefixLen = Math.min(25, Math.min(normMsg.length, exMsg.length));
          if (prefixLen >= 15 && normMsg.slice(0, prefixLen) === exMsg.slice(0, prefixLen)) {
            return true;
          }
        }
        return false;
      });

      if (!isDuplicate) {
        cleanList.push(item);
      }
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

