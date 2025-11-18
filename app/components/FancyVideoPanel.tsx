// components/FancyVideoPanel.tsx
'use client';

import React, { forwardRef, useId, useEffect, useState, useRef } from 'react';
type FancyVideoPanelProps = {
  name: string;
  text?: string;
  videoSrc?: string;
  poster?: string;
  accents: { a: string; b: string; c: string };
};

const VB_W = 1200;
const VB_H = 700;

// Rounded panel path (adjust if you have a custom path)
const PANEL_PATH_D =
  'M32 32 H1168 A32 32 0 0 1 1200 64 V636 A32 32 0 0 1 1168 668 H32 A32 32 0 0 1 0 636 V64 A32 32 0 0 1 32 32 Z';

const FancyVideoPanel = forwardRef<HTMLDivElement, FancyVideoPanelProps>(
  ({ name, text, videoSrc, poster, accents }, ref) => {
    const clipId = useId().replace(/:/g, '_'); // ensure valid id
    const gradId = `${clipId}-grad`;
    const glowId = `${clipId}-glow`;

    // Responsive: compute 'narrow' from actual rendered width to switch to mobile layout
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [narrow, setNarrow] = useState(false);
    
    useEffect(() => {
      const node = hostRef.current;
      if (!node) return;
      const set = () => setNarrow(node.clientWidth < 700);
      set();
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect ? entry.contentRect.width : node.clientWidth;
          setNarrow(w < 700);
        }
      });
      ro.observe(node);
      return () => ro.disconnect();
    }, []);

    if (narrow) {
      return (
        /* Mobile layout: portrait video then text */
        <div
          ref={(node) => { 
            hostRef.current = node as HTMLDivElement; 
            if (typeof ref === 'function') ref(node); 
            else if (ref && typeof ref === 'object') (ref as any).current = node; 
          }}
          style={{
            width: '100%',
            maxWidth: 480,
            margin: '0 auto',
            boxSizing: 'border-box',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.35))',
          }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 16,
              padding: 1,
              background: `linear-gradient(135deg, ${accents.a}, ${accents.c})`,
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.6)',
                borderRadius: 15,
                overflow: 'hidden',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '9 / 16', position: 'relative' }}>
                {videoSrc ? (
                  <video
                    src={videoSrc}
                    poster={poster}
                    autoPlay
                    muted
                    playsInline
                    loop
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <img
                    src={poster || ''}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
              </div>

              <div style={{ padding: '14px 16px 16px', color: 'white' }}>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.9 }}>
                  {name}
                </div>
                {text && (
                  <p style={{ margin: '8px 0 0', fontSize: 'clamp(0.95rem, 3.8vw, 1.1rem)', lineHeight: 1.4, color: 'rgba(255,255,255,0.85)' }}>
                    {text}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={(node) => { 
          hostRef.current = node as HTMLDivElement; 
          if (typeof ref === 'function') ref(node); 
          else if (ref && typeof ref === 'object') (ref as any).current = node; 
        }}
        style={{
          width: '100%', 
          maxWidth: '1100px', 
          boxSizing: 'border-box',
          aspectRatio: `${VB_W} / ${VB_H}`,
          position: 'relative',
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.35))',
        }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className="panel-svg"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accents.a} />
              <stop offset="55%" stopColor={accents.b} />
              <stop offset="100%" stopColor={accents.c} />
            </linearGradient>

            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={PANEL_PATH_D} />
            </clipPath>

            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Panel fill */}
          <path
            d={PANEL_PATH_D}
            fill="rgba(255,255,255,0.04)"
            stroke={`url(#${gradId})`}
            strokeWidth="2"
            shapeRendering="geometricPrecision"
          />

          {/* Accent stroke glow */}
          <path
            d={PANEL_PATH_D}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeOpacity="0.65"
            strokeWidth="6"
            filter={`url(#${glowId})`}
          />

          {/* Everything below is CLIPPED INSIDE the panel */}
          <foreignObject
            x="0"
            y="0"
            width={VB_W}
            height={VB_H}
            clipPath={`url(#${clipId})`}
          >
            {/* foreignObject needs XHTML namespace */}
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                padding: '1px',
                display: 'grid',
                gridTemplateColumns: '1.15fr 0.85fr',
                gap: '24px',
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji","Segoe UI Emoji"',
              }}
            >
              {/* videoHolder - contained by the panel via clipPath */}
              <div
                className="videoHolder"
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {videoSrc ? (
                  <video
                    className="video"
                    src={videoSrc}
                    poster={poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls={false}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <img
                    src={poster || ''}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
              </div>

              {/* Right column content */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 0,
                  gap: '16px',
                  color: 'white',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.65)',
                      marginBottom: '8px',
                    }}
                  >
                    {name}
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.75rem',
                      lineHeight: 1.2,
                      fontWeight: 700,
                      background: `linear-gradient(90deg, ${accents.a}, ${accents.b}, ${accents.c})`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
                    Featured
                  </h3>
                  {text && (
                    <p
                      style={{
                        marginTop: '12px',
                        marginBottom: 0,
                        color: 'rgba(255,255,255,0.75)',
                        lineHeight: 1.6,
                        fontSize: '1rem',
                      }}
                    >
                      {text}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: accents.a,
                      boxShadow: `0 0 18px ${accents.a}`,
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: accents.b,
                      boxShadow: `0 0 18px ${accents.b}`,
                    }}
                  />
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: accents.c,
                      boxShadow: `0 0 18px ${accents.c}`,
                    }}
                  />
                </div>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    );
  }
);

FancyVideoPanel.displayName = 'FancyVideoPanel';
export default FancyVideoPanel;