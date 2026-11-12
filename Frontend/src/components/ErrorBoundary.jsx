import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/food/user';
  };

  render() {
    if (this.state.hasError) {
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
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-[#FAF5ED] border border-[#EADBCE] text-[#2C1810] font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-[#5C381E] hover:bg-[#482A14] text-[#FAF5ED] font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

