import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"
import AnimatedPage from "@food/components/user/AnimatedPage"
import apiClient, { authAPI } from "@food/api"
import { setAuthData as setUserAuthData, scheduleProactiveRefresh } from "@food/utils/auth"
import { motion } from "framer-motion"

const FULL_NAME_REGEX = /^[A-Za-z ]+$/

// Delicate Botanical Sprig (Left)
function BotanicalLeavesLeft({ className = "" }) {
  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M-10 10 C 20 40, 50 85, 80 145 C 95 175, 105 198, 115 215"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 28 50 C 46 42, 72 52, 80 68 C 66 78, 42 70, 28 50 Z"
        fill="#C4A882"
        fillOpacity="0.22"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 45 78 C 30 75, 12 88, 10 105 C 26 108, 42 96, 45 78 Z"
        fill="#C4A882"
        fillOpacity="0.18"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 64 108 C 86 100, 114 112, 120 130 C 102 140, 76 130, 64 108 Z"
        fill="#C4A882"
        fillOpacity="0.24"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 78 140 C 65 145, 48 162, 52 180 C 68 176, 80 160, 78 140 Z"
        fill="#C4A882"
        fillOpacity="0.18"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 98 175 C 116 172, 138 186, 142 202 C 126 210, 108 194, 98 175 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
    </svg>
  )
}

// Delicate Botanical Sprig (Right)
function BotanicalLeavesRight({ className = "" }) {
  return (
    <svg
      viewBox="0 0 160 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M 170 210 C 140 180, 110 135, 75 75 C 60 48, 50 25, 40 10"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 130 160 C 112 168, 88 158, 80 142 C 95 132, 118 140, 130 160 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 115 135 C 130 138, 148 125, 150 108 C 134 105, 118 117, 115 135 Z"
        fill="#C4A882"
        fillOpacity="0.18"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 95 105 C 75 112, 48 100, 42 82 C 60 72, 84 82, 95 105 Z"
        fill="#C4A882"
        fillOpacity="0.24"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 82 78 C 95 72, 112 55, 108 38 C 92 40, 80 58, 82 78 Z"
        fill="#C4A882"
        fillOpacity="0.18"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 60 45 C 45 46, 22 32, 18 16 C 34 10, 52 24, 60 45 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function OTP() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const redirectTo = searchParams.get("redirect") || "/food/user"

  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [authData, setAuthData] = useState(null)
  const [showNameInput, setShowNameInput] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState("")
  const [verifiedData, setVerifiedData] = useState(null)
  const [contactInfo, setContactInfo] = useState("")
  const inputRefs = useRef([])
  const submittingRef = useRef(false)

  useEffect(() => {
    // Redirect to home if already authenticated
    const isAuthenticated = localStorage.getItem("user_authenticated") === "true"
    if (isAuthenticated) {
      navigate("/food/user", { replace: true })
      return
    }

    const stored = sessionStorage.getItem("userAuthData")
    if (!stored) {
      navigate("/food/user/auth/login", { replace: true })
      return
    }
    const data = JSON.parse(stored)
    setAuthData(data)

    if (data.phone) {
      const phoneDigits = String(data.phone || "").replace(/^\+91\s*/, "")
      setContactInfo(`+91 ${phoneDigits}`)
    } else if (data.email) {
      setContactInfo(data.email)
    }

    setResendTimer(60)
  }, [navigate])

  useEffect(() => {
    let timer
    if (resendTimer > 0) {
      timer = setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [resendTimer > 0])

  useEffect(() => {
    if (inputRefs.current[0] && !showNameInput) {
      inputRefs.current[0].focus()
    }
  }, [showNameInput])

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    if (!showNameInput && newOtp.slice(0, 4).every((digit) => digit !== "")) {
      handleVerify(newOtp.slice(0, 4).join(""))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
      }
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    const digits = pastedData.replace(/\D/g, "").slice(0, 4).split("")
    const newOtp = [...otp]
    digits.forEach((digit, i) => {
      if (i < 4) newOtp[i] = digit
    })
    setOtp(newOtp)
    if (!showNameInput && digits.length === 4) {
      handleVerify(newOtp.slice(0, 4).join(""))
    } else {
      inputRefs.current[Math.min(digits.length, 3)]?.focus()
    }
  }

  const handleVerify = async (otpValue = null) => {
    if (showNameInput) return
    if (submittingRef.current) return

    const code = (otpValue || otp.join("")).replace(/\D/g, "")
    const code4 = code.slice(0, 4)
    if (code4.length !== 4) {
      setError("Please enter all 4 digits")
      return
    }

    submittingRef.current = true
    setIsLoading(true)
    setError("")

    try {
      const phone = authData?.method === "phone" ? authData.phone : null
      const email = authData?.method === "email" ? authData.email : null
      const purpose = authData?.isSignUp ? "register" : "login"
      const providedName = authData?.isSignUp ? authData?.name || null : null
      const referralCode = authData?.referralCode ? String(authData.referralCode).trim().toUpperCase() : null

      let fcmToken = null
      let platform = "web"
      try {
        if (typeof window !== "undefined") {
          fcmToken = localStorage.getItem("fcm_web_registered_token_user") || null
        }
      } catch (e) {
        console.warn("FCM error:", e)
      }

      const response = await authAPI.verifyOTP(
        phone,
        code4,
        purpose,
        providedName,
        email,
        "user",
        null,
        referralCode,
        fcmToken,
        platform
      )

      const data = response?.data?.data || response?.data || {}
      const accessToken = data.accessToken
      const refreshToken = data.refreshToken ?? null
      const user = data.user

      if (!accessToken || !user || !refreshToken) {
        throw new Error("Invalid response from server")
      }

      const hasName = user.name && String(user.name).trim().length > 0 && String(user.name).toLowerCase() !== "null"
      const needsName = data.isNewUser === true || !hasName

      if (needsName) {
        setVerifiedData(data)
        setShowNameInput(true)
        setIsLoading(false)
        submittingRef.current = false
        return
      }

      setUserAuthData("user", accessToken, user, refreshToken)
      scheduleProactiveRefresh("user")
      window.dispatchEvent(new Event("userAuthChanged"))

      sessionStorage.removeItem("userAuthData")
      setSuccess(true)
      setTimeout(() => navigate(redirectTo, { replace: true }), 400)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid OTP. Please check the code and try again."
      setError(message)
      setOtp(["", "", "", ""])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  const handleSaveName = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError("Please enter your name")
      return
    }
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }
    if (!FULL_NAME_REGEX.test(trimmed)) {
      setNameError("Name can only contain letters and spaces")
      return
    }

    setNameError("")
    setIsLoading(true)

    try {
      const accessToken = verifiedData.accessToken
      const refreshToken = verifiedData.refreshToken ?? null
      const user = verifiedData.user
      const normalizedName = trimmed.replace(/\s+/g, " ")

      await apiClient.put(
        "/auth/profile",
        { name: normalizedName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      setUserAuthData("user", accessToken, { ...user, name: normalizedName }, refreshToken)
      scheduleProactiveRefresh("user")
      window.dispatchEvent(new Event("userAuthChanged"))
      setSuccess(true)
      setTimeout(() => navigate(redirectTo, { replace: true }), 400)
    } catch (err) {
      setError("Failed to save name. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || isLoading) return
    setIsLoading(true)
    setError("")
    try {
      const phone = authData?.method === "phone" ? authData.phone : null
      const email = authData?.method === "email" ? authData.email : null
      const purpose = authData?.isSignUp ? "register" : "login"
      await authAPI.sendOTP(phone, purpose, email)
      setResendTimer(60)
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
    setOtp(["", "", "", ""])
  }

  return (
    <AnimatedPage className="min-h-[100dvh] w-full bg-[#F6EBD7] flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-[#6E3B13]/20 selection:text-[#3B2213]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
        html, body {
          background-color: #F6EBD7 !important;
        }
      `}</style>

      {/* Main Container - Responsive Mobile Canvas */}
      <main className="w-full max-w-[420px] min-h-[100dvh] bg-[#F6EBD7] flex flex-col relative shadow-[0_0_50px_rgba(59,34,19,0.06)] pb-8 overflow-hidden">

        {/* 1. Restaurant Building Photograph with Ambient Lighting */}
        <div className="relative w-full h-[290px] sm:h-[320px] shrink-0 overflow-hidden bg-[#24150A]">
          <img
            src="/visit-building.png"
            alt="VISIT Restaurant"
            className="w-full h-full object-cover object-[center_68%] scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />

          {/* Top Left Return Button */}
          <button
            type="button"
            onClick={() => navigate("/food/user/auth/login")}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer shadow-md"
            title="Back to login"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Elegant Diagonal S-Curve Wave matching Image 1 */}
          <div className="absolute -bottom-[1px] left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
            <svg
              viewBox="0 0 1000 160"
              preserveAspectRatio="none"
              className="w-full h-[70px] sm:h-[82px] block text-[#F6EBD7] fill-current"
            >
              <path d="M 0,38 C 220,68 440,128 780,145 C 890,150 960,147 1000,144 L 1000,160 L 0,160 Z" />
            </svg>
          </div>
        </div>

        {/* 2. Main OTP Content Section */}
        <div className="flex-1 flex flex-col items-center px-6 sm:px-7 relative z-20 -mt-6">

          {/* Delicate Botanical Illustrations */}
          <BotanicalLeavesLeft className="absolute -left-3 top-0 w-32 h-52 sm:w-36 sm:h-56 z-0 opacity-70" />
          <BotanicalLeavesRight className="absolute -right-3 top-36 w-32 h-52 sm:w-36 sm:h-56 z-0 opacity-70" />
          <BotanicalLeavesRight className="absolute -right-3 bottom-0 w-28 h-44 sm:w-32 sm:h-48 z-0 opacity-55" />

          {/* VISIT RESTAURANT Logo Emblem Badge */}
          <div className="relative z-10 mb-2 select-none flex justify-center">
            <img
              src="/visit-logo.png"
              alt="VISIT RESTAURANT EST. 1996"
              className="w-[145px] h-[145px] sm:w-[160px] sm:h-[160px] object-contain drop-shadow-[0_8px_18px_rgba(74,44,17,0.08)]"
            />
          </div>

          {!showNameInput ? (
            <>
              {/* Heading — Clean, elegant modern Outfit typography */}
              <h1
                style={{
                  fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  color: "#4A2E18",
                  fontWeight: 600,
                  letterSpacing: "-0.015em",
                }}
                className="text-[25px] sm:text-[27px] leading-tight mb-2 text-center select-none"
              >
                Verify Your Number
              </h1>

              {/* Subtitle with Number Badge and Edit Button */}
              <p className="text-xs sm:text-[13px] text-[#7E6C5E] text-center max-w-[280px] sm:max-w-[320px] mb-2 leading-relaxed select-none">
                Enter the 4-digit code sent to
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8DEC8] text-xs font-semibold text-[#3E2211] mb-6 shadow-sm">
                <span>{contactInfo || "your phone number"}</span>
                <button
                  type="button"
                  onClick={() => navigate("/food/user/auth/login")}
                  className="text-[#7A4B1F] underline text-[11px] font-medium hover:text-[#5E3411] cursor-pointer ml-1"
                >
                  Change
                </button>
              </div>

              {/* 4 Digit OTP Inputs */}
              <div className="flex justify-center gap-3 sm:gap-4 mb-4 relative z-10">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-13 h-14 sm:w-15 sm:h-16 text-center text-2xl font-bold rounded-[18px] bg-[#FFFFFF] border transition-all outline-none text-[#2E180C] shadow-[0_2px_10px_rgba(74,44,17,0.04)] ${
                      digit
                        ? "border-[#7A4B1F] ring-2 ring-[#7A4B1F]/20"
                        : "border-[#E8DEC8] focus:border-[#7A4B1F] focus:ring-2 focus:ring-[#7A4B1F]/20"
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 mb-3"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Success Feedback */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 mb-3"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verified! Opening VISIT Restaurant...</span>
                </motion.div>
              )}

              {/* Resend OTP Row */}
              <div className="text-center text-xs text-[#7E6C5E] mb-5 relative z-10">
                {resendTimer > 0 ? (
                  <span>
                    Resend code in{" "}
                    <span className="font-semibold text-[#5E3411]">
                      00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-semibold text-[#5E3411] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                )}
              </div>

              {/* Verify & Continue Button */}
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full h-[54px] sm:h-[58px] rounded-full sm:rounded-[26px] text-white font-semibold text-[15.5px] tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
                style={{
                  background: "linear-gradient(180deg, #6E3B13 0%, #522807 100%)",
                  boxShadow: "0 8px 22px rgba(82, 40, 7, 0.28)",
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </>
          ) : (
            /* First Time User: Enter Name */
            <form onSubmit={handleSaveName} className="w-full relative z-10 space-y-4">
              <h2 className="font-editorial text-[24px] font-bold text-[#3E2211] text-center mb-1">
                Welcome to VISIT!
              </h2>
              <p className="text-xs text-[#7E6C5E] text-center mb-4">
                Please enter your name so we can personalize your experience.
              </p>

              <div className="w-full bg-[#FFFFFF] border border-[#E8DEC8] focus-within:border-[#7A4B1F] focus-within:ring-2 focus-within:ring-[#7A4B1F]/15 rounded-[22px] px-4 py-3.5 shadow-sm">
                <label className="block text-[10.5px] font-medium text-[#8F7C6B] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setNameError("")
                  }}
                  className="w-full bg-transparent border-none p-0 outline-none font-semibold text-base text-[#2E180C] placeholder-[#B5A698] focus:ring-0"
                  autoFocus
                />
              </div>

              {nameError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 pl-2">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{nameError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full h-[52px] sm:h-[56px] rounded-[22px] text-white font-semibold text-[15.5px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-[0_10px_25px_rgba(94,52,17,0.28)] hover:shadow-[0_12px_28px_rgba(94,52,17,0.36)] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                style={{
                  background: "linear-gradient(180deg, #7A4B1F 0%, #5E3411 100%)",
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>
    </AnimatedPage>
  )
}
