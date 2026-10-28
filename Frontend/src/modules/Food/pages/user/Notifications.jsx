import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Gift, 
  AlertCircle, 
  Trash2, 
  X, 
  CheckCheck, 
  Copy, 
  ExternalLink, 
  ShoppingBag, 
  Utensils, 
  ChevronRight,
  Sparkles,
  ShieldAlert,
  LogIn
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import AnimatedPage from "@food/components/user/AnimatedPage"
import { Button } from "@food/components/ui/button"
import { Card, CardContent } from "@food/components/ui/card"
import { Badge } from "@food/components/ui/badge"
import useNotificationInbox from "@food/hooks/useNotificationInbox"
import { isModuleAuthenticated } from "@food/utils/auth"
import { toast } from "sonner"

// Default notifications shown if localStorage is empty
const DEFAULT_NOTIFICATIONS = [
  {
    id: "welcome-1",
    type: "order",
    title: "Order Confirmed",
    message: "Your order #12345 has been confirmed and is being prepared with love by the kitchen.",
    orderId: "12345",
    time: "10 minutes ago",
    timestamp: Date.now() - 600000,
    read: false,
    icon: "CheckCircle2",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    id: "promo-2",
    type: "offer",
    title: "Welcome to VIST Restro!",
    message: "Use code FIRST50 on your first order above ₹300 to enjoy 50% discount.",
    couponCode: "FIRST50",
    time: "1 hour ago",
    timestamp: Date.now() - 3600000,
    read: false,
    icon: "Tag",
    iconColor: "text-amber-600 dark:text-amber-400"
  }
]

const ICON_MAP = {
  CheckCircle2,
  Tag,
  Gift,
  AlertCircle,
  Bell,
  ShoppingBag,
  Utensils
}

export default function Notifications() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => isModuleAuthenticated("user"))

  const [notificationsList, setNotificationsList] = useState(() => {
    try {
      const saved = localStorage.getItem("food_user_notifications")
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS
    } catch {
      return DEFAULT_NOTIFICATIONS
    }
  })

  const {
    items: broadcastNotifications,
    unreadCount: broadcastUnreadCount,
    markAsRead: markBroadcastAsRead,
    markAllAsRead: markAllBroadcastAsRead,
    dismiss: dismissBroadcastNotification,
    dismissAll: dismissAllBroadcastNotifications,
  } = useNotificationInbox("user", { limit: 100 })

  // Keep auth state in sync
  useEffect(() => {
    const handleAuth = () => setIsAuthenticated(isModuleAuthenticated("user"))
    window.addEventListener("userAuthChanged", handleAuth)
    window.addEventListener("storage", handleAuth)
    return () => {
      window.removeEventListener("userAuthChanged", handleAuth)
      window.removeEventListener("storage", handleAuth)
    }
  }, [])

  // Persistence: Save to localStorage whenever list updates & dispatch badge update
  useEffect(() => {
    try {
      localStorage.setItem("food_user_notifications", JSON.stringify(notificationsList))
    } catch (e) {
      // ignore storage errors
    }
    const localUnread = notificationsList.filter(n => !n.read).length
    const totalUnread = localUnread + (broadcastUnreadCount || 0)
    window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: { count: totalUnread } }))
  }, [notificationsList, broadcastUnreadCount])

  // Real-time listeners: Order updates, OTPs, custom notifications
  useEffect(() => {
    const handleOrderUpdate = (event) => {
      const { orderId, status, message, title } = event?.detail || {}
      const isCancelled = String(status || "").toLowerCase().includes("cancel")
      
      const newNotification = {
        id: `order-${Date.now()}`,
        type: isCancelled ? "alert" : "order",
        title: title || `Order #${orderId || ""} ${status || ""}`.trim(),
        message: message || `Your order status is now ${status || "updated"}`,
        orderId: orderId || null,
        time: "Just now",
        timestamp: Date.now(),
        read: false,
        icon: isCancelled ? "AlertCircle" : "CheckCircle2",
        iconColor: isCancelled ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
      }
      setNotificationsList(prev => [newNotification, ...(prev || [])])
      toast.info(newNotification.title, { description: newNotification.message })
    }

    const handleDeliveryOtp = (event) => {
      const { orderId, otp, message } = event?.detail || {}
      const newNotification = {
        id: `otp-${Date.now()}`,
        type: "alert",
        title: "Delivery OTP Received",
        message: message || `Your OTP for order #${orderId || ""} is ${otp || ""}`.trim(),
        orderId: orderId || null,
        otp: otp || null,
        time: "Just now",
        timestamp: Date.now(),
        read: false,
        icon: "ShieldAlert",
        iconColor: "text-amber-600 dark:text-amber-400"
      }
      setNotificationsList(prev => [newNotification, ...(prev || [])])
      toast.success("Delivery OTP Received", { description: `OTP: ${otp}` })
    }

    window.addEventListener("orderStatusNotification", handleOrderUpdate)
    window.addEventListener("deliveryDropOtp", handleDeliveryOtp)

    return () => {
      window.removeEventListener("orderStatusNotification", handleOrderUpdate)
      window.removeEventListener("deliveryDropOtp", handleDeliveryOtp)
    }
  }, [])

  // Merge and sort all notifications
  const mergedNotifications = useMemo(() => {
    const localItems = (notificationsList || []).map((item) => ({
      ...item,
      source: item.source || "local",
    }))

    const broadcastItems = (broadcastNotifications || []).map((item) => {
      const category = String(item.category || "").toLowerCase()
      const isOffer = category.includes("offer") || category.includes("deal") || category.includes("coupon")
      return {
        ...item,
        source: "broadcast",
        type: isOffer ? "offer" : "broadcast",
        time: item.createdAt
          ? new Date(item.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "Recently",
        timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
        icon: isOffer ? "Tag" : "Bell",
        iconColor: isOffer ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400",
      }
    })

    return [...broadcastItems, ...localItems].sort(
      (a, b) =>
        new Date(b.timestamp || b.createdAt || 0).getTime() -
        new Date(a.timestamp || a.createdAt || 0).getTime()
    )
  }, [broadcastNotifications, notificationsList])

  // Tab counts
  const counts = useMemo(() => {
    const all = mergedNotifications.length
    const orders = mergedNotifications.filter(
      (n) => n.type === "order" || n.type === "alert" || n.orderId || n.otp
    ).length
    const offers = mergedNotifications.filter(
      (n) => n.type === "offer" || n.type === "promotion" || n.couponCode
    ).length
    const updates = mergedNotifications.filter(
      (n) => n.type === "broadcast" || n.source === "broadcast"
    ).length
    const unread = mergedNotifications.filter((n) => !n.read).length
    return { all, orders, offers, updates, unread }
  }, [mergedNotifications])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return mergedNotifications.filter((n) => {
      if (unreadOnly && n.read) return false
      if (activeTab === "all") return true
      if (activeTab === "orders") {
        return n.type === "order" || n.type === "alert" || n.orderId || n.otp
      }
      if (activeTab === "offers") {
        return n.type === "offer" || n.type === "promotion" || n.couponCode
      }
      if (activeTab === "updates") {
        return n.type === "broadcast" || n.source === "broadcast"
      }
      return true
    })
  }, [mergedNotifications, activeTab, unreadOnly])

  const handleMarkAsRead = (id, source = "local") => {
    if (source === "broadcast") {
      markBroadcastAsRead?.(id)
    } else {
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })))
    if (typeof markAllBroadcastAsRead === "function") {
      try {
        await markAllBroadcastAsRead()
      } catch {
        // ignore
      }
    }
    toast.success("All notifications marked as read")
  }

  const handleClearAll = () => {
    if (mergedNotifications.length === 0) return
    setNotificationsList([])
    if (typeof dismissAllBroadcastNotifications === "function") {
      dismissAllBroadcastNotifications()
    }
    toast.success("All notifications cleared")
  }

  const handleDeleteOne = (id, source = "local", e) => {
    if (e) e.stopPropagation()
    if (source === "broadcast") {
      dismissBroadcastNotification?.(id)
    } else {
      setNotificationsList((prev) => prev.filter((n) => n.id !== id))
    }
    toast.success("Notification removed")
  }

  const handleCopyOTP = (otp, e) => {
    if (e) e.stopPropagation()
    if (!otp) return
    navigator.clipboard?.writeText(String(otp))
    toast.success("OTP copied to clipboard!")
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate("/food/user")
    }
  }

  return (
    <AnimatedPage className="min-h-screen bg-[#FAF5ED] dark:bg-[#120E0C] text-[#2C1810] dark:text-neutral-100 transition-colors pb-16 sm:pb-24">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* Sticky/Fixed-feel Header */}
        <div className="bg-[#FAF5ED]/95 dark:bg-[#120E0C]/95 backdrop-blur-md pt-2 pb-4 mb-4 border-b border-[#EADBCE] dark:border-white/10 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Back & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleGoBack}
                className="rounded-full h-9 w-9 bg-white dark:bg-[#1a1a1a] border border-[#EADBCE] dark:border-white/10 shadow-xs hover:bg-[#EDE4D8] dark:hover:bg-white/10 active:scale-95 shrink-0"
                aria-label="Go Back"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#5C381E] dark:text-[#E6C687]" />
              </Button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[#5C381E]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-[#5C381E] dark:text-[#E6C687] fill-[#5C381E]/20" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#2C1810] dark:text-white flex items-center gap-2">
                    Notifications
                    {counts.unread > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#5C381E] text-white">
                        {counts.unread} new
                      </span>
                    )}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {counts.unread > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-full bg-white dark:bg-[#1a1a1a] border-[#EADBCE] dark:border-white/10 hover:border-[#5C381E] text-[#5C381E] dark:text-[#E6C687] flex items-center gap-1 shadow-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}

              {mergedNotifications.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear all</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
              {[
                { id: "all", label: "All", count: counts.all },
                { id: "orders", label: "Orders", count: counts.orders },
                { id: "offers", label: "Offers & Promos", count: counts.offers },
                { id: "updates", label: "Updates", count: counts.updates },
              ].map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-[#5C381E] text-white shadow-xs"
                        : "bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border border-[#EADBCE] dark:border-white/10 hover:bg-[#EDE4D8]/50 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Unread Toggle Pill */}
            {counts.unread > 0 && (
              <button
                onClick={() => setUnreadOnly((prev) => !prev)}
                className={`text-xs px-2.5 py-1.5 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1 border ${
                  unreadOnly
                    ? "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
                    : "bg-white dark:bg-[#1a1a1a] border-[#EADBCE] dark:border-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${unreadOnly ? "bg-amber-600 animate-pulse" : "bg-gray-400"}`} />
                Unread only
              </button>
            )}
          </div>
        </div>

        {/* Guest Banner if not signed in */}
        {!isAuthenticated && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  Want live updates on your orders?
                </p>
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 truncate">
                  Sign in to receive real-time kitchen tracking & personalized offers.
                </p>
              </div>
            </div>
            <Link 
              to="/food/user/auth/login?redirect=/food/user/notifications"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#5C381E] text-white hover:bg-[#462a16] transition-colors shrink-0 flex items-center gap-1"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In
            </Link>
          </motion.div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notification) => {
              const Icon = ICON_MAP[notification.icon] || Bell
              const isUnread = !notification.read
              const isOrder = notification.type === "order" || Boolean(notification.orderId)
              const isOffer = notification.type === "offer" || Boolean(notification.couponCode)
              const isOtp = Boolean(notification.otp) || notification.title?.toLowerCase().includes("otp")
              
              // Extract order ID if present in text
              const parsedOrderId = notification.orderId || notification.message?.match(/#([0-9a-zA-Z_-]+)/)?.[1]
              // Extract OTP if present in text
              const parsedOtp = notification.otp || notification.message?.match(/\b(\d{4,6})\b/)?.[1]

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    onClick={() => handleMarkAsRead(notification.id, notification.source)}
                    className={`relative cursor-pointer transition-all duration-200 border rounded-2xl shadow-xs overflow-hidden ${
                      isUnread
                        ? "bg-white dark:bg-[#1a1410] border-[#5C381E]/30 dark:border-[#E6C687]/30 ring-1 ring-[#5C381E]/10"
                        : "bg-white/80 dark:bg-[#161210] border-[#EADBCE]/80 dark:border-white/5 hover:bg-white dark:hover:bg-[#1a1410]"
                    }`}
                  >
                    {/* Unread Accent Bar on the left */}
                    {isUnread && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5C381E] dark:bg-[#E6C687]" />
                    )}

                    <CardContent className="p-3.5 sm:p-4 pl-4 sm:pl-5">
                      <div className="flex items-start gap-3 sm:gap-4">
                        
                        {/* Notification Icon */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 ${
                            isOrder
                              ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                              : isOffer
                              ? "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                              : isOtp
                              ? "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400"
                              : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Text and Actions Content */}
                        <div className="flex-1 min-w-0">
                          
                          {/* Row 1: Badges, Title, Time, and Dismiss */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <h3
                                className={`text-sm sm:text-base font-bold truncate leading-tight ${
                                  isUnread
                                    ? "text-[#2C1810] dark:text-white"
                                    : "text-gray-800 dark:text-gray-200"
                                }`}
                              >
                                {notification.title}
                              </h3>

                              {/* Category Badge */}
                              {isOrder && (
                                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] py-0 px-1.5 border-none font-semibold">
                                  Order
                                </Badge>
                              )}
                              {isOffer && (
                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] py-0 px-1.5 border-none font-semibold">
                                  Offer
                                </Badge>
                              )}
                              {isOtp && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 text-[10px] py-0 px-1.5 border-none font-semibold">
                                  OTP
                                </Badge>
                              )}
                            </div>

                            {/* Dismiss button */}
                            <button
                              type="button"
                              aria-label="Dismiss notification"
                              onClick={(e) => handleDeleteOne(notification.id, notification.source, e)}
                              className="text-gray-400 hover:text-red-500 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0"
                            >
                              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          {/* Message Body */}
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                            {notification.message}
                          </p>

                          {/* Interactive Action Row (OTP, Order details, Links) */}
                          {(parsedOtp || parsedOrderId || notification.link || notification.couponCode) && (
                            <div className="flex items-center gap-2 flex-wrap mb-2 pt-0.5">
                              {/* Highlighted OTP Pill */}
                              {parsedOtp && (
                                <div className="inline-flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 rounded-lg px-2.5 py-1">
                                  <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">OTP:</span>
                                  <span className="text-xs font-mono font-bold tracking-widest text-orange-900 dark:text-orange-200">
                                    {parsedOtp}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyOTP(parsedOtp, e)}
                                    className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-300 rounded hover:bg-orange-200/50 transition-colors"
                                    title="Copy OTP"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              )}

                              {/* Order Tracking Button */}
                              {parsedOrderId && (
                                <Link
                                  to={`/food/user/orders/${parsedOrderId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#5C381E] text-white hover:bg-[#462a16] transition-colors"
                                >
                                  Track Order #{parsedOrderId}
                                  <ChevronRight className="h-3 w-3" />
                                </Link>
                              )}

                              {/* Offer Details Button */}
                              {notification.couponCode && (
                                <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg px-2.5 py-1">
                                  <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">Code:</span>
                                  <span className="text-xs font-mono font-bold tracking-wider text-amber-900 dark:text-amber-200">
                                    {notification.couponCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyOTP(notification.couponCode, e)}
                                    className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-300 rounded hover:bg-amber-200/50 transition-colors"
                                    title="Copy Code"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              )}

                              {/* External or Custom Link */}
                              {notification.link && (
                                <a
                                  href={notification.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Details
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Footer: Time & Read Status */}
                          <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 pt-0.5">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{notification.time}</span>
                            </div>

                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id, notification.source)
                                }}
                                className="text-xs font-semibold text-[#5C381E] dark:text-[#E6C687] hover:underline flex items-center gap-0.5"
                              >
                                <CheckCheck className="h-3 w-3" />
                                Mark read
                              </button>
                            )}
                          </div>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Empty States */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 sm:py-20 px-4 bg-white/50 dark:bg-white/[0.02] border border-[#EADBCE]/50 dark:border-white/5 rounded-3xl mt-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5C381E]/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-[#5C381E] dark:text-[#E6C687]">
              {activeTab === "orders" ? (
                <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 opacity-70" />
              ) : activeTab === "offers" ? (
                <Tag className="h-8 w-8 sm:h-10 sm:w-10 opacity-70" />
              ) : (
                <Bell className="h-8 w-8 sm:h-10 sm:w-10 opacity-70" />
              )}
            </div>

            <h3 className="text-base sm:text-xl font-bold text-[#2C1810] dark:text-white mb-1.5">
              {unreadOnly
                ? "No unread notifications"
                : activeTab === "orders"
                ? "No order updates yet"
                : activeTab === "offers"
                ? "No active offers right now"
                : activeTab === "updates"
                ? "No system updates"
                : "No notifications found"}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-5">
              {unreadOnly
                ? "You're completely caught up! We'll alert you as soon as new updates arrive."
                : activeTab === "orders"
                ? "When you place an order, live preparation and delivery status will appear right here."
                : activeTab === "offers"
                ? "Check back soon for exclusive festive discounts, coupon codes, and special restaurant promotions."
                : "You're all caught up! Order status updates, coupons, and announcements will appear here."}
            </p>

            {/* Quick Action Button */}
            <div className="flex items-center justify-center gap-3">
              {unreadOnly ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnreadOnly(false)}
                  className="rounded-full text-xs font-bold border-[#EADBCE] text-[#5C381E] dark:text-[#E6C687]"
                >
                  View All Notifications
                </Button>
              ) : activeTab === "orders" ? (
                <Link to="/food/user">
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-bold bg-[#5C381E] text-white hover:bg-[#462a16]"
                  >
                    Browse Menu & Order
                  </Button>
                </Link>
              ) : activeTab === "offers" ? (
                <Link to="/food/user/offers">
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-bold bg-[#5C381E] text-white hover:bg-[#462a16]"
                  >
                    Explore Restaurant Offers
                  </Button>
                </Link>
              ) : (
                <Link to="/food/user">
                  <Button
                    size="sm"
                    className="rounded-full text-xs font-bold bg-[#5C381E] text-white hover:bg-[#462a16]"
                  >
                    Explore VIST Restro
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </AnimatedPage>
  )
}
