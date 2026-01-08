"use client"

import React, { useState } from "react"
import Header from "./components/Header"
import TerminalTypewriter from "./components/TerminalTypewriter"
import ArchivePortal from "./components/ArchivePortal"
import EnhancedAbout from "./components/EnhancedAbout"
import { BIO_TEXT } from "./content-data"

type Phase = "intro" | "main"

/**
 * Mobile Portfolio - Simple, Fast, Performant
 * 
 * Just the essentials:
 * - Typewriter intro
 * - Work grid
 * - About section
 * - Contact in header
 */
export default function MobilePage() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [active, setActive] = useState(0)

  const sections = ["Intro", "Work", "About"]

  const handleTerminalDone = () => {
    // Wait a beat, then transition to main
    setTimeout(() => setPhase("main"), 800)
  }

  const handleSkip = () => {
    setPhase("main")
  }

  const handleJump = (index: number) => {
    setActive(index)
    if (index === 0) {
      setPhase("intro")
    } else {
      setPhase("main")
      // Scroll to section
      setTimeout(() => {
        const sectionEl = document.getElementById(
          index === 1 ? "work-section" : "about-section"
        )
        sectionEl?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#000000]">
      {/* Intro Overlay */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-[#0b0b12] to-[#000000]">
          <div className="w-full max-w-2xl">
            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 px-4 py-2 rounded-full
                         bg-black/50 border border-[#00ff00]/40
                         text-[#00ff00] font-mono text-sm uppercase tracking-wider
                         hover:bg-black/70 hover:border-[#00ff00]/60 transition-all"
            >
              Skip ✕
            </button>

            <TerminalTypewriter
              text={BIO_TEXT}
              onDone={handleTerminalDone}
              className="text-sm md:text-base"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      {phase === "main" && (
        <>
          {/* Header */}
          <div className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4">
              <Header sections={sections} active={active} onJump={handleJump} />
            </div>
          </div>

          {/* Main scroll container */}
          <main className="w-full">
            {/* Work Section */}
            <section
              id="work-section"
              className="min-h-screen w-full bg-black"
              style={{ paddingTop: "64px" }}
            >
              <ArchivePortal activeSection={1} />
            </section>

            {/* About Section */}
            <section
              id="about-section"
              className="min-h-screen w-full bg-black"
              style={{ paddingTop: "64px" }}
            >
              <div className="max-w-6xl mx-auto px-4 py-8">
                <EnhancedAbout />
              </div>
            </section>
          </main>
        </>
      )}
    </div>
  )
}
