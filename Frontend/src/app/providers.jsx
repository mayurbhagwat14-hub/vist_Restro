import { BrowserRouter, HashRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { StrictMode } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'

function shouldUseHashRouter() {
  if (typeof window === 'undefined') return false

  const protocol = String(window.location?.protocol || '').toLowerCase()
  // Only use HashRouter if explicitly served via file: protocol (local bundled assets)
  return protocol === 'file:'
}

export function AppProviders({ children }) {
  const Router = shouldUseHashRouter() ? HashRouter : BrowserRouter

  return (
    <StrictMode>
      <ReduxProvider store={store}>
        <Router>
          {children}
          <Toaster position="top-center" richColors offset="80px" closeButton visibleToasts={1} expand={false} />
        </Router>
      </ReduxProvider>
    </StrictMode>
  )
}
