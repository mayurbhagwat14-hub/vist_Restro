import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Search, Mic } from 'lucide-react';
import HeaderCartIcon from "../HeaderCartIcon";
import HeaderNotificationBell from "../HeaderNotificationBell";

const DEFAULT_PLACEHOLDERS = [
  'Search "Dal Makhani"',
  'Search "Dum Biryani"',
  'Search "Paneer Tikka"',
  'Search "Butter Naan"',
  'Search "Chinese Wok"',
  'Search "Thali Delights"',
  'Search "Mocktails & Coolers"',
  'Search "Gulab Jamun"',
];

export default function HomeHeader({
  activeTab,
  setActiveTab,
  location,
  savedAddressText,
  handleLocationClick,
  handleSearchFocus,
  placeholderIndex,
  placeholders,
  vegMode = false,
  handleVegModeChange
}) {
  const activePlaceholders = placeholders && placeholders.length > 0 ? placeholders : DEFAULT_PLACEHOLDERS;
  const [internalIndex, setInternalIndex] = useState(0);

  useEffect(() => {
    if (placeholderIndex !== undefined) return;
    const interval = setInterval(() => {
      setInternalIndex((prev) => (prev + 1) % activePlaceholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [placeholderIndex, activePlaceholders.length]);

  const currentPlaceholderIndex = placeholderIndex !== undefined ? placeholderIndex : internalIndex;

  // Extract human-friendly area/city for the centered location pill
  const displayLocation = useMemo(() => {
    const area = location?.area || location?.subLocality || location?.mainTitle || location?.neighborhood;
    const city = location?.city || "";

    if (area && typeof area === 'string' && !/^-?\d+(\.\d+)?$/.test(area.trim())) {
      const trimmed = area.trim();
      return trimmed.length > 14 ? `${trimmed.slice(0, 13)}…` : trimmed;
    }

    if (city && typeof city === 'string') {
      return city;
    }

    if (location?.address && location.address !== "Select location") {
      const parts = location.address.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 0 && !/^-?\d/.test(parts[0])) {
        return parts[0].length > 14 ? `${parts[0].slice(0, 13)}…` : parts[0];
      }
    }

    return "Indore";
  }, [location]);

  return (
    <div className="relative pt-3 pb-2.5 px-4 transition-all duration-300">
      {/* Concept 2 Row 1: Brand (Left) | Location (Center) | Actions (Right) */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Brand Crest & Wordmark */}
        <Link to="/food" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#C5A059]/40 shadow-xs bg-white shrink-0 p-0.5">
            <img
              src="/visit-crest-gold.jpg"
              alt="Visit Restaurant"
              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback to logo clean if crest image fails
                e.currentTarget.src = "/visit-logo-clean.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[15px] sm:text-[16px] font-black tracking-wider text-[#2C1810] leading-none uppercase">
              VISIT
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#C5A059] uppercase leading-none mt-1">
              EST. 1996
            </span>
          </div>
        </Link>

        {/* Center: Location Pill */}
        <div className="flex-1 flex justify-center px-1 min-w-0">
          <button
            type="button"
            onClick={handleLocationClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADBCE] shadow-xs active:scale-95 hover:border-[#C5A059]/60 transition-all max-w-[150px] sm:max-w-[190px] cursor-pointer"
            title="Change Location"
          >
            <MapPin className="h-3.5 w-3.5 text-[#C5A059] shrink-0 fill-[#C5A059]/20" />
            <span className="text-xs font-bold text-[#2C1810] truncate leading-none">
              {displayLocation}
            </span>
            <ChevronDown className="h-3 w-3 text-[#7C6E65] shrink-0" />
          </button>
        </div>

        {/* Right Actions: Notification Bell + Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <HeaderNotificationBell
            className="text-[#2C1810]"
            triggerClass="rounded-full h-9 w-9 bg-[#FFFDF9] border border-[#EADBCE] shadow-xs hover:border-[#C5A059]/60 text-[#2C1810]"
          />

          {/* Cart Icon */}
          <HeaderCartIcon
            className="h-9 w-9 flex items-center justify-center rounded-full bg-[#FFFDF9] border border-[#EADBCE] shadow-xs hover:border-[#C5A059]/60 cursor-pointer active:scale-90 transition-all text-[#2C1810]"
            iconClass="h-4 w-4 text-[#2C1810] group-hover:text-[#C5A059] transition-colors"
          />
        </div>
      </div>

      {/* Concept 2 Row 2: Sleek Dedicated Search Pill */}
      <div className="mt-3">
        <div
          className="relative bg-[#FFFDF9] rounded-full flex items-center px-4 py-2.5 shadow-xs border border-[#EADBCE] cursor-pointer active:scale-[0.99] hover:border-[#C5A059]/70 transition-all duration-200"
          onClick={handleSearchFocus}
        >
          <Search className="h-4 w-4 text-[#C5A059] mr-2.5 shrink-0" strokeWidth={2.5} />

          <div className="flex-1 overflow-hidden relative h-5">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPlaceholderIndex}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 text-xs sm:text-[13px] font-medium text-[#7C6E65] truncate flex items-center"
              >
                {activePlaceholders?.[currentPlaceholderIndex] || 'Search "burger"'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="h-4 w-[1px] bg-[#EADBCE] mx-2" />
          <Mic className="h-4 w-4 text-[#C5A059] shrink-0" />
        </div>
      </div>
    </div>
  );
}
