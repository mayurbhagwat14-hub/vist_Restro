import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeritageHeroBanner({ onExploreClick }) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      navigate("/food/user/categories");
    }
  };

  return (
    <div className="px-4 md:px-0 py-2">
      <div
        onClick={handleAction}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#2C1810] via-[#24130C] to-[#160B07] border border-[#C5A059]/40 shadow-md cursor-pointer group transition-all duration-300 hover:shadow-xl"
      >
        {/* Subtle Warm Amber Spotlight in Background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-[#3B7A27]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between p-4 sm:p-6 min-h-[150px] sm:min-h-[175px]">
          {/* Left Text Content */}
          <div className="flex-1 pr-3 max-w-[62%] sm:max-w-[65%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 mb-2">
              <Sparkles className="w-3 h-3 text-[#E2B755]" />
              <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#E2B755] uppercase">
                EST. 1996 • 28+ YEARS
              </span>
            </div>

            <h2 className="font-serif text-base sm:text-xl lg:text-2xl font-bold text-[#FDFBF7] leading-tight tracking-tight drop-shadow-sm">
              Serving same signature taste since 1996
            </h2>

            <p className="text-[11px] sm:text-xs text-[#EADBCE]/80 mt-1 line-clamp-1">
              Pure authentic recipes crafted with heritage flavours
            </p>

            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#E2B755] group-hover:text-[#F3D78E] group-hover:translate-x-1 transition-all">
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Right Featured Dish Graphic with warm glow */}
          <div className="relative shrink-0 w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
            {/* Soft radial glow under food */}
            <div className="absolute inset-2 bg-gradient-to-tr from-[#C5A059]/30 to-amber-600/30 rounded-full blur-md" />
            <img
              src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80"
              alt="Signature Visit Dish"
              className="relative z-10 w-full h-full object-cover rounded-full border-2 border-[#C5A059]/40 shadow-lg transform group-hover:scale-105 group-hover:rotate-2 transition-transform duration-500"
              loading="eager"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

