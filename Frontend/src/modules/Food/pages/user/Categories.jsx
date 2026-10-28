import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Grid2x2 } from "lucide-react";
import { motion } from "framer-motion";
import { adminAPI } from "@food/api";
import { usePublicSocket } from "@food/hooks/usePublicSocket";

import { useLocation } from "@food/hooks/useLocation";
import { useZone } from "@food/hooks/useZone";
import useAppBackNavigation from "@food/hooks/useAppBackNavigation";
import { API_BASE_URL } from "@food/api/config";

export default function Categories() {
  const navigate = useNavigate();
  const goBack = useAppBackNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { location } = useLocation();
  const { zoneId } = useZone(location);

  const BACKEND_ORIGIN = useMemo(() => API_BASE_URL.replace(/\/api(\/v\d+)?\/?$/, ""), []);

  const normalizeImageUrl = (imageUrl) => {
    if (typeof imageUrl !== "string") return "";
    const trimmed = imageUrl.trim();
    if (!trimmed) return "";
    if (/^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) return trimmed;
    
    const normalizedInput = trimmed
      .replace(/\\/g, "/")
      .replace(/^(https?):\/(?!\/)/i, "$1://")
      .replace(/^(https?:\/\/)(https?:\/\/)/i, "$1");

    if (/^(https?:)?\/\//i.test(normalizedInput)) return normalizedInput;

    return normalizedInput.startsWith("/")
      ? `${BACKEND_ORIGIN}${normalizedInput}`
      : `${BACKEND_ORIGIN}/${normalizedInput.replace(/^\.?\/*/, "")}`;
  };

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPublicCategories(zoneId ? { zoneId } : {});
      const list =
        response?.data?.data?.categories ||
        response?.data?.categories ||
        [];

      if (Array.isArray(list)) {
        const transformed = list.map((cat, idx) => ({
          id: String(cat?.id || cat?._id || cat?.slug || idx),
          name: cat?.name || "",
          slug: cat?.slug || String(cat?.name || "").toLowerCase().replace(/\s+/g, "-"),
          image: normalizeImageUrl(cat?.image || cat?.imageUrl) || "",
          type: cat?.type || "",
        }));
        setCategories(transformed);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, [zoneId, BACKEND_ORIGIN]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time updates from admin panel
  const socketListeners = useMemo(() => ({
    'food:category:update': () => {
      console.log('[Categories] Category updated via socket, refetching...');
      fetchCategories();
    },
  }), [fetchCategories]);
  usePublicSocket(socketListeners);

  const filteredCategories = categories.filter((cat) =>
    (cat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#120E0C] text-[#2C1810] dark:text-neutral-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FAF5ED]/95 dark:bg-[#120E0C]/95 backdrop-blur-md border-b border-[#EADBCE] dark:border-neutral-800 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={goBack}
          className="p-2 hover:bg-[#EADBCE]/50 dark:hover:bg-neutral-800 rounded-full transition-colors active:scale-95 text-[#2C1810] dark:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810] dark:text-white tracking-tight leading-tight">
            All Categories
          </h1>
          <p className="text-[10px] text-[#C5A059] font-bold uppercase tracking-widest leading-none mt-0.5">
            What's on your mind?
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C5A059] transition-colors" />
          <input
            type="text"
            placeholder="Search specialties, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#FFFDF9] dark:bg-[#1a1410] border border-[#EADBCE] dark:border-neutral-800 rounded-2xl text-xs sm:text-sm font-medium text-[#2C1810] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#C5A059]/40 focus:border-[#C5A059] transition-all placeholder:text-[#7C6E65]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-3 sm:gap-x-4 gap-y-8">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-full aspect-square rounded-full bg-[#EADBCE]/40 dark:bg-neutral-800" />
                <div className="h-2.5 w-14 bg-[#EADBCE]/40 dark:bg-neutral-800 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-7">
            {filteredCategories.map((category, index) => {
              return (
                <motion.div
                  key={category.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                >
                  <Link
                    to={`/food/user/category/${category.slug}`}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-xs border-2 border-[#EADBCE] dark:border-neutral-800 ring-1 ring-[#C5A059]/20 bg-[#FFFDF9] dark:bg-neutral-900 group-hover:border-[#C5A059] group-hover:ring-[#C5A059]/50 group-hover:scale-105 group-active:scale-95 transition-all duration-300 flex items-center justify-center p-0.5">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover rounded-full pointer-events-none"
                      />
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#2C1810] dark:text-neutral-200 group-hover:text-[#C5A059] text-center leading-tight line-clamp-2 tracking-tight capitalize">
                      {category.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <div className="py-20 flex flex-col items-center text-center px-6">
            <div className="h-20 w-20 bg-[#FFFDF9] dark:bg-neutral-900 border border-[#EADBCE] rounded-full flex items-center justify-center mb-6">
              <Grid2x2 className="h-10 w-10 text-[#C5A059]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-white">No results found</h3>
            <p className="text-xs text-[#7C6E65] mt-2 max-w-[240px]">
              We couldn't find any categories matching your search. Try another keyword!
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-6 px-6 py-2.5 bg-[#2C1810] text-[#FAF5ED] rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"
            >
              Show all categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
