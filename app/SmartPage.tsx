"use client"

import React, { useEffect, useState } from "react"
import { isMobileDevice } from "./isMobile"
import MobilePage from "./MobilePage"
import DesktopPage from "./DesktopPage" // Your existing complex desktop page

/**
 * Smart Page Router
 * 
 * Detects device type and shows:
 * - Mobile: Clean, fast, simple version
 * - Desktop: Full interactive 3D experience
 */
export default function SmartPage() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    // Detect on mount
    setIsMobile(isMobileDevice())

    // Re-check on resize (for testing/edge cases)
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Show nothing until we've detected (prevents flash)
  if (isMobile === null) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-[#00ff00] font-mono animate-pulse">
          LOADING...
        </div>
      </div>
    )
  }

  // Show appropriate version
  return isMobile ? <MobilePage /> : <DesktopPage />
}