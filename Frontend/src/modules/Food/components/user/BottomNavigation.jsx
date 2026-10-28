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

  // Determine active states
  const isHome = pathname === activeModule.path || pathname === activeModule.path + "/";
  const isCategories = pathname.includes("/categories") || (pathname === categoryPath && !isHome);
  
  // If we are in a module where categoryPath === homePath (like grocery),
  // and we want to highlight Home by default. We'll just let Home be highlighted
  // if pathname exactly matches Home path, and Categories if it matches category specific path.
  // Since grocery has no separate category path, clicking Categories will just go to Home, 
  // but Home will be highlighted. This matches the user request of default Home selected.
  const activeHome = isHome && !pathname.includes("/categories");
  const activeCat = pathname.includes("/categories");
  const activeOrders = pathname.includes("/user/orders");
  const activeProfile = pathname.includes("/user/profile");

  const activeColor = "#2C1810"
  const activeBg = "transparent"
  const activeFill = "#2C1810"

  return (
    <div className={`md:hidden fixed bottom-6 left-5 right-5 z-50 pointer-events-none hide-on-keyboard ${isKeyboardVisible ? 'hidden' : ''}`}>
      <div className="flex items-center justify-around h-auto px-3 py-2 bg-[#FAF6F0]/92 dark:bg-[#1a1410]/92 backdrop-blur-[20px] border border-[#EADBCE] dark:border-white/10 rounded-full shadow-[0_16px_36px_rgba(44,24,16,0.12)] pointer-events-auto">
        
        {/* Home Tab */}
        <Link
          to={activeModule.path}
          className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all duration-300 relative rounded-full ${activeHome
              ? ""
              : "text-[#7C6E65] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-gray-800/50"
            }`}
          style={activeHome ? { color: activeColor, backgroundColor: activeBg } : undefined}
        >
          <div className="relative">
            <Home className={`h-5 w-5 transition-transform duration-300 ${activeHome ? "scale-110 text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400"}`} strokeWidth={activeHome ? 2.5 : 2} style={activeHome ? { color: activeColor, fill: activeFill } : undefined} />
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all ${activeHome ? "text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400 opacity-80"}`}>
            Home
          </span>
        </Link>

        {/* Menu Tab */}
        <Link
          to={categoryPath}
          className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all duration-300 relative rounded-full ${activeCat
              ? ""
              : "text-[#7C6E65] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-gray-800/50"
            }`}
          style={activeCat ? { color: activeColor, backgroundColor: activeBg } : undefined}
        >
          <div className="relative">
            <UtensilsCrossed className={`h-5 w-5 transition-transform duration-300 ${activeCat ? "scale-110 text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400"}`} strokeWidth={activeCat ? 2.5 : 2} style={activeCat ? { color: activeColor, fill: activeFill } : undefined} />
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all ${activeCat ? "text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400 opacity-80"}`}>
            Menu
          </span>
        </Link>

        {/* Orders Tab */}
        <Link
          to="/food/user/orders"
          className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all duration-300 relative rounded-full ${activeOrders
              ? ""
              : "text-[#7C6E65] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-gray-800/50"
            }`}
          style={activeOrders ? { color: activeColor, backgroundColor: activeBg } : undefined}
        >
          <div className="relative">
            <ClipboardList className={`h-5 w-5 transition-transform duration-300 ${activeOrders ? "scale-110 text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400"}`} strokeWidth={activeOrders ? 2.5 : 2} style={activeOrders ? { color: activeColor, fill: activeFill } : undefined} />
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all ${activeOrders ? "text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400 opacity-80"}`}>
            Orders
          </span>
        </Link>

        {/* Profile Tab */}
        <Link
          to="/food/user/profile"
          className={`flex flex-1 flex-col items-center justify-center gap-1 px-2 py-1.5 transition-all duration-300 relative rounded-full ${activeProfile
              ? ""
              : "text-[#7C6E65] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-gray-800/50"
            }`}
          style={activeProfile ? { color: activeColor, backgroundColor: activeBg } : undefined}
        >
          <div className="relative">
            <User className={`h-5 w-5 transition-transform duration-300 ${activeProfile ? "scale-110 text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400"}`} strokeWidth={activeProfile ? 2.5 : 2} style={activeProfile ? { color: activeColor, fill: activeFill } : undefined} />
          </div>
          <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-all ${activeProfile ? "text-[#2C1810]" : "text-[#7C6E65] dark:text-gray-400 opacity-80"}`}>
            Profile
          </span>
        </Link>

      </div>
    </div>
  )
}
