import { Component, useState, useEffect, useRef, Suspense } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { AlertTriangle, RotateCcw } from "lucide-react"
import AdminSidebar from "./AdminSidebar"
import AdminNavbar from "./AdminNavbar"
import AdminNotificationManager from "./AdminNotificationManager"
import Loader from "@food/components/Loader"
import { API_BASE_URL } from "@food/api/config"

class AdminPageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Admin Page render error caught:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locationKey !== this.props.locationKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 font-serif">
            Unable to display this page
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
            An unexpected error occurred while loading this section. You can retry or choose another option from the sidebar.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C381E] text-white text-sm font-semibold hover:bg-[#482A14] transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Page
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Reload Window
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}


export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mainContentRef = useRef(null);

  // Read admin theme on mount, restore user app theme on unmount
  useEffect(() => {
    const savedAdminTheme = localStorage.getItem('adminTheme') || 'light';
    if (savedAdminTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return () => {
      const savedTheme = localStorage.getItem('appTheme') || 'light';
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  // Get initial collapsed state from localStorage or screen width to set initial margin
  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_sidebar_state')
      if (saved !== null) {
        const state = JSON.parse(saved)
        if (state && typeof state.isCollapsed !== 'undefined') {
          setIsSidebarCollapsed(state.isCollapsed)
          return
        }
      }
      if (typeof window !== "undefined" && window.innerWidth < 1366) {
        setIsSidebarCollapsed(true)
      }
    } catch (e) {
      debugError('Error loading sidebar collapsed state:', e)
    }
  }, [])

  const handleCollapseChange = (collapsed) => {
    setIsSidebarCollapsed(collapsed)
  }

  // Ensure each admin route opens from top of the scrollable content area & closes mobile drawer
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-neutral-200 dark:bg-[#0a0a0a] flex overflow-hidden admin-panel">
      {/* Global Real-Time Notification & Sound Manager */}
      <AdminNotificationManager />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapseChange={handleCollapseChange}
      />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex min-h-0 flex-col transition-all duration-300 ease-in-out min-w-0
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}
      `}>
        {/* Top Navbar */}
        <AdminNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Backend disconnected banner */}
        {!API_BASE_URL && (
          <div className="w-full bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-sm text-amber-900">
            Backend disconnected. Data is not live.
          </div>
        )}

        {/* Page Content */}
        <main
          ref={mainContentRef}
          className="flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-auto bg-neutral-100 dark:bg-[#121212]"
        >
          <AdminPageErrorBoundary locationKey={location.pathname}>
            <Suspense
              fallback={
                <div className="p-8 flex items-center justify-center min-h-[50vh]">
                  <Loader message="Loading page..." />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </AdminPageErrorBoundary>
        </main>
      </div>
    </div>
  );
}
