import { ArrowLeft, Bike } from "lucide-react"
import { BotanicalLeavesLeft, BotanicalLeavesRight } from "@delivery/components/VistAuthDecor"

/**
 * VISIT-branded header for the delivery partner auth / onboarding screens
 * (same hotel photo, wave, logo and serif heading as the customer login).
 *
 * compact: smaller photo + logo for long forms (signup details, documents).
 */
export default function VistAuthHero({ title, subtitle, onBack, compact = false, badge = "Delivery Partner" }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        .vist-auth-heading {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif !important;
          color: #3D210F !important;
          font-weight: 600 !important;
          letter-spacing: 0.01em !important;
        }
      `}</style>

      <div className={`relative w-full shrink-0 overflow-hidden bg-[#F6EBD7] ${compact ? "max-h-[230px]" : ""}`}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all cursor-pointer shadow-md"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}
        <img
          src="/hotel-visit-login.jpg?v=2"
          alt="Hotel VISIT"
          className={`w-full block select-none pointer-events-none ${compact ? "h-[230px] object-cover object-[50%_40%]" : "h-auto"}`}
        />
      </div>

      <div className="relative z-20 px-6 mt-4">
        <BotanicalLeavesLeft className="absolute -left-4 top-2 w-24 h-40 z-0 opacity-50" />
        <BotanicalLeavesRight className="absolute -right-4 -top-2 w-24 h-40 z-0 opacity-50" />

        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/visit-logo.png?v=3"
            alt="VISIT RESTAURANT EST. 1996"
            className={`${compact ? "w-[92px] h-[86px]" : "w-[140px] h-[130px]"} object-contain drop-shadow-[0_4px_14px_rgba(74,44,17,0.12)] select-none`}
          />
          {badge && (
            <span
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DEC8] text-[11px] font-semibold tracking-wider uppercase text-[#6E3B13] shadow-sm"
            >
              <Bike className="w-3.5 h-3.5" strokeWidth={2} />
              {badge}
            </span>
          )}
          {title && (
            <h1 className="vist-auth-heading text-[26px] leading-tight mt-3 text-center select-none">{title}</h1>
          )}
          {subtitle && (
            <p
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-[13.5px] text-[#7E6D5E] text-center mt-1.5 leading-relaxed max-w-[320px] select-none"
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </>
  )
}
