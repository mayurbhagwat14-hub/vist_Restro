import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { adminAPI } from "@food/api"
import { setAuthData, scheduleProactiveRefresh } from "@food/utils/auth"
import { loadBusinessSettings } from "@food/utils/businessSettings"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
  BarChart3,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import quickSpicyLogo from "@food/assets/vist-logo.png"

const debugWarn = (...args) => {}

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [logoUrl, setLogoUrl] = useState("/visit-crest-gold.jpg")
  const submittingRef = useRef(false)

  // Initialize remembered email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("vist_admin_remember_email")
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    } catch {
      // Ignore localStorage issues
    }
  }, [])

  useEffect(() => {
    const message = location.state?.message
    if (message) {
      setSuccessMessage(message)
      window.history.replaceState({}, document.title, location.pathname)
    }
  }, [location.state?.message, location.pathname])

  // Fetch business settings logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await loadBusinessSettings()
        if (settings?.logo?.url) {
          setLogoUrl(settings.logo.url)
        }
      } catch (error) {
        debugWarn("Failed to load business settings logo:", error)
      }
    }
    fetchLogo()

    // Listen for business settings updates
    const handleSettingsUpdate = async () => {
      const settings = await loadBusinessSettings()
      if (settings?.logo?.url) {
        setLogoUrl(settings.logo.url)
      }
    }
    window.addEventListener("businessSettingsUpdated", handleSettingsUpdate)
    return () => window.removeEventListener("businessSettingsUpdated", handleSettingsUpdate)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    if (submittingRef.current) return

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError("Email is required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address")
      return
    }
    if (!password) {
      setError("Password is required")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    // Save or clear remembered email
    try {
      if (rememberMe) {
        localStorage.setItem("vist_admin_remember_email", trimmedEmail)
      } else {
        localStorage.removeItem("vist_admin_remember_email")
      }
    } catch {
      // Ignore localStorage issues
    }

    submittingRef.current = true
    setIsLoading(true)

    try {
      const response = await adminAPI.login(trimmedEmail, password)
      const data = response?.data?.data || response?.data || {}

      const accessToken = data.accessToken
      const adminUser = data.user || data.admin
      const refreshToken = data.refreshToken ?? null

      if (!accessToken || !adminUser) {
        throw new Error("Invalid response from server")
      }
      if (!refreshToken) {
        throw new Error("Invalid response from server: missing refresh token")
      }
      setAuthData("admin", accessToken, adminUser, refreshToken)
      scheduleProactiveRefresh("admin")
      navigate("/admin/food", { replace: true })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please check your credentials."
      setError(message)
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF5ED] dark:bg-[#120B07] text-[#2C1810] dark:text-[#FAF5ED] selection:bg-[#C5A059]/30">
      {/* LEFT COLUMN: Cinematic Heritage & Operations Showcase (Desktop) */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#160B07]">
        {/* Background Atmosphere Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/vist-admin-desk.jpg')` }}
        />

        {/* Multi-layer Luxury Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#1A0F0A]/85 to-[#160B07]/75 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#140A06]/40 to-[#140A06]/95" />

        {/* Subtle Ambient Gold Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8C673B]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#24140D]/80 border border-[#C5A059]/30 backdrop-blur-md shadow-lg shadow-black/20">
            <Sparkles className="w-3.5 h-3.5 text-[#E2B755]" />
            <span className="text-[11px] font-bold tracking-widest text-[#E2B755] uppercase">
              EST. 1996 • 28+ YEARS OF EXCELLENCE
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono tracking-wider text-[#EADBCE]/60 uppercase">
              CONSOLE v2.4
            </span>
          </div>
        </div>

        {/* Center Editorial Showcase */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-3.5 p-2 pr-5 rounded-2xl bg-white/10 border border-[#C5A059]/40 backdrop-blur-md mb-6 shadow-xl shadow-black/30">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C5A059]/50 shadow-md bg-[#FAF5ED] shrink-0">
              <img
                src={logoUrl || "/visit-crest-gold.jpg"}
                alt="VISIT Restaurant Crest"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/visit-crest-gold.jpg"
                }}
              />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-[#FDFBF7] tracking-wider leading-none">
                VISIT RESTAURANT
              </p>
              <p className="text-[11px] text-[#E2B755] font-semibold tracking-widest uppercase mt-1">
                EST. 1996 • Executive Portal
              </p>
            </div>
          </div>

          <h1 className="font-serif text-3xl xl:text-5xl font-bold text-[#FDFBF7] leading-[1.18] tracking-tight drop-shadow-md">
            Fine Culinary Heritage Meets Intelligent Operations.
          </h1>

          <p className="text-sm xl:text-base text-[#EADBCE]/85 mt-4 leading-relaxed max-w-lg">
            Synchronize floor reservations, digital kitchen dispatch, multi-channel orders, and financial analytics with high precision from one unified command console.
          </p>

          {/* Interactive Feature Pills */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md transition-all hover:border-[#C5A059]/50">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <ChefHat className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Kitchen KDS</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Live ticket routing</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md transition-all hover:border-[#C5A059]/50">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <BarChart3 className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Executive Reports</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Live revenue & VAT</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md transition-all hover:border-[#C5A059]/50">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Tiered RBAC</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Granular permissions</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Security Notice */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#C5A059]/20 text-[11px] text-[#EADBCE]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>
          <span>© 2026 VIST Restro. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Executive Access & Login Form */}
      <div className="w-full lg:w-[52%] xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen relative overflow-y-auto">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#5C381E]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Top Action Bar */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C381E] hover:text-[#2C1810] dark:text-[#E2B755] dark:hover:text-[#F3D78E] py-2 px-3.5 rounded-full border border-[#DBC8B2] dark:border-[#4A3222] bg-white/80 dark:bg-[#1E130D]/80 hover:bg-white dark:hover:bg-[#2A1A12] backdrop-blur-sm transition-all shadow-xs cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Storefront</span>
          </button>

          {/* Operational Status indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Console Operational</span>
          </div>
        </div>

        {/* Center Login Form Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl bg-white/90 dark:bg-[#1C120C]/90 backdrop-blur-xl border border-[#EADBCE] dark:border-[#4A3222] shadow-[0_20px_60px_rgba(92,56,30,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-7 sm:p-9"
          >
            {/* Header with Emblem */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F0E6D8] dark:border-[#382317]">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#C5A059]/50 shadow-md bg-[#FAF5ED] shrink-0 p-0.5">
                <img
                  src={logoUrl || "/visit-crest-gold.jpg"}
                  alt="VISIT Restaurant Crest"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = "/visit-crest-gold.jpg"
                  }}
                />
              </div>

              <div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#8C673B] dark:text-[#C5A059] block">
                  Management Console
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810] dark:text-[#FAF5ED] leading-tight">
                  Admin Sign In
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#C2B2A3] mb-6">
              Sign in with your verified administrative credentials to manage restaurant operations.
            </p>

            {/* Notification Messages */}
            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{successMessage}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/90 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block">
                  Admin Email
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C673B] dark:text-[#C5A059] group-focus-within:text-[#5C381E] dark:group-focus-within:text-[#E2B755] transition-colors pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@vistrestaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#1E130D] border border-[#DBC8B2] dark:border-[#4A3222] rounded-xl text-[#2C1810] dark:text-[#FAF5ED] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 transition-all shadow-xs disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/forgot-password")}
                    tabIndex={isLoading ? -1 : 0}
                    className="text-xs font-medium text-[#8C673B] hover:text-[#5C381E] dark:text-[#C5A059] dark:hover:text-[#E2B755] transition-colors hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C673B] dark:text-[#C5A059] group-focus-within:text-[#5C381E] dark:group-focus-within:text-[#E2B755] transition-colors pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 text-sm bg-white dark:bg-[#1E130D] border border-[#DBC8B2] dark:border-[#4A3222] rounded-xl text-[#2C1810] dark:text-[#FAF5ED] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 transition-all shadow-xs disabled:opacity-60 [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C673B] hover:text-[#2C1810] dark:text-[#C5A059] dark:hover:text-[#FAF5ED] transition-colors rounded-md focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Utility Row: Remember Me & Encryption Badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DBC8B2] text-[#5C381E] focus:ring-[#C5A059] cursor-pointer accent-[#5C381E]"
                  />
                  <span className="font-medium text-[#4A3022] dark:text-[#DBC8B2]">
                    Remember email
                  </span>
                </label>

                <span className="flex items-center gap-1 text-[11px] text-[#8C673B] dark:text-[#C5A059]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Session Protected</span>
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2C1810] via-[#5C381E] to-[#2C1810] hover:from-[#3D2217] hover:via-[#6E4426] hover:to-[#3D2217] text-white font-semibold text-sm shadow-md hover:shadow-xl shadow-[#5C381E]/20 transition-all duration-300 border border-[#C5A059]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E2B755]" />
                      <span>Authenticating credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Admin Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-[#E2B755] group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Mobile Branding / Badge for small screens */}
            <div className="mt-6 pt-5 border-t border-[#F0E6D8] dark:border-[#382317] lg:hidden flex items-center justify-between text-[11px] text-[#7C6E65] dark:text-[#A8988B]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-semibold text-[#5C381E] dark:text-[#E2B755]">VIST RESTAURANT</span>
              </div>
              <span>EST. 1996 • v2.4</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 text-center text-xs text-[#7C6E65] dark:text-[#9E8E81] mt-6">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C673B] dark:text-[#C5A059]" />
            <span>Authorized personnel only. All access attempts are logged and monitored.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
