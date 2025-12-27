import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import TerminalTypewriter from './TerminalTypewriter'

export function GLBOverlayLoader({
  onStart,
  title = 'LOADING 90sPC.GLB...',
  typewriterText = `SYSTEM INITIALIZED
CREATIVE TECHNOLOGIST PORTFOLIO v2.0
DEBX0X - 25 YEARS EXPERIENCE
WEBGL | THREE.JS | REACT | SHADERS

> LOADING INTERACTIVE 3D ENVIRONMENT...
> INITIALIZING CYBERPUNK AESTHETICS...
> RENDERING IMMERSIVE EXPERIENCE...

READY TO EXPLORE`,
  typewriterPosition = { top: '0', left: '0' }, // New prop for positioning
}: {
  onStart: () => void
  title?: string
  typewriterText?: string
  typewriterPosition?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
    transform?: string
  }
}) {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)
  const [typewriterComplete, setTypewriterComplete] = useState(false)

  useEffect(() => {
    const mgr = THREE.DefaultLoadingManager

    const prevOnStart = mgr.onStart
    const prevOnProgress = mgr.onProgress
    const prevOnLoad = mgr.onLoad
    const prevOnError = mgr.onError

    mgr.onStart = (...args) => {
      setActive(true)
      setReady(false)
      setProgress(0)
      prevOnStart?.(...args)
    }

    mgr.onProgress = (_url, loaded, total) => {
      const p = total > 0 ? (loaded / total) * 100 : 0
      setProgress(p)
      prevOnProgress?.(_url, loaded, total)
    }

    mgr.onLoad = () => {
      setProgress(100)
      setActive(false)
      setReady(true)
      prevOnLoad?.()
    }

    mgr.onError = (...args) => {
      setActive(false)
      prevOnError?.(...args)
    }

    return () => {
      mgr.onStart = prevOnStart
      mgr.onProgress = prevOnProgress
      mgr.onLoad = prevOnLoad
      mgr.onError = prevOnError
    }
  }, [])

  const p = Math.min(100, Math.max(0, progress))
  const scale = useMemo(() => 0.9 + (p / 100) * 0.1, [p])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready && typewriterComplete) onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, typewriterComplete, onStart])

  useEffect(() => {
    if (ready) {
      const estimatedDuration = typewriterText.length * 30 + 500
      const timer = setTimeout(() => {
        setTypewriterComplete(true)
      }, estimatedDuration)
      return () => clearTimeout(timer)
    }
  }, [ready, typewriterText])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        zIndex: 10,
        pointerEvents: (ready && typewriterComplete) ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          width: '625px',
          height: '535px',
          borderRadius: 5,
          overflow: 'hidden',
          background: 'rgba(0, 8, 0, 0.10)',
          boxShadow: '0 0 35px rgba(0,255,0,0.10)',
          transform: `perspective(900px) rotateX(2.5deg) translateY(-45px)`,
          transition: 'opacity 280ms ease',
          position: 'relative',
          opacity: ready ? 1 : 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: '120px',
            pointerEvents: 'none',
            background:
              'linear-gradient(to right, rgba(0,0,0,0.55), rgba(0,0,0,0.18), rgba(0,0,0,0))',
            filter: 'blur(0.2px)',
            opacity: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: '120px',
            pointerEvents: 'none',
            background:
              'linear-gradient(to left, rgba(0,0,0,0.55), rgba(0,0,0,0.18), rgba(0,0,0,0))',
            filter: 'blur(0.2px)',
            opacity: 1,
          }}
        />

        {/* scanlines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.22,
            background:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0) 4px)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Loading Phase */}
        {!ready && (
          <div
            style={{
              position: 'absolute',
              inset: '10%',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              fontFamily: '"Courier New", monospace',
              color: '#00ff00',
              textShadow:
                '0 0 5px rgba(0,255,0,0.85), 0 0 10px rgba(0,255,0,0.55), 0 0 18px rgba(0,255,0,0.30)',
            }}
          >
            <div>{'> RUN SCENE.LOAD'}</div>
            <div>{`> ${title} ${p.toFixed(0)}%`}</div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: 'rgba(0,255,0,0.12)',
                overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(0,255,0,0.18) inset',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${p}%`,
                  background: 'rgba(0,255,0,0.85)',
                  transition: 'width 120ms linear',
                  boxShadow:
                    '0 0 10px rgba(0,255,0,0.45), 0 0 18px rgba(0,255,0,0.25)',
                }}
              />
            </div>

            <div style={{ opacity: 0.9, marginTop: 10 }}>
              {active ? '> INITIALIZING...' : '> WAITING...'}
            </div>
          </div>
        )}

        {/* Typewriter Phase */}
        {ready && (
          <div
            style={{
              position: 'absolute',
              ...typewriterPosition,
              fontFamily: '"Courier New", monospace',
              color: '#00ff00',
              textShadow:
                '0 0 5px rgba(0,255,0,0.85), 0 0 10px rgba(0,255,0,0.55), 0 0 18px rgba(0,255,0,0.30)',
              maxWidth: 'calc(100% - 20%)',
            }}
          >
            <TerminalTypewriter text={typewriterText} speed={25} />

            {typewriterComplete && (
              <button
                onClick={onStart}
                style={{
                  marginTop: 20,
                  pointerEvents: 'auto',
                  background: 'rgba(0,255,0,0.10)',
                  border: '1px solid rgba(0,255,0,0.35)',
                  color: '#00ff00',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontFamily: '"Courier New", monospace',
                  cursor: 'pointer',
                  textShadow:
                    '0 0 5px rgba(0,255,0,0.85), 0 0 10px rgba(0,255,0,0.55)',
                  transition: 'all 180ms ease',
                  animation: 'fadeIn 300ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,255,0,0.18)'
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,0,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,255,0,0.10)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                START &gt;
              </button>
            )}

            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(5px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  )
}