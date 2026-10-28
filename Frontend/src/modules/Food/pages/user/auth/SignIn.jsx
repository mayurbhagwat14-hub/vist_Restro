import { useState, useEffect, useRef } from "react"
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"
import { Smartphone, ArrowRight, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import AnimatedPage from "@food/components/user/AnimatedPage"
import { authAPI } from "@food/api"
import { motion } from "framer-motion"
import { isModuleAuthenticated } from "@food/utils/auth"

// Delicate Botanical Sprig (Left) matching reference
function BotanicalLeavesLeft({ className = "" }) {
  return (
    <svg
      viewBox="0 0 160 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M-15 15 C 20 45, 55 95, 82 165 C 95 195, 105 225, 112 250"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 28 50 C 48 40, 74 52, 82 70 C 66 80, 42 72, 28 50 Z"
        fill="#C4A882"
        fillOpacity="0.25"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 45 82 C 28 78, 10 92, 8 110 C 25 114, 42 102, 45 82 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 66 115 C 88 106, 118 118, 124 138 C 104 148, 78 138, 66 115 Z"
        fill="#C4A882"
        fillOpacity="0.27"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 80 152 C 65 158, 48 178, 52 196 C 70 192, 82 174, 80 152 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 98 190 C 118 186, 142 202, 146 220 C 128 228, 108 210, 98 190 Z"
        fill="#C4A882"
        fillOpacity="0.22"
        stroke="#B8976E"
        strokeWidth="1"
      />
    </svg>
  )
}

// Delicate Botanical Sprig (Right) matching reference
function BotanicalLeavesRight({ className = "" }) {
  return (
    <svg
      viewBox="0 0 160 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <path
        d="M 175 250 C 145 210, 110 155, 75 85 C 58 52, 46 25, 35 10"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 132 180 C 112 190, 86 178, 78 160 C 95 148, 120 158, 132 180 Z"
        fill="#C4A882"
        fillOpacity="0.22"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 115 148 C 132 152, 152 138, 154 118 C 136 114, 118 128, 115 148 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 95 112 C 72 120, 44 106, 38 86 C 58 74, 84 86, 95 112 Z"
        fill="#C4A882"
        fillOpacity="0.26"
        stroke="#B8976E"
        strokeWidth="1.1"
      />
      <path
        d="M 78 82 C 92 75, 110 56, 106 38 C 90 40, 76 60, 78 82 Z"
        fill="#C4A882"
        fillOpacity="0.2"
        stroke="#B8976E"
        strokeWidth="1"
      />
      <path
        d="M 55 46 C 38 48, 16 32, 12 15 C 30 8, 48 24, 55 46 Z"
        fill="#C4A882"
        fillOpacity="0.22"
        stroke="#B8976E"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const submittingRef = useRef(false)

  // Redirect if already genuinely logged in
  useEffect(() => {
    if (isModuleAuthenticated("user")) {
      const redirect = searchParams.get("redirect") || location.state?.from || "/food/user"
      navigate(redirect, { replace: true })
    } else {
      // Clear legacy stale boolean flag
      localStorage.removeItem("user_authenticated")
    }
  }, [navigate, searchParams, location.state])

  const validatePhone = (num) => {
    const clean = num.replace(/\D/g, "")
    if (!clean) return "Mobile number is required"
    if (clean.length !== 10) return "Mobile number must be 10 digits"
    if (!/^[6-9]/.test(clean)) return "Enter a valid mobile number starting with 6, 7, 8, or 9"
    return ""
  }

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10)
    setPhone(val)
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    const pError = validatePhone(phone)
    if (pError) {
      setError(pError)
      return
    }

    if (submittingRef.current) return
    submittingRef.current = true
    setIsLoading(true)
    setError("")

    const fullPhone = `+91 ${phone}`

    // Send OTP and navigate to separate OTP screen
    try {
      await authAPI.sendOTP(fullPhone, "login", null)

      const queryRef = searchParams.get("ref") || searchParams.get("referral")
      const authData = {
        method: "phone",
        phone: fullPhone,
        email: null,
        name: null,
        referralCode: queryRef ? String(queryRef).toUpperCase() : null,
        isSignUp: false,
        module: "user",
      }
      sessionStorage.setItem("userAuthData", JSON.stringify(authData))
      const redirect = searchParams.get("redirect") || location.state?.from || ""
      navigate(`/food/user/auth/otp${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`)
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        "Failed to send OTP. Please check your number and try again."
      setError(message)
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <AnimatedPage className="min-h-[100dvh] w-full bg-[#F6EBD7] flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-[#6E3B13]/20 selection:text-[#3B2213]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
        html, body {
          background-color: #F6EBD7 !important;
        }
        .welcome-back-heading {
          font-family: 'Playfair Display', 'Cormorant Garamond', Georgia, 'Times New Roman', serif !important;
          color: #3D210F !important;
          font-weight: 600 !important;
          font-style: normal !important;
          letter-spacing: 0.01em !important;
        }
      `}</style>

      {/* Main Container - Edge to Edge, No Side Gaps */}
      <main className="w-full max-w-[460px] min-h-[100dvh] bg-[#F6EBD7] flex flex-col relative overflow-hidden">

        {/* 1. Top Restaurant Building Photo */}
        <div className="relative w-full shrink-0 overflow-hidden bg-[#F6EBD7]">
          {/* Back to Home Button */}
          <button
            type="button"
            onClick={() => navigate("/food/user")}
            className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer shadow-md"
            title="Back to home"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>

          <img
            src="/image%20copy.png"
            alt="VISIT Restaurant"
            className="w-full h-auto block select-none pointer-events-none"
          />
        </div>

        {/* 2. Content Section — Shifted down into clean cream area */}
        <div className="flex-1 flex flex-col px-7 relative z-20 -mt-6 sm:-mt-8 pb-8">

          {/* Botanical Leaf Decorations */}
          <BotanicalLeavesLeft className="absolute -left-4 top-8 w-28 h-44 sm:w-32 sm:h-48 z-0 opacity-60" />
          <BotanicalLeavesRight className="absolute -right-4 top-2 w-28 h-44 sm:w-32 sm:h-48 z-0 opacity-60" />
          <BotanicalLeavesLeft className="absolute -left-6 bottom-4 w-24 h-38 sm:w-28 sm:h-42 z-0 opacity-40" />

          {/* VISIT RESTAURANT Logo — Pure Transparent Emblem, centered, overlapping wave */}
          <div className="relative z-10 mb-3 select-none flex justify-center">
            <img
              src="/visit-logo.png?v=3"
              alt="VISIT RESTAURANT EST. 1996"
              className="w-[140px] h-[130px] sm:w-[155px] sm:h-[145px] object-contain drop-shadow-[0_4px_14px_rgba(74,44,17,0.12)]"
            />
          </div>

          {/* Welcome Back Heading — Upright Serif, matching reference media_1793177007444.png */}
          <h1
            className="welcome-back-heading font-serif-editorial text-[28px] sm:text-[30px] leading-tight mb-2 text-left select-none relative z-10"
          >
            Welcome Back
          </h1>

          {/* Subtitle — LEFT aligned, proper Outfit font */}
          <p
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-[13.5px] sm:text-[14px] text-[#7E6D5E] text-left mb-5 leading-[1.55] select-none relative z-10"
          >
            Log in to your account and enjoy delicious food, great restaurants and exclusive offers.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full relative z-10 space-y-4">

            {/* Input: Enter Mobile Number — clean single-line like reference */}
            <div className="w-full h-[54px] sm:h-[56px] bg-[#FFFFFF] border border-[#E5DDD0] rounded-full px-5 flex items-center gap-3 shadow-[0_2px_8px_rgba(74,44,17,0.04)] focus-within:border-[#6E3B13] focus-within:ring-2 focus-within:ring-[#6E3B13]/12 transition-all">
              <Smartphone className="w-[18px] h-[18px] text-[#8E7B6B] shrink-0" strokeWidth={1.8} />
              <input
                id="mobile-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={handlePhoneChange}
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="w-full bg-transparent border-none p-0 outline-none font-medium text-[14.5px] sm:text-[15px] tracking-wide placeholder-[#B0A294] text-[#3B2213] focus:ring-0"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 pl-4"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Continue Button — matching reference */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading || phone.length !== 10}
              className="w-full h-[54px] sm:h-[56px] rounded-full text-white font-semibold text-[15.5px] tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50"
              style={{
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(180deg, #6E3B13 0%, #522807 100%)",
                boxShadow: "0 8px 22px rgba(82, 40, 7, 0.28)",
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Sending OTP...</span>
                </div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer: Don't have an account? Sign Up */}
          <div
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="mt-5 text-center text-[13px] text-[#7E6D5E] relative z-10 select-none"
          >
            <span>Don't have an account?  </span>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("mobile-input")
                el?.focus()
              }}
              className="font-bold text-[#522807] hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>

        </div>
      </main>
    </AnimatedPage>
  )
}
