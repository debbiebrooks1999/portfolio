import React, { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

export function GLBOverlayLoader({
  onStart,
  title = 'LOADING 90sPC.GLB...',
}: {
  onStart: () => void
  title?: string
}) {
  const [progress, setProgress] = useState(0)
  const [active, setActive] = useState(true)
  const [ready, setReady] = useState(false)

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
      // keep overlay visible on error
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

  // subtle scale-up while loading
  const p = Math.min(100, Math.max(0, progress))
  const scale = useMemo(() => 0.9 + (p / 100) * 0.1, [p])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && ready) onStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, onStart])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        zIndex: 10,
        pointerEvents: ready ? 'auto' : 'none',
      }}
    >
        <div
            style={{
                width: '625px',
                height: '535px',
                borderRadius: 5,
                overflow: 'hidden',
                background: 'rgba(0, 8, 0, 0.10)',
                boxShadow: '0 0 35px rgba(0,255,0,0.10)', // remove inset edge-darkening
                transform: `perspective(900px) rotateX(2.5deg) translateY(-45px)`,
                transition: 'opacity 280ms ease',         // no transform transition
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
                boxShadow: '0 0 10px rgba(0,255,0,0.45), 0 0 18px rgba(0,255,0,0.25)',
              }}
            />
          </div>

          <div style={{ opacity: 0.9, marginTop: 10 }}>
            {ready ? '> READY. PRESS ENTER / CLICK START.' : active ? '> INITIALIZING...' : '> WAITING...'}
          </div>

            {ready && (
              <button
                onClick={onStart}
                style={{
                  marginTop: 'auto',
                  alignSelf: 'flex-start',
                  pointerEvents: 'auto',
                  background: 'rgba(0,255,0,0.10)',
                  border: '1px solid rgba(0,255,0,0.35)',
                  color: '#00ff00',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontFamily: '"Courier New", monospace',
                  cursor: 'pointer',
                }}
              >
                START
              </button>
            )}


        </div>
      </div>
    </div>
  )
}