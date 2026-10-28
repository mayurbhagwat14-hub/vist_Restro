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
  const activeCat = pathname.includes("/categories");
  const activeOrders = pathname.includes("/user/orders") || (pathname.includes("/auth/login") && location.search.includes("orders"));
  const activeProfile = pathname.includes("/user/profile") || (pathname.includes("/auth/login") && location.search.includes("profile"));

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-[#FAF6F0]/98 dark:bg-[#1a1410]/98 backdrop-blur-xl border-t border-[#EADBCE] dark:border-white/10 shadow-[0_-4px_20px_rgba(44,24,16,0.06)] hide-on-keyboard ${isKeyboardVisible ? 'hidden' : ''}`}>
      <div className="flex items-center justify-around h-[58px] max-w-lg mx-auto px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))]">

        {/* Home Tab */}
        <Link
          to={activeModule.path}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-200 relative rounded-xl ${activeHome
              ? "text-[#5C381E] dark:text-[#E6C687]"
              : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeHome ? "bg-[#EDE4D8] dark:bg-white/10" : ""}`}>
            <Home
              className={`h-5 w-5 transition-transform duration-200 ${activeHome ? "scale-105 text-[#5C381E] dark:text-[#E6C687]" : "text-[#7C6E65] dark:text-gray-400"
                }`}
              strokeWidth={activeHome ? 2.4 : 1.9}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-all ${activeHome ? "text-[#5C381E] dark:text-[#E6C687] font-bold" : "text-[#7C6E65] dark:text-gray-400 font-medium"
              }`}
          >
            Home
          </span>
        </Link>

        {/* Menu Tab */}
        <Link
          to={categoryPath}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-200 relative rounded-xl ${activeCat
              ? "text-[#5C381E] dark:text-[#E6C687]"
              : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeCat ? "bg-[#EDE4D8] dark:bg-white/10" : ""}`}>
            <UtensilsCrossed
              className={`h-5 w-5 transition-transform duration-200 ${activeCat ? "scale-105 text-[#5C381E] dark:text-[#E6C687]" : "text-[#7C6E65] dark:text-gray-400"
                }`}
              strokeWidth={activeCat ? 2.4 : 1.9}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-all ${activeCat ? "text-[#5C381E] dark:text-[#E6C687] font-bold" : "text-[#7C6E65] dark:text-gray-400 font-medium"
              }`}
          >
            Menu
          </span>
        </Link>

        {/* Orders Tab */}
        <Link
          to={ordersDestination}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-200 relative rounded-xl ${activeOrders
              ? "text-[#5C381E] dark:text-[#E6C687]"
              : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeOrders ? "bg-[#EDE4D8] dark:bg-white/10" : ""}`}>
            <ClipboardList
              className={`h-5 w-5 transition-transform duration-200 ${activeOrders ? "scale-105 text-[#5C381E] dark:text-[#E6C687]" : "text-[#7C6E65] dark:text-gray-400"
                }`}
              strokeWidth={activeOrders ? 2.4 : 1.9}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-all ${activeOrders ? "text-[#5C381E] dark:text-[#E6C687] font-bold" : "text-[#7C6E65] dark:text-gray-400 font-medium"
              }`}
          >
            Orders
          </span>
        </Link>

        {/* Profile Tab */}
        <Link
          to={profileDestination}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 px-1 transition-all duration-200 relative rounded-xl ${activeProfile
              ? "text-[#5C381E] dark:text-[#E6C687]"
              : "text-[#7C6E65] dark:text-gray-400 hover:text-[#5C381E]"
            }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeProfile ? "bg-[#EDE4D8] dark:bg-white/10" : ""}`}>
            <User
              className={`h-5 w-5 transition-transform duration-200 ${activeProfile ? "scale-105 text-[#5C381E] dark:text-[#E6C687]" : "text-[#7C6E65] dark:text-gray-400"
                }`}
              strokeWidth={activeProfile ? 2.4 : 1.9}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight transition-all ${activeProfile ? "text-[#5C381E] dark:text-[#E6C687] font-bold" : "text-[#7C6E65] dark:text-gray-400 font-medium"
              }`}
          >
            Profile
          </span>
        </Link>

      </div>
    </div>
  )
}
