import React, { useEffect } from 'react'
import AppRoutes from './routes'
import ErrorBoundary from '../components/ErrorBoundary'

// VIST Restaurant client-side entry point application container
function App() {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const isTextInputFocused = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      const type = el.type?.toLowerCase();
      return tag === "textarea" || (tag === "input" && ["text", "password", "email", "number", "search", "tel", "url"].includes(type || "text"));
    };

    const handleResize = () => {
      if (!isTextInputFocused()) {
        document.body.classList.remove('keyboard-open');
        return;
      }
      const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const screenHeight = window.screen.height || window.innerHeight;
      if (currentHeight < screenHeight * 0.7) {
        document.body.classList.add('keyboard-open');
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };

    const handleFocusIn = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const type = e.target?.type;
      const isTextInput = tag === "textarea" || (tag === "input" && ["text", "password", "email", "number", "search", "tel", "url"].includes(type || "text"));
      
      if (isTextInput) {
        document.body.classList.add('keyboard-open');
      }
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        if (!isTextInputFocused()) {
          document.body.classList.remove('keyboard-open');
        }
      }, 150);
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

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App
