import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useNotificationInbox from "@food/hooks/useNotificationInbox";

export default function HeaderNotificationBell({ className = "", triggerClass = "" }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('food_user_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const {
    unreadCount: broadcastUnreadCount = 0,
  } = useNotificationInbox("user", { limit: 20 });

  useEffect(() => {
    const syncNotifications = () => {
      try {
        const saved = localStorage.getItem('food_user_notifications');
        setNotifications(saved ? JSON.parse(saved) : []);
      } catch {
        setNotifications([]);
      }
    };

    window.addEventListener('notificationsUpdated', syncNotifications);
    return () => window.removeEventListener('notificationsUpdated', syncNotifications);
  }, []);

  const unreadCount = (Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0) + (broadcastUnreadCount || 0);

  const hasCustomBg = triggerClass && (triggerClass.includes("bg-") || triggerClass.includes("rounded-"));
  const buttonStyle = hasCustomBg 
    ? `h-8 w-8 relative flex items-center justify-center cursor-pointer active:scale-95 transition-all ${triggerClass}`
    : `h-8 w-8 relative flex items-center justify-center rounded-lg bg-white/10 border border-white/10 cursor-pointer active:scale-95 hover:bg-white/20 transition-all ${triggerClass}`;

  return (
    <Link 
      to="/food/user/notifications" 
      className={buttonStyle}
      aria-label="Notifications"
    >
      <Bell className={`h-4 w-4 ${className || "text-white"}`} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D32F2F] border border-white dark:border-zinc-900 animate-pulse" />
      )}
    </Link>
  );
}
