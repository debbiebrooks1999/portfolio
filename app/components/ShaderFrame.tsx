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
  showControls?: boolean
  className?: string
  /** Optional slide deck – if length > 1 and no children, navigation appears */
  slides?: Slide[]
  /** Show the default right-hand text column in the built-in layout */
  showText?: boolean
  /** Custom inner layout. If provided, replaces the default 3-column layout entirely. */
  children?: React.ReactNode
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
  showControls = false,
  className = "",
  slides,
  showText = true,
  children,
}: ShaderFrameProps) {
  /* ---------- Mobile fallback ---------- */

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const m =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768
    setIsMobile(m)
  }, [])

  /* ---------- Shader controls ---------- */

  const [scale, setScale] = useState(initial.scale)
  const [speed, setSpeed] = useState(initial.speed)
  const [ax, setAx] = useState(initial.ax)
  const [ay, setAy] = useState(initial.ay)
  const [az, setAz] = useState(initial.az)
  const [aw, setAw] = useState(initial.aw)
  const [bx, setBx] = useState(initial.bx)
  const [by, setBy] = useState(initial.by)

  /* ---------- Slides state ---------- */

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
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)

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

  /* ---------- Init three ---------- */

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
      if (!renderer || !container) return
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height, false)
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      material.uniforms.resolution.value.set(width, height)
    }

    resize()
    window.addEventListener("resize", resize)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const time = performance.now() / 1000.0
      material.uniforms.time.value = time
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

  /* ---------- Push control updates ---------- */

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

  /* ---------- Resolve content from slide/main props ---------- */

  const resolvedTitle = currentSlide?.title ?? title
  const resolvedSubtitle = currentSlide?.subtitle ?? subtitle
  const resolvedImageSrc = currentSlide?.imageSrc ?? "/city.png"
  const resolvedVideoSrc = currentSlide?.videoSrc ?? "/videos/video.mp4"
  const resolvedQrSrc =
    currentSlide?.qrSrc ?? "/qr/Xcited_Timeline-QR_Code.png"

  return (
    <div
      className={`relative w-[80vw] h-[80vh] ${className}`}
    >
      {/* Beveled frame + shader canvas */}
      <div className="absolute inset-0 rounded-[30px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {isMobile ? (
          <div
            className="w-full h-full animate-[mobileGradient_8s_ease_infinite] scale-[1.2] blur-[40px] saturate-[1.5]"
            style={{
              background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 33%, ${colors[2]} 66%, ${colors[3]} 100%)`,
              backgroundSize: "200% 200%",
            }}
          />
        ) : (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        )}
      </div>

      {/* Border overlay */}
      <div className="absolute inset-[5px] rounded-[20px] overflow-hidden bg-black/85 backdrop-blur-md shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] z-[5] pointer-events-none" />

      {/* Glass content overlay */}
      <div className="relative z-10 h-full flex items-center justify-center p-6 pointer-events-none">
        <div className="backdrop-blur-2xl bg-black/20 border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.3),0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5 w-full h-full max-w-7xl max-h-[85vh] flex flex-col p-8">
          {children ? (


            // Custom layout (Art / Music, etc.)
            <div className="h-full w-full pointer-events-auto">{children}</div>


          ) : (
            // Default 3-column layout
            <div className="flex flex-col md:flex-row h-full gap-6">
              {/* Left: Image */}
              <div className="w-full md:w-1/4 flex-shrink-0 h-full">
                <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <img
                    src={resolvedImageSrc}
                    alt="Project preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Middle: Video / QR */}
              <div className="flex-1 h-full pointer-events-auto">
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
                        <img
                          src={resolvedQrSrc}
                          alt="QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right: Text */}
              {showText && (
                <div className="w-full md:w-1/5 flex-shrink-0 flex flex-col justify-center text-left">
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

      {/* Slide navigation (only if slides > 1 and no custom children) */}
      {hasMultipleSlides && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 pointer-events-auto">
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

      {/* resize observer target */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Optional controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 w-[260px]">
          <h3 className="text-sm font-semibold mb-3">Controls</h3>
          <Slider
            label="Scale"
            value={scale}
            onChange={setScale}
            min={0.1}
            max={4}
            step={0.01}
          />
          <Slider
            label="Speed"
            value={speed}
            onChange={setSpeed}
            min={0.1}
            max={3}
            step={0.1}
          />
          <Slider
            label="ax"
            value={ax}
            onChange={setAx}
            min={1}
            max={15}
            step={0.01}
          />
          <Slider
            label="ay"
            value={ay}
            onChange={setAy}
            min={1}
            max={15}
            step={0.01}
          />
          <Slider
            label="az"
            value={az}
            onChange={setAz}
            min={1}
            max={15}
            step={0.01}
          />
          <Slider
            label="aw"
            value={aw}
            onChange={setAw}
            min={1}
            max={15}
            step={0.01}
          />
          <Slider
            label="bx"
            value={bx}
            onChange={setBx}
            min={-1}
            max={1}
            step={0.01}
          />
          <Slider
            label="by"
            value={by}
            onChange={setBy}
            min={-1}
            max={1}
            step={0.01}
          />
        </div>
      )}

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

/* ---------- Slider ---------- */

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs opacity-80 mb-1">
        {label}:{" "}
        <span className="text-[11px] opacity-60">{value.toFixed(2)}</span>
      </label>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}