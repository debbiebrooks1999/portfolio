import React, { useEffect, useRef, useState } from 'react'

interface TerminalTypewriterProps {
  text: string
  speed?: number
  className?: string
}

export default function TerminalTypewriter({ 
  text, 
  speed = 25,
  className = '' 
}: TerminalTypewriterProps) {
  const outputRef = useRef<HTMLDivElement>(null)
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const indexRef = useRef(0)

  useEffect(() => {
    // Reset when text changes
    setDisplayText('')
    indexRef.current = 0

    const typeWriter = () => {
      if (indexRef.current < text.length) {
        const char = text.charAt(indexRef.current)
        setDisplayText(prev => prev + char)
        indexRef.current++

        // Variable speed for more authentic feel
        const charSpeed = char === '\n' ? 100 : Math.random() * 30 + speed
        setTimeout(typeWriter, charSpeed)
      }
    }

    // Start typing after brief delay
    const startTimeout = setTimeout(typeWriter, 500)

    return () => clearTimeout(startTimeout)
  }, [text, speed])

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`terminal-typewriter ${className}`}>
      <style jsx>{`
        .terminal-typewriter {
          font-family: 'Courier New', monospace;
          color: #00ff00;
          white-space: pre-wrap;
          word-wrap: break-word;
          text-shadow: 
            0 0 5px #00ff00,
            0 0 10px #00ff00,
            0 0 20px #00ff00,
            0 0 40px #00ff00;
        }
        
        .terminal-cursor {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          background: #00ff00;
          margin-left: 2px;
          vertical-align: text-bottom;
          box-shadow: 
            0 0 5px #00ff00,
            0 0 10px #00ff00,
            0 0 15px #00ff00;
        }

        .terminal-prompt {
          color: #00ff00;
          margin-bottom: 10px;
          font-size: 0.9em;
        }
      `}</style>

      <div className="terminal-prompt">&gt; RUN PORTFOLIO.BAS</div>
      <div className="terminal-prompt" style={{ marginBottom: '20px' }}>LOADING...</div>
      
      <div ref={outputRef}>
        {displayText.toUpperCase()}
        {showCursor && <span className="terminal-cursor" />}
      </div>
    </div>
  )
}