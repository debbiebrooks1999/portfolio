import React, { useEffect, useRef, useState } from "react"

interface TerminalTypewriterProps {
  text: string
  speed?: number
  className?: string
  startDelayMs?: number
  onDone?: () => void
}

export default function TerminalTypewriter({
  text,
  speed = 30,
  className = "",
  startDelayMs = 500,
  onDone,
}: TerminalTypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [readyToRender, setReadyToRender] = useState(false)

  const indexRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const typingStartedRef = useRef(false)

  // 1) Wait for font + CSS to be applied BEFORE showing anything / typing
  useEffect(() => {
    let cancelled = false

    const nextPaint = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })

    const waitForFontAndCss = async () => {
      // Wait for the browser FontFaceSet (if supported)
      try {
        // Trigger load for our font explicitly
        if ((document as any).fonts?.load) {
          await (document as any).fonts.load(`16px "GlassTTYVT220"`)
          await (document as any).fonts.ready
        }
      } catch {
        // If fonts API fails, we still continue after a paint
      }

      // Ensure styled-jsx has injected + browser has applied styles
      await nextPaint()

      if (!cancelled) setReadyToRender(true)
    }

    waitForFontAndCss()

    return () => {
      cancelled = true
    }
  }, [])

  // 2) Start typing ONLY after readyToRender
  useEffect(() => {
    if (!readyToRender) return

    // Reset on text change
    setDisplayText("")
    indexRef.current = 0
    typingStartedRef.current = true

    const typeWriter = () => {
      if (indexRef.current < text.length) {
        const char = text.charAt(indexRef.current)
        setDisplayText((prev) => prev + char)
        indexRef.current++

        const charSpeed = char === "\n" ? 100 : Math.random() * 30 + speed
        timeoutRef.current = window.setTimeout(typeWriter, charSpeed)
      } else {
        onDone?.()
      }
    }

    timeoutRef.current = window.setTimeout(typeWriter, startDelayMs)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [text, speed, startDelayMs, onDone, readyToRender])

  // Cursor blink (only meaningful once visible, but harmless)
  useEffect(() => {
    const interval = window.setInterval(() => setShowCursor((p) => !p), 700)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className={`terminal-typewriter ${className}`}>
      <style jsx>{`
        @font-face {
          font-family: "GlassTTYVT220";
          src: url("/fonts/Glass_TTY_VT220.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .terminal-typewriter {
          font-family: "GlassTTYVT220", monospace;
          color: #00ff00;
          white-space: pre-wrap;
          word-wrap: break-word;
          text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 20px #00ff00,
            0 0 40px #00ff00;
        }

        .terminal-cursor {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          background: #00ff00;
          margin-left: 2px;
          vertical-align: text-bottom;
          box-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00;
        }

        .terminal-prompt {
          color: #00ff00;
          margin-bottom: 10px;
          font-size: 0.9em;
        }

        /* Hidden preloader that forces the font to be requested ASAP */
        .font-preload {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          user-select: none;
          font-family: "GlassTTYVT220", monospace;
        }
      `}</style>

      {/* Force font request even while UI is hidden */}
      <span className="font-preload">.</span>

      {/* Don’t show anything until font+css are ready */}
      {!readyToRender ? null : (
        <>
          <div className="terminal-prompt">&gt; RUN PORTFOLIO.BAS</div>
          <div className="terminal-prompt" style={{ marginBottom: "20px" }}>
            LOADING...
          </div>

          <div>
            {displayText.toUpperCase()}
            {showCursor && <span className="terminal-cursor" />}
          </div>
        </>
      )}
    </div>
  )
}