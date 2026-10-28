// CSS-only AnimatedPage - no GSAP dependency
import { useEffect, useRef } from "react"

export default function AnimatedPage({ children, className = "" }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Keep entrance animation lightweight with opacity fade.
    // Avoid translateY transform which breaks descendants that use position: sticky / fixed
    // and causes unwanted header sliding on page load.
    container.style.opacity = '0'
    container.style.transition = 'opacity 200ms ease'

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      container.style.opacity = '1'
    })

    const cleanupTimer = window.setTimeout(() => {
      container.style.transition = ''
    }, 240)

    return () => {
      window.clearTimeout(cleanupTimer)
    }
  }, [])

  return (
    <div ref={containerRef} className={`${className}  md:pb-0`}>
      {children}
    </div>
  )
}
