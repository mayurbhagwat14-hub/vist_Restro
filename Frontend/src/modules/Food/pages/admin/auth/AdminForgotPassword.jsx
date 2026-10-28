import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  ChefHat,
  BarChart3,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import quickSpicyLogo from "@food/assets/vist-logo.png"
import { adminAPI } from "@food/api"
import { useCompanyName } from "@food/hooks/useCompanyName"
import { loadBusinessSettings } from "@food/utils/businessSettings"

export default function AdminForgotPassword() {
  const companyName = useCompanyName()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const [logoUrl, setLogoUrl] = useState("/visit-crest-gold.jpg")
  const inputRefs = useRef(Array(6).fill(null).map(() => null))

  // Fetch business settings logo on mount
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await loadBusinessSettings()
        if (settings?.logo?.url) {
          setLogoUrl(settings.logo.url)
        }
      } catch (error) {
        // Silently fail
      }
    }
    fetchLogo()

    const handleSettingsUpdate = async () => {
      const settings = await loadBusinessSettings()
      if (settings?.logo?.url) {
        setLogoUrl(settings.logo.url)
      }
    }
    window.addEventListener("businessSettingsUpdated", handleSettingsUpdate)
    return () => window.removeEventListener("businessSettingsUpdated", handleSettingsUpdate)
  }, [])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Email is required")
      return
    }

    setIsLoading(true)
    try {
      await adminAPI.requestForgotPasswordOtp(trimmedEmail)
      setEmail(trimmedEmail)
      setStep(2)
      setResendTimer(60)
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "This email is not registered as an admin account or something went wrong."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("")
    const newOtp = [...otp]
    digits.forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit
      }
    })
    setOtp(newOtp)
    if (digits.length === 6) {
      inputRefs.current[5]?.focus()
    } else {
      inputRefs.current[digits.length]?.focus()
    }
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code")
      return
    }
    setStep(3)
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    setIsLoading(true)
    setError("")
    try {
      await adminAPI.requestForgotPasswordOtp(email)
      setResendTimer(60)
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to resend code. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await adminAPI.resetPasswordWithOtp(email, otp.join(""), newPassword)

      navigate("/admin/login", {
        state: { message: "Password reset successfully. Please login with your new credentials." },
      })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to reset password. Please try again."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF5ED] dark:bg-[#120B07] text-[#2C1810] dark:text-[#FAF5ED] selection:bg-[#C5A059]/30">
      {/* LEFT COLUMN: Cinematic Showcase */}
      <div className="relative hidden lg:flex lg:w-[48%] xl:w-[52%] flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#160B07]">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/vist-admin-desk.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140A06] via-[#1A0F0A]/85 to-[#160B07]/75 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,10,6,0.9)_100%)]" />

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C5A059]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8C673B]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Brand Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#24140D]/80 border border-[#C5A059]/30 backdrop-blur-md shadow-lg shadow-black/20">
            <Sparkles className="w-3.5 h-3.5 text-[#E2B755]" />
            <span className="text-[11px] font-bold tracking-widest text-[#E2B755] uppercase">
              EST. 1996 • SECURE RECOVERY
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono tracking-wider text-[#EADBCE]/60 uppercase">
              ACCESS PORTAL
            </span>
          </div>
        </div>

        {/* Center Editorial Content */}
        <div className="relative z-10 my-auto py-8 max-w-xl">
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
                {companyName || "VISIT RESTAURANT"}
              </p>
              <p className="text-[11px] text-[#E2B755] font-semibold tracking-widest uppercase mt-1">
                Account Recovery Gateway
              </p>
            </div>
          </div>

          <h1 className="font-serif text-3xl xl:text-5xl font-bold text-[#FDFBF7] leading-[1.18] tracking-tight drop-shadow-md">
            Restoring Executive Access with Confidence.
          </h1>

          <p className="text-sm xl:text-base text-[#EADBCE]/85 mt-4 leading-relaxed max-w-lg">
            Verify your authorized administrative email to safely receive a temporary one-time security code and reset your management credentials.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Email OTP</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Instant dispatch</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Encrypted Token</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Time-limited safety</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#24140D]/70 border border-[#C5A059]/20 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-[#C5A059]/15 flex items-center justify-center text-[#E2B755] mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-[#FDFBF7] leading-snug">Audit Logged</p>
              <p className="text-[10px] text-[#EADBCE]/70 mt-0.5 leading-tight">Admin monitoring</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Notice */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#C5A059]/20 text-[11px] text-[#EADBCE]/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
            <span>256-Bit SSL Encrypted Admin Gateway</span>
          </div>
          <span>© 2026 VIST Restro. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Recovery Form */}
      <div className="w-full lg:w-[52%] xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#5C381E]/8 rounded-full blur-3xl pointer-events-none" />

        {/* Top Action Bar */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/admin/login")}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C381E] hover:text-[#2C1810] dark:text-[#E2B755] dark:hover:text-[#F3D78E] py-2 px-3.5 rounded-full border border-[#DBC8B2] dark:border-[#4A3222] bg-white/80 dark:bg-[#1E130D]/80 hover:bg-white dark:hover:bg-[#2A1A12] backdrop-blur-sm transition-all shadow-xs cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Login</span>
          </button>

          {/* Step Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF5ED] dark:bg-[#251810] border border-[#DBC8B2] dark:border-[#4A3222] text-[11px] font-semibold text-[#5C381E] dark:text-[#E2B755]">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* Center Recovery Card */}
        <div className="relative z-10 w-full max-w-md mx-auto my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="rounded-3xl bg-white/90 dark:bg-[#1C120C]/90 backdrop-blur-xl border border-[#EADBCE] dark:border-[#4A3222] shadow-[0_20px_60px_rgba(92,56,30,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-7 sm:p-9"
          >
            {/* Header */}
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
                  Password Recovery
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C1810] dark:text-[#FAF5ED] leading-tight">
                  {step === 1 && "Forgot Password"}
                  {step === 2 && "Verify Security Code"}
                  {step === 3 && "Create New Password"}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-[#C2B2A3] mb-6">
              {step === 1 && "Enter your registered admin email address. We will transmit a 6-digit verification code."}
              {step === 2 && `Enter the 6-digit verification code sent to ${email}`}
              {step === 3 && "Choose a strong new password for your admin account (at least 6 characters)."}
            </p>

            {/* Error Message */}
            <AnimatePresence mode="wait">
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

            {/* Step 1: Email Form */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block">
                    Admin Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C673B] dark:text-[#C5A059] group-focus-within:text-[#5C381E] dark:group-focus-within:text-[#E2B755] transition-colors pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2C1810] via-[#5C381E] to-[#2C1810] hover:from-[#3D2217] hover:via-[#6E4426] hover:to-[#3D2217] text-white font-semibold text-sm shadow-md hover:shadow-xl shadow-[#5C381E]/20 transition-all duration-300 border border-[#C5A059]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E2B755]" />
                        <span>Sending verification code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Security Code</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block text-center mb-3">
                    6-Digit Security Code
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          if (inputRefs.current) {
                            inputRefs.current[index] = el
                          }
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="h-12 w-11 sm:h-13 sm:w-12 text-center text-xl font-bold rounded-xl border border-[#DBC8B2] dark:border-[#4A3222] bg-white dark:bg-[#1E130D] text-[#2C1810] dark:text-[#FAF5ED] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/20 transition-all shadow-xs"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-[#8C673B] hover:text-[#5C381E] dark:text-[#C5A059] dark:hover:text-[#E2B755] font-medium transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-[#5C381E] dark:text-[#E2B755] font-semibold hover:underline disabled:text-[#A8988B] disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2C1810] via-[#5C381E] to-[#2C1810] hover:from-[#3D2217] hover:via-[#6E4426] hover:to-[#3D2217] text-white font-semibold text-sm shadow-md hover:shadow-xl shadow-[#5C381E]/20 transition-all duration-300 border border-[#C5A059]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E2B755]" />
                      <span>Verifying code...</span>
                    </>
                  ) : (
                    <span>Continue to New Password</span>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block">
                    New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C673B] dark:text-[#C5A059] group-focus-within:text-[#5C381E] dark:group-focus-within:text-[#E2B755] transition-colors pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-11 py-3 text-sm bg-white dark:bg-[#1E130D] border border-[#DBC8B2] dark:border-[#4A3222] rounded-xl text-[#2C1810] dark:text-[#FAF5ED] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 transition-all shadow-xs disabled:opacity-60 [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C673B] hover:text-[#2C1810] dark:text-[#C5A059] dark:hover:text-[#FAF5ED] transition-colors rounded-md focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4A3022] dark:text-[#DBC8B2] tracking-wider uppercase block">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C673B] dark:text-[#C5A059] group-focus-within:text-[#5C381E] dark:group-focus-within:text-[#E2B755] transition-colors pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-11 py-3 text-sm bg-white dark:bg-[#1E130D] border border-[#DBC8B2] dark:border-[#4A3222] rounded-xl text-[#2C1810] dark:text-[#FAF5ED] placeholder:text-[#A8988B] focus:outline-none focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/15 transition-all shadow-xs disabled:opacity-60 [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C673B] hover:text-[#2C1810] dark:text-[#C5A059] dark:hover:text-[#FAF5ED] transition-colors rounded-md focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#2C1810] via-[#5C381E] to-[#2C1810] hover:from-[#3D2217] hover:via-[#6E4426] hover:to-[#3D2217] text-white font-semibold text-sm shadow-md hover:shadow-xl shadow-[#5C381E]/20 transition-all duration-300 border border-[#C5A059]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#E2B755]" />
                        <span>Updating credentials...</span>
                      </>
                    ) : (
                      <span>Reset Password & Sign In</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Bottom Security Footer */}
        <div className="relative z-10 text-center text-xs text-[#7C6E65] dark:text-[#9E8E81] mt-6">
          <p className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8C673B] dark:text-[#C5A059]" />
            <span>Authorized personnel only. All recovery requests are logged and monitored.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
