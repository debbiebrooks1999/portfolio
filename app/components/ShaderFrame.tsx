"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

type Slide = {
  title?: string
  subtitle?: string
  imageSrc?: string
  videoSrc?: string
  qrSrc?: string
}

type ShaderFrameProps = {
  title?: string
  subtitle?: string
  isMobile: boolean
  colors?: [string, string, string, string]
  initial?: {
    scale: number
    speed: number
    ax: number
    ay: number
    az: number
    aw: number
    bx: number
    by: number
  }
  className?: string
  slides?: Slide[]
  showText?: boolean
  children?: React.ReactNode

  /** Height of fixed header (e.g. "64px"). Only used when embedded={false}. */
  headerHeight?: string

  /** Panel height as portion of viewport (e.g. 0.9 => 90% vh). Only used when embedded={false}. */
  viewportPortion?: number

  /**
   * If ShaderFrame is rendered inside a full-height section / scroll container (your scroll-snap layout),
   * set embedded=true so it fills its parent and does NOT apply internal header offsets.
   */
  embedded?: boolean

  /** When this value changes, the content fade timer resets (use section index / id). */
  activeKey?: string | number

  /** Delay before content fades in (ms). Default 3000. */
  contentDelayMs?: number
}

export default function ShaderFrame({
  title = "Liquid Meta",
  subtitle = "Variation",
  colors = ["#a855f7", "#ec4899", "#8b5cf6", "#d946ef"],
  initial = {
    scale: 0.4,
    speed: 1.0,
    ax: 5,
    ay: 7,
    az: 9,
    aw: 13,
    bx: 1,
    by: 1,
  },
  className = "",
  slides,
  showText = true,
  children,
  isMobile,
  headerHeight = "64px",
  viewportPortion = 0.9,
  embedded = true,
  activeKey,
  contentDelayMs = 3000,
}: ShaderFrameProps) {
  /* ---------- Shader controls ---------- */
  const [scale, setScale] = useState(initial.scale)
  const [speed, setSpeed] = useState(initial.speed)
  const [ax, setAx] = useState(initial.ax)
  const [ay, setAy] = useState(initial.ay)
  const [az, setAz] = useState(initial.az)
  const [aw, setAw] = useState(initial.aw)
  const [bx, setBx] = useState(initial.bx)
  const [by, setBy] = useState(initial.by)

  /* ---------- Content fade ---------- */
  const [contentVisible, setContentVisible] = useState(false)
  useEffect(() => {
    setContentVisible(false)
    const t = window.setTimeout(() => setContentVisible(true), contentDelayMs)
    return () => window.clearTimeout(t)
  }, [activeKey, contentDelayMs])

  /* ---------- Slides ---------- */
  const [slideIndex, setSlideIndex] = useState(0)
  const hasSlides = (slides?.length ?? 0) > 0
  const hasMultipleSlides = (slides?.length ?? 0) > 1 && !children
  const currentSlide = hasSlides ? slides![slideIndex] : undefined

  const nextSlide = () => {
    if (!slides || slides.length <= 1) return
    setSlideIndex((i) => (i + 1) % slides.length)
  }

  const prevSlide = () => {
    if (!slides || slides.length <= 1) return
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  /* ---------- Three.js refs ---------- */
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)

  /* ---------- Shaders ---------- */
  const vertexShader = useMemo(
    () => `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    []
  )

  const fragmentShader = useMemo(
    () => `
      precision highp float;
      varying vec2 vUv;
      uniform float time;
      uniform float scale;
      uniform float speed;
      uniform vec2 resolution;
      uniform vec3 color1, color2, color3, color4;
      uniform float ax, ay, az, aw;
      uniform float bx, by;

      float cheapNoise(vec3 stp) {
        vec3 p = vec3(stp.st, stp.p);
        vec4 a = vec4(ax, ay, az, aw);
        return mix(
          sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) *
          cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
          sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) *
          cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)),
          .436
        );
      }

      void main() {
        vec2 aR = vec2(resolution.x/resolution.y, 1.);
        vec2 st = vUv * aR * scale;
        float t = time * speed;
        float S = sin(t * .005);
        float C = cos(t * .005);

        vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
        vec2 v2 = vec2(
          cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * t)),
          cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * t))
        );

        float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));
        vec3 color = mix(color1, color2, clamp((n*n)*8.,0.0,1.0));
        color = mix(color, color3, clamp(length(v1),0.0,1.0));
        color = mix(color, color4, clamp(length(v2.x),0.0,1.0));
        color /= n*n + n * 7.;
        gl_FragColor = vec4(color, 1.);
      }
    `,
    []
  )

  /* ---------- Init three (desktop only) ---------- */
  useEffect(() => {
    if (isMobile) return

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const toVec3 = (hex: string) => {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return r
        ? new THREE.Vector3(
            parseInt(r[1], 16) / 255,
            parseInt(r[2], 16) / 255,
            parseInt(r[3], 16) / 255
          )
        : new THREE.Vector3(1, 1, 1)
    }

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    })

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(100, 100) },
        scale: { value: scale },
        speed: { value: speed },
        ax: { value: ax },
        ay: { value: ay },
        az: { value: az },
        aw: { value: aw },
        bx: { value: bx },
        by: { value: by },
        color1: { value: toVec3(colors[0]) },
        color2: { value: toVec3(colors[1]) },
        color3: { value: toVec3(colors[2]) },
        color4: { value: toVec3(colors[3]) },
      },
      transparent: true,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    materialRef.current = material

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h, false)
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      material.uniforms.resolution.value.set(w, h)
    }

    resize()
    window.addEventListener("resize", resize)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      material.uniforms.time.value = performance.now() / 1000
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      renderer.dispose()
      material.dispose()
      geometry.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, vertexShader, fragmentShader, colors.join("")])

  /* ---------- Push uniform updates ---------- */
  useEffect(() => {
    if (!materialRef.current) return
    const u = materialRef.current.uniforms
    u.scale.value = scale
    u.speed.value = speed
    u.ax.value = ax
    u.ay.value = ay
    u.az.value = az
    u.aw.value = aw
    u.bx.value = bx
    u.by.value = by
  }, [scale, speed, ax, ay, az, aw, bx, by])

  /* ---------- Resolve deck ---------- */
  const resolvedTitle = currentSlide?.title ?? title
  const resolvedSubtitle = currentSlide?.subtitle ?? subtitle
  const resolvedImageSrc = currentSlide?.imageSrc ?? "/city.png"
  const resolvedVideoSrc = currentSlide?.videoSrc ?? "/videos/video.mp4"
  const resolvedQrSrc = currentSlide?.qrSrc ?? "/qr/Xcited_Timeline-QR_Code.png"

  const panelHeight = embedded
    ? "100%"
    : `calc(${Math.round(viewportPortion * 100)}dvh - ${headerHeight})`

  return (
    <div
      className={`relative w-[92vw] md:w-[80vw] mx-auto ${className}`}
      style={{
        height: panelHeight,
        marginTop: embedded ? 0 : headerHeight,
      }}
    >
      {/* Background / shader */}
      <div className="absolute inset-0 rounded-[30px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {isMobile ? (
          <>
            <div
              className="absolute inset-0 animate-[mobileGradient_10s_ease_infinite] scale-[1.15] blur-[40px] saturate-[1.6]"
              style={{
                background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[3]} 100%)`,
                backgroundSize: "200% 200%",
              }}
            />
            <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-2xl" />
          </>
        ) : (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        )}
      </div>

      {/* Frame border */}
      <div className="absolute inset-[5px] rounded-[20px] overflow-hidden bg-black/75 backdrop-blur-md shadow-[inset_0_0_24px_rgba(0,0,0,0.35)] z-[5] pointer-events-none" />

      {/* Content glass (delayed fade-in) */}
      <div
        className="relative z-10 h-full p-0 md:p-6"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 700ms ease",
          willChange: "opacity",
        }}
      >
        <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/15 ring-1 ring-white/10 bg-white/[0.06] md:bg-black/20 backdrop-blur-2xl shadow-[0_0_60px_rgba(168,85,247,0.22),0_10px_30px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-20 left-1/2 h-56 w-[120%] -translate-x-1/2 rotate-[-8deg] bg-white/[0.10] blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/25" />
          </div>

          <div className="relative h-full w-full p-4 md:p-8 overflow-hidden">
            {children ? (
              <div className="h-full w-full overflow-hidden">{children}</div>
            ) : (
              <div className="flex flex-col md:flex-row h-full gap-6 overflow-hidden">
                <div className="w-full md:w-1/4 flex-shrink-0 h-full overflow-hidden">
                  <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={resolvedImageSrc}
                      alt="Project preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 h-full overflow-hidden">
                  <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    {resolvedVideoSrc ? (
                      <video
                        src={resolvedVideoSrc}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : resolvedQrSrc ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 p-12">
                        <div className="bg-white p-6 rounded-2xl aspect-square max-w-md w-full">
                          <img src={resolvedQrSrc} alt="QR Code" className="w-full h-full" />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {showText && (
                  <div className="w-full md:w-1/5 flex-shrink-0 flex flex-col justify-center text-left overflow-hidden">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg mb-3">
                      {resolvedTitle}
                    </h2>
                    <p className="opacity-80 text-xs md:text-sm lg:text-base leading-snug drop-shadow">
                      {resolvedSubtitle}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasMultipleSlides && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs md:text-sm hover:bg-black/80 transition"
          >
            Prev
          </button>
          <div className="flex items-center gap-2">
            {slides!.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-2.5 w-2.5 rounded-full border border-white/40 transition ${
                  i === slideIndex ? "bg-white" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs md:text-sm hover:bg-black/80 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* three.js resize target */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

      <style jsx global>{`
        @keyframes mobileGradient {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 50% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          75% {
            background-position: 50% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}