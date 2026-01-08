// isMobile.ts
// Simple mobile detection utility

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  
  // Check for mobile keywords
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  const isMobileUA = mobileRegex.test(userAgent)
  
  // Check for touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // Check screen width (conservative approach - 768px breakpoint)
  const isSmallScreen = window.innerWidth < 768
  
  // Consider it mobile if it's a mobile UA OR (has touch AND small screen)
  return isMobileUA || (hasTouch && isSmallScreen)
}
