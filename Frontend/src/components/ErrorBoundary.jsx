import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/food/user';
  };

  handleClearSession = () => {
    try {
      localStorage.removeItem('admin_accessToken');
      localStorage.removeItem('admin_refreshToken');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_authenticated');
      sessionStorage.clear();
    } catch (_e) {}
    window.location.href = '/admin/login';
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || String(this.state.error || 'Unknown error');
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#120E0C] text-[#2C1810] dark:text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EDE2] dark:bg-[#251A14] flex items-center justify-center mb-4 border border-[#EADBCE] dark:border-neutral-800 shadow-sm">
            <svg
              className="w-8 h-8 text-[#5C381E] dark:text-[#E6C687]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C1810] dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6E65] dark:text-neutral-400 max-w-sm mb-6">
            We encountered a temporary display issue. Tap below to reload and continue browsing.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#FAF5ED] border border-[#EADBCE] text-[#2C1810] font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleClearSession}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Clear Session & Login
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#5C381E] hover:bg-[#482A14] text-[#FAF5ED] font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>

          {/* Technical Error Details */}
          <div className="max-w-xl w-full mx-auto p-4 text-left bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl overflow-hidden text-xs text-red-800 dark:text-red-200 font-mono shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-red-900 dark:text-red-100 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Error Details
              </span>
              <button
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(`${errorMsg}\n\n${componentStack}`);
                    alert('Error copied to clipboard!');
                  } catch (_e) {}
                }}
                className="text-[11px] underline text-red-700 dark:text-red-300 hover:text-red-900 cursor-pointer"
              >
                Copy Error
              </button>
            </div>
            <div className="font-semibold text-red-700 dark:text-red-300 break-words mb-2">
              {errorMsg}
            </div>
            {componentStack && (
              <pre className="text-[10px] text-red-600/80 dark:text-red-400/80 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed border-t border-red-200/60 dark:border-red-900/60 pt-2">
                {componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

