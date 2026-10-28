import React from "react";
import { Leaf, MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CuisineChipsRow({
  categories = [],
  vegMode = false,
  onVegModeToggle,
  onCuisineSelect,
}) {
  const navigate = useNavigate();

  // Show up to 6 admin categories alongside Pure Veg and More
  const displayItems = categories && categories.length > 0 ? categories.slice(0, 7) : [];

  return (
    <div className="px-4 md:px-0 py-2.5">
      <div className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
        {/* 1. Pure Veg Toggle Chip */}
        <button
          type="button"
          onClick={() => onVegModeToggle?.(!vegMode)}
          className="flex flex-col items-center gap-1.5 shrink-0 w-[64px] sm:w-[72px] cursor-pointer group active:scale-95 transition-all text-center"
        >
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-xs ${
              vegMode
                ? "bg-[#3B7A27] border-[#2E6822] text-white shadow-md shadow-[#3B7A27]/30 scale-105"
                : "bg-[#FAF5ED] border-[#EADBCE] text-[#3B7A27] group-hover:border-[#3B7A27]/60 group-hover:bg-[#F2ECE1]"
            }`}
          >
            <Leaf
              className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                vegMode ? "text-white fill-white/20" : "text-[#3B7A27] fill-[#3B7A27]/20"
              }`}
              strokeWidth={2.4}
            />
          </div>
          <span
            className={`text-[11px] sm:text-xs leading-tight truncate w-full ${
              vegMode ? "text-[#3B7A27] font-bold" : "text-[#2C1810] font-semibold group-hover:text-[#3B7A27]"
            }`}
          >
            Pure Veg
          </span>
        </button>

        {/* 2. Dynamic Categories from Admin */}
        {displayItems.map((cat, index) => {
          const catImage = cat.image || cat.imageUrl;
          const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/\s+/g, "-") : "");

          return (
            <button
              key={cat.id || cat._id || index}
              type="button"
              onClick={() => {
                if (onCuisineSelect) {
                  onCuisineSelect(cat);
                } else {
                  navigate(`/food/user/category/${slug}`);
                }
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[64px] sm:w-[72px] cursor-pointer group active:scale-95 transition-all text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden p-0.5 border-2 border-[#EADBCE] bg-[#FAF5ED] shadow-xs group-hover:border-[#C5A059] group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                {catImage ? (
                  <img
                    src={catImage}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full pointer-events-none"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.classList.add("fallback-icon");
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#F5EFE6] flex items-center justify-center text-[#C5A059]">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-[#2C1810] group-hover:text-[#C5A059] leading-tight line-clamp-1 w-full truncate">
                {cat.name}
              </span>
            </button>
          );
        })}

        {/* 3. "More" / "View All" Chip */}
        <button
          type="button"
          onClick={() => navigate("/food/user/categories")}
          className="flex flex-col items-center gap-1.5 shrink-0 w-[64px] sm:w-[72px] cursor-pointer group active:scale-95 transition-all text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-2 border-[#EADBCE] bg-[#FAF5ED] text-[#7C6E65] shadow-xs group-hover:border-[#C5A059] group-hover:text-[#C5A059] group-hover:bg-[#F2ECE1] transition-all duration-300">
            <MoreHorizontal className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#7C6E65] group-hover:text-[#C5A059] leading-tight truncate w-full">
            More
          </span>
        </button>
      </div>
    </div>
  );
}
