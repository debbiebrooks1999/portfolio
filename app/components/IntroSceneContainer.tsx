"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { useProgress } from "@react-three/drei"
import TerminalTypewriter from "./TerminalTypewriter"

export type Phase = "boot" | "main"

function BootOverlay({
  visible,
  terminalText,
  onTerminalDone,
  onSkip,
}: {
  visible: boolean
  terminalText: string
  onTerminalDone: () => void
  onSkip: () => void
}) {
  const { progress, active } = useProgress()
  const assetsDone = !active && progress >= 100

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "radial-gradient(1200px 800px at 50% -10%, #0b0b12, #000000)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 450ms ease",
      }}
    >
      <div style={{ width: "min(920px, 92vw)", position: "relative" }}>
        {/* Force font request early */}
        <span
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: '"GlassTTYVT220", monospace',
          }}
        >
          .
        </span>

        {/* Skip appears ONLY once assets are fully loaded */}
        {assetsDone && (
          <button type="button" onClick={onSkip} className="tty-skip" aria-label="Skip intro">
            SKIP ✕
            <style jsx>{`
              .tty-skip {
                position: absolute;
                right: 0;
                top: 0;

                font-family: "GlassTTYVT220", monospace;
                color: #00ff00;

                padding: 0.5rem 0.9rem;
                border-radius: 9999px;

                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(0, 255, 0, 0.45);

                letter-spacing: 0.12em;
                text-transform: uppercase;
                font-size: 0.8rem;

                cursor: pointer;

                text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00,
                  0 0 20px #00ff00, 0 0 40px #00ff00;

                box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
                transition: transform 120ms ease, background 200ms ease,
                  border-color 200ms ease, box-shadow 200ms ease;
              }

              .tty-skip:hover {
                transform: translateY(-1px);
                background: rgba(0, 0, 0, 0.55);
                border-color: rgba(0, 255, 0, 0.75);
                box-shadow: 0 0 18px rgba(0, 255, 0, 0.3);
              }

              .tty-skip:active {
                transform: translateY(0px);
              }

              .tty-skip:focus-visible {
                outline: none;
                box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.35),
                  0 0 18px rgba(0, 255, 0, 0.35);
              }
            `}</style>
          </button>
        )}

        <div style={{ transform: "scale(0.85)", transformOrigin: "top left" }}>
          <TerminalTypewriter text={terminalText} onDone={onTerminalDone} />
        </div>

        {/* No assets % text, no assets bar */}
      </div>
    </div>
  )
}

export default function IntroSceneContainer({
  text,
  onPhaseChange,
  fadeMs = 450,
  children,
}: {
  text: string
  onPhaseChange?: (phase: Phase) => void
  fadeMs?: number
  children: (phase: Phase) => React.ReactNode
}) {
  const [phase, setPhase] = useState<Phase>("boot")
  const [terminalDone, setTerminalDone] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)

  const { progress, active } = useProgress()
  const assetsDone = useMemo(() => !active && progress >= 100, [active, progress])

  useEffect(() => {
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])

  // Auto-enter main when typing is done AND assets are done
  useEffect(() => {
    if (phase === "main") return
    if (!terminalDone) return
    if (!assetsDone) return

    setOverlayVisible(false)
    window.setTimeout(() => setPhase("main"), fadeMs)
  }, [phase, terminalDone, assetsDone, fadeMs])

  const skipToMain = useCallback(() => {
    if (!assetsDone) return
    setOverlayVisible(false)
    setPhase("main")
  }, [assetsDone])

  return (
    <>
      <BootOverlay
        visible={overlayVisible}
        terminalText={text}
        onTerminalDone={() => setTerminalDone(true)}
        onSkip={skipToMain}
      />
      {children(phase)}
    </>
  )
}