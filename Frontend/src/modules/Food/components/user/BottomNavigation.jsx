import { Link, useLocation } from "react-router-dom"
import { Home, UtensilsCrossed, ClipboardList, User } from "lucide-react"
import { useActiveModule, MODULES } from "@food/hooks/useActiveModule"
import { useEffect, useState } from "react"
import { isModuleAuthenticated } from "@food/utils/auth"

export default function BottomNavigation() {
  const location = useLocation()
  const pathname = location.pathname
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let portraitHeight = window.innerHeight;
    let landscapeHeight = window.innerHeight;
    let isPortrait = window.innerHeight > window.innerWidth;

    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const type = e.target?.type;
      const isTextInput = tag === "textarea" || (tag === "input" && ["text", "password", "email", "number", "search", "tel", "url"].includes(type));

      if (isTextInput) {
        // Instantly hide the navbar before the keyboard even starts opening
        setIsKeyboardVisible(true);
      }
    };

    const handleFocusOut = () => {
      // We rely primarily on resize to show it again, but as a fallback:
      setTimeout(() => {
        setIsKeyboardVisible(false);
      }, 200);
    };

    const handleResize = () => {
      // A more robust way to detect keyboard on mobile:
      // If the height shrinks by more than 150px from the screen height, it's likely a keyboard
      const screenHeight = window.screen.height;
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      // We use the initial window.innerHeight as a baseline if screen.height is weird
      const baselineHeight = Math.max(portraitHeight, screenHeight * 0.8);
      const shrinkAmount = baselineHeight - currentHeight;

      if (shrinkAmount > 150) {
        setIsKeyboardVisible(true);
      } else if (shrinkAmount < 100) {
        setIsKeyboardVisible(false);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);
  const activeModuleId = useActiveModule()

  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];

  // Determine Category path based on module
  let categoryPath = activeModule.path;
  if (activeModuleId === "food") {
    categoryPath = "/food/user/categories";
  } else if (activeModuleId === "accessories") {
    categoryPath = "/food/user/accessories/categories";
  } else if (activeModuleId === "grocery") {
    categoryPath = "/food/user/under-250/categories";
  } else if (activeModuleId === "services") {
    categoryPath = "/food/user/services/categories";
  }

  const [isAuthenticated, setIsAuthenticated] = useState(() => isModuleAuthenticated("user"));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(isModuleAuthenticated("user"));
    };
    window.addEventListener("userAuthChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("userAuthChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const ordersDestination = isAuthenticated ? "/food/user/orders" : "/food/user/auth/login?redirect=/food/user/orders";
  const profileDestination = isAuthenticated ? "/food/user/profile" : "/food/user/auth/login?redirect=/food/user/profile";

  // Determine active states
  const isHome = pathname === activeModule.path || pathname === activeModule.path + "/";
  const isCategories = pathname.includes("/categories") || (pathname === categoryPath && !isHome);

  const activeHome = isHome && !pathname.includes("/categories");
  const activeCat = pathname.includes("/categories") || pathname.includes("/category/");
  const activeOrders = pathname.includes("/user/orders") || (pathname.includes("/auth/login") && location.search.includes("orders"));
  const activeProfile = pathname.includes("/user/profile") || (pathname.includes("/auth/login") && location.search.includes("profile"));

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-[#FFFDF9] dark:bg-[#181310] border-t-2 border-[#E8DEC8] dark:border-neutral-800 shadow-[0_-5px_22px_rgba(44,24,16,0.12)] dark:shadow-[0_-5px_25px_rgba(0,0,0,0.6)] hide-on-keyboard ${isKeyboardVisible ? 'hidden' : ''}`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 pt-2 pb-[max(0.6rem,calc(env(safe-area-inset-bottom)+0.35rem))]">

        {/* Home Tab */}
        <Link
          to={activeModule.path}
          className="flex flex-1 flex-col items-center justify-center transition-all duration-200 group active:scale-95"
        >
          <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeHome ? "bg-[#5C381E] dark:bg-[#C5A059] shadow-sm" : "hover:bg-[#F5EDE2]/60 dark:hover:bg-white/5"
          }`}>
            <Home
              className={`h-4.5 w-4.5 transition-transform duration-200 ${
                activeHome ? "scale-105 text-white dark:text-[#2C1810]" : "text-[#7A6B63] dark:text-[#A8988B]"
              }`}
              strokeWidth={activeHome ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[11px] leading-tight mt-1 tracking-tight transition-colors ${
              activeHome ? "text-[#5C381E] dark:text-[#C5A059] font-bold" : "text-[#7A6B63] dark:text-[#A8988B] font-medium"
            }`}
          >
            Home
          </span>
        </Link>

        {/* Menu Tab */}
        <Link
          to={categoryPath}
          className="flex flex-1 flex-col items-center justify-center transition-all duration-200 group active:scale-95"
        >
          <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeCat ? "bg-[#5C381E] dark:bg-[#C5A059] shadow-sm" : "hover:bg-[#F5EDE2]/60 dark:hover:bg-white/5"
          }`}>
            <UtensilsCrossed
              className={`h-4.5 w-4.5 transition-transform duration-200 ${
                activeCat ? "scale-105 text-white dark:text-[#2C1810]" : "text-[#7A6B63] dark:text-[#A8988B]"
              }`}
              strokeWidth={activeCat ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[11px] leading-tight mt-1 tracking-tight transition-colors ${
              activeCat ? "text-[#5C381E] dark:text-[#C5A059] font-bold" : "text-[#7A6B63] dark:text-[#A8988B] font-medium"
            }`}
          >
            Menu
          </span>
        </Link>

        {/* Orders Tab */}
        <Link
          to={ordersDestination}
          className="flex flex-1 flex-col items-center justify-center transition-all duration-200 group active:scale-95"
        >
          <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeOrders ? "bg-[#5C381E] dark:bg-[#C5A059] shadow-sm" : "hover:bg-[#F5EDE2]/60 dark:hover:bg-white/5"
          }`}>
            <ClipboardList
              className={`h-4.5 w-4.5 transition-transform duration-200 ${
                activeOrders ? "scale-105 text-white dark:text-[#2C1810]" : "text-[#7A6B63] dark:text-[#A8988B]"
              }`}
              strokeWidth={activeOrders ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[11px] leading-tight mt-1 tracking-tight transition-colors ${
              activeOrders ? "text-[#5C381E] dark:text-[#C5A059] font-bold" : "text-[#7A6B63] dark:text-[#A8988B] font-medium"
            }`}
          >
            Orders
          </span>
        </Link>

        {/* Profile Tab */}
        <Link
          to={profileDestination}
          className="flex flex-1 flex-col items-center justify-center transition-all duration-200 group active:scale-95"
        >
          <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeProfile ? "bg-[#5C381E] dark:bg-[#C5A059] shadow-sm" : "hover:bg-[#F5EDE2]/60 dark:hover:bg-white/5"
          }`}>
            <User
              className={`h-4.5 w-4.5 transition-transform duration-200 ${
                activeProfile ? "scale-105 text-white dark:text-[#2C1810]" : "text-[#7A6B63] dark:text-[#A8988B]"
              }`}
              strokeWidth={activeProfile ? 2.5 : 2}
            />
          </div>
          <span
            className={`text-[11px] leading-tight mt-1 tracking-tight transition-colors ${
              activeProfile ? "text-[#5C381E] dark:text-[#C5A059] font-bold" : "text-[#7A6B63] dark:text-[#A8988B] font-medium"
            }`}
          >
            Profile
          </span>
        </Link>

      </div>
    </nav>
  )
}
