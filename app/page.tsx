// page.tsx
"use client"

import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Environment,
  Text,
  Preload,
  Points,
  PointMaterial,
} from "@react-three/drei"
import { Selection } from "@react-three/postprocessing"

import BackdropPanel from "./components/BackdropPanel"
import CursorSparkle from "./components/CursorSparkle"
import WallInstructions from "./components/WallInstructions"

import ModelLoader from "./components/ModelLoader"
import ScrambleText, { ScrambleHandle } from "./components/ScrambleText"
import { onUserClick, onModelClick } from "./events"
import CanvasBackground from "./components/CanvasBackground"
import ShaderFrame from "./components/ShaderFrame"
import SlideshowStack from "./components/SlideshowStack"
import VideoModelTexture from "./components/VideoModelTexture"
import { sections as sectionData } from "./lib/patterns"
import PuddleCitySurface from "./components/PuddleCitySurface"
import ShootingRain from "./components/ShootingRain"
import ImageWall from "./components/ImageWall"
import { SprayCursor3D } from "./components/SprayCursor3D" // if you're using this

/* ---------- Floating Particles ---------- */

function FloatingParticlesReactive({ count = 500 }: { count?: number }) {
  const [color, setColor] = useState<number>(0x39ff14)

  useEffect(() => {
    return onModelClick(({ color: c }) => {
      if (typeof c === "number") setColor(c)
    })
  }, [])

  const basePositions = useMemo(() => {
    const rng = (n: number) => {
      const x = Math.sin(n * 999) * 43758.5453
      return x - Math.floor(x)
    }
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (rng(i * 3 + 0) - 0.5) * 6
      arr[i * 3 + 1] = rng(i * 3 + 1) * 3
      arr[i * 3 + 2] = (rng(i * 3 + 2) - 0.5) * 6
    }
    return arr
  }, [count])

  const positions = useRef<Float32Array>(basePositions.slice(0))
  const pointsRef = useRef<THREE.Points>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.05
      pointsRef.current.rotation.z = Math.sin(t * 0.15) * 0.03
      ;(
        pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
      ).needsUpdate = true
    }
  })

  return (
    <Points ref={pointsRef} positions={positions.current} frustumCulled={false}>
      <PointMaterial
        transparent
        color={new THREE.Color(color)}
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  )
}

/* ---------- Intro Scene (bio text only) ---------- */

function IntroScene() {
  return (
    <>
      <Environment
        files="/hdr/studio_small_09_1k.hdr"
        background={false}
        environmentIntensity={1.0}
      />
      <fog attach="fog" args={["#000000", 2.5, 9]} />

      <group position={[-1, 0, 0]}>
        <group position={[1.4, -0.1, 2.5]}>
          <Text
            position={[0, 0.1, 0]}
            fontSize={0.015}
            font="/fonts/Inter.ttf"
            color="#ffffff"
            anchorX="right"
            anchorY="middle"
            maxWidth={0.75}
            lineHeight={1.1}
            outlineColor="#ff0080"
            outlineOpacity={1}
          >
            {`Hi! I'm Debbie, a frontend engineer based in Liverpool, UK. Welcome to my corner of the Internet, where I showcase my work, craft, unfinished or imperfect projects, and the many other things I'm exploring.

            Throughout the past 2 decade, I have worked with many startups building well designed, fast, and delightful user experiences. During this time, I continuously refined my craft by sharpening my eye through the inspiring work of many other creative developers, designers, and 3D artists and working hard on my engineering skills to meet my ever-evolving taste in visual design.

            My appetite for learning recently lead me to focus on what I believe is the future of the web: 3D, WebGL, and shaders.

            When not building, I like sharing what I learned on my blog, through interactive experiences and playgrounds. You can also find me running in the streets of NYC or just walking around enjoying a nice cup of coffee.`}
          </Text>
        </group>
      </group>

      <Preload all />
    </>
  )
}

/* ---------- Landing Scene (main content) ---------- */

function LandingScene({
  setIsOverWall,
}: {
  setIsOverWall: (value: boolean) => void
}) {
  const scrambleRef = useRef<ScrambleHandle>(null)
  const [hasScrambled, setHasScrambled] = useState(false)
  const currentFontRef = useRef("/fonts/Inversionz.ttf")

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrambleRef.current && !hasScrambled) {
        scrambleRef.current.scramble()
        setHasScrambled(true)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [hasScrambled])

  useEffect(() => {
    return onUserClick(() => {
      currentFontRef.current =
        currentFontRef.current === "/fonts/Inversionz.ttf"
          ? "/fonts/Artka.ttf"
          : "/fonts/Inversionz.ttf"

      if (scrambleRef.current) {
        scrambleRef.current.setFont(currentFontRef.current)
      }
    })
  }, [])

  return (
    <>
      <Environment
        files="/hdr/studio_small_09_1k.hdr"
        background={false}
        environmentIntensity={1.0}
      />
      <fog attach="fog" args={["#000000", 2.5, 9]} />

      <Selection>
        <group position={[-1, 0, 0]}>
          <BackdropPanel onWallHover={setIsOverWall} />

          <FloatingParticlesReactive />

          <group scale={1} position={[0, 0, -2]}>
            <ShootingRain />
            <ImageWall url="/city.png" position={[1, 1.5, 0]} />
          </group>

          <spotLight
            position={[-3, 1.5, 2]}
            intensity={1.15}
            angle={0.6}
            penumbra={0.8}
          />
          <spotLight position={[0, 2, -3.2]} intensity={1.2} color="#ffffff" />
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[3, 4, 2]}
            intensity={1.75}
            color="#ffffff"
            castShadow
          />

          <group scale={1} position={[0, -1, 0]}>
            <PuddleCitySurface puddleScale={0.8} />
          </group>

          <group scale={1.2} position={[0.8, 0.2, 0]}>
            <ScrambleText
              ref={scrambleRef}
              text={"wEb\nAuGmEnTeD"}
              fontUrl="/fonts/Inversionz.ttf"
              videoUrl="/videos/video.mp4"
              fontSize={0.45}
            />
          </group>

          <ModelLoader
            glbUrl="/models/gyro.glb"
            position={[2.7, 0.2, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.0013}
          />
        </group>
      </Selection>

      <Preload all />
    </>
  )
}

/* ---------- UI bits ---------- */

type HeaderProps = {
  active: number
  onJump: (i: number) => void
  sections: string[]
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

function Header({ active, onJump, sections }: HeaderProps) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
        background: "rgba(0,0,0,0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "0.875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Portfolio
        </div>
        <nav>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              padding: "0.25rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "9999px",
            }}
          >
            {sections.map((label, i) => (
              <button
                key={label}
                onClick={() => onJump(i)}
                style={{
                  padding: "0.375rem 1rem",
                  borderRadius: "9999px",
                  border:
                    i === active
                      ? "1px solid white"
                      : "1px solid rgba(255,255,255,0.3)",
                  background: i === active ? "white" : "transparent",
                  color:
                    i === active
                      ? "black"
                      : "rgba(255,255,255,0.7)",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

const ACCENTS = [
  { a: "#78E8FF", b: "#7C5CFF", c: "#FF6BD6" },
  { a: "#00aaff", b: "#44ccff", c: "#0055cc" },
  { a: "#8800cc", b: "#cc00ff", c: "#660099" },
  { a: "#00cc66", b: "#33ff99", c: "#99ff66" },
  { a: "#ff9900", b: "#ffcc33", c: "#ff6600" },
  { a: "#ff3399", b: "#ff66aa", c: "#ff0066" },
]

const SECTIONS = ["Landing", ...sectionData.map((s) => s.name)]

const colorPalettes: [string, string, string, string][] = SECTIONS.map(
  (_, idx) => {
    const acc = ACCENTS[idx] ?? ACCENTS[ACCENTS.length - 1]
    const { a, b, c } = acc
    return [a, b, c, b]
  }
)

const workSlides = [
  {
    image:
      "https://placehold.co/1920x1080/667eea/ffffff/png?text=Project+1",
    title: "Innovative AR experiences that transform reality",
    actions: [
      { label: "View Project", href: "#" },
      { label: "Learn More", href: "#" },
    ],
  },
  {
    image:
      "https://placehold.co/1920x1080/f093fb/ffffff/png?text=Project+2",
    title: "Immersive installations bridging physical and digital",
    actions: [
      { label: "Explore", href: "#" },
      { label: "Case Study", href: "#" },
    ],
  },
  {
    image:
      "https://placehold.co/1920x1080/4facfe/ffffff/png?text=Project+3",
    title: "Mixed reality solutions for modern challenges",
    actions: [
      { label: "Discover", href: "#" },
      { label: "Watch Demo", href: "#" },
    ],
  },
  {
    image:
      "https://placehold.co/1920x1080/00f2c3/ffffff/png?text=Project+4",
    title: "Cutting-edge web experiences that captivate",
    actions: [
      { label: "See More", href: "#" },
      { label: "Get Started", href: "#" },
    ],
  },
]

/* ---------- Page ---------- */

type Phase = "intro" | "main"

const INTRO_SECONDS = 30

export default function Page() {
  const [active, setActive] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isOverWall, setIsOverWall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const [phase, setPhase] = useState<Phase>("intro")
  const [introOpacity, setIntroOpacity] = useState(0)
  const [introSecondsLeft, setIntroSecondsLeft] =
    useState<number>(INTRO_SECONDS)

  const ids = useMemo(() => SECTIONS.map(slug), [])
  const mainRef = useRef<HTMLDivElement>(null)

  const [eventSrcEl, setEventSrcEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (mainRef.current) setEventSrcEl(mainRef.current)
  }, [])

  /* --- Phase timing: intro -> main --- */

  useEffect(() => {
    if (phase !== "intro") return

    // schedule switch to main after INTRO_SECONDS
    const timeout = setTimeout(() => {
      setPhase("main")
    }, INTRO_SECONDS * 1000)

    return () => clearTimeout(timeout)
  }, [phase])

  /* --- Intro opacity fade in / out --- */

  useEffect(() => {
    if (phase !== "intro") {
      setIntroOpacity(0)
      return
    }

    setIntroOpacity(0)

    // quick fade in so text appears almost immediately
    const fadeInId = setTimeout(() => setIntroOpacity(1), 50)
    // start fading out ~2s before switching to main
    const fadeOutId = setTimeout(
      () => setIntroOpacity(0),
      (INTRO_SECONDS - 2) * 1000
    )

    return () => {
      clearTimeout(fadeInId)
      clearTimeout(fadeOutId)
    }
  }, [phase])

  /* --- Intro countdown --- */

  useEffect(() => {
    if (phase !== "intro") {
      setIntroSecondsLeft(0)
      return
    }

    setIntroSecondsLeft(INTRO_SECONDS)

    const interval = setInterval(() => {
      setIntroSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase])

  /* --- Scroll + sections logic --- */

  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const handleScroll = () => {
      const scrollTop = main.scrollTop
      const firstSectionHeight = window.innerHeight
      setScrollProgress(Math.min(1, scrollTop / firstSectionHeight))
    }
    handleScroll()
    main.addEventListener("scroll", handleScroll, { passive: true })
    return () => main.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const main = mainRef.current
    if (!main) return
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = els.indexOf(entry.target as HTMLElement)
            if (index !== -1) {
              setActive(index)
              const url = new URL(window.location.href)
              url.searchParams.set("pattern", String(index))
              window.history.replaceState({}, "", url)
            }
          }
        }
      },
      { root: main, rootMargin: "0px 0px -60% 0px", threshold: 0.2 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])

  const handleJump = useCallback(
    (i: number) => {
      // If user clicks navigation during intro, skip straight to main
      if (phase === "intro") {
        setPhase("main")
      }

      setActive(i)
      const target = document.getElementById(ids[i])
      target?.scrollIntoView({ behavior: "smooth", block: "start" })

      const url = new URL(window.location.href)
      url.searchParams.set("pattern", String(i))
      window.history.replaceState({}, "", url)
    },
    [ids, phase] // <-- add phase here
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const patternParam = params.get("pattern")
    if (patternParam !== null) {
      const i = parseInt(patternParam, 10)
      if (!isNaN(i) && i >= 0 && i < SECTIONS.length) {
        requestAnimationFrame(() => {
          setActive(i)
          const target = document.getElementById(ids[i])
          target?.scrollIntoView({
            behavior: "instant" as ScrollBehavior,
            block: "start",
          })
        })
      }
    }
  }, [ids])

  const mainSceneOpacity =
    (phase === "main" ? 1 : 0) * (1 - scrollProgress)

  const countdownProgress =
    1 - introSecondsLeft / INTRO_SECONDS || 0

  useEffect(() => {
    if (phase === "intro" && active !== 0) {
      setPhase("main")
    }
  }, [active, phase])

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background:
          "radial-gradient(1200px 800px at 50% -10%, #0b0b12, #000000)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        html, body { overscroll-behavior: none; }
      `}</style>

      {/* Intro text scene with countdown (visible during intro phase) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: introOpacity,
          pointerEvents: phase === "intro" ? "auto" : "none",
          transition: "opacity 1.5s ease-in-out",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60, near: 0.1, far: 1000 }}
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.25,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          style={{ width: "100%", height: "100%" }}
        >
          <IntroScene />
        </Canvas>

        {/* Countdown overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "2rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.35rem",
              opacity: 0.9,
            }}
          >
            Main scene in {introSecondsLeft.toString().padStart(2, "0")}s
          </div>
          <div
            style={{
              width: "200px",
              height: "4px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  Math.max(countdownProgress * 100, 0),
                  100
                )}%`,
                height: "100%",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, #ff0080, #ffdd00)",
                transition: "width 0.2s linear",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main landing 3D scene (loads immediately, fades in after intro) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: mainSceneOpacity,
          pointerEvents: phase === "main" ? "auto" : "none",
          transition: "opacity 1.5s ease-in-out",
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 3], fov: 60, near: 0.1, far: 1000 }}
          dpr={[1, 1.75]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.25,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          shadows={{ type: THREE.PCFSoftShadowMap }}
          eventSource={eventSrcEl ?? undefined}
          eventPrefix="client"
          style={{ width: "100%", height: "100%" }}
        >
          <LandingScene setIsOverWall={setIsOverWall} />
          <SprayCursor3D enabled={isOverWall} />
        </Canvas>

        <CursorSparkle enabled={isOverWall} />

        <WallInstructions
          show={showInstructions}
          onDismiss={() => setShowInstructions(false)}
        />
      </div>

      {/* Background for later sections */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: scrollProgress,
          pointerEvents: "none",
          transition: "opacity 0.3s ease-out",
        }}
      >
        <CanvasBackground activeIndex={Math.max(0, active - 1)} />
      </div>

      <div style={{ position: "relative", zIndex: 20 }}>
        <Header sections={SECTIONS} active={active} onJump={handleJump} />
      </div>

      <main
        ref={mainRef}
        style={{
          height: "100vh",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          scrollPaddingTop: "80px",
          position: "relative",
          zIndex: 10,
          pointerEvents: "auto",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        <section
          id={ids[0]}
          data-index={0}
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            pointerEvents: "auto",
          }}
        />

        {sectionData.map((section, idx) => {
          const i = idx + 1
          const isWorkSection = section.name.toLowerCase() === "work"
          const isARSection =
            section.name.toLowerCase() === "showreel"

          return (
            <section
              key={section.name}
              id={ids[i]}
              data-index={i}
              style={{
                minHeight: "100vh",
                scrollSnapAlign: "start",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                pointerEvents: "auto",
              }}
            >
              {isWorkSection ? (
                <div
                  style={{
                    width: "100%",
                    maxWidth: "1200px",
                    aspectRatio: "16 / 9",
                  }}
                >
                  <SlideshowStack slides={workSlides} />
                </div>
              ) : isARSection ? (
                <VideoModelTexture />
              ) : (
                <ShaderFrame
                    title={section.name}
                    subtitle={section.text}
                    colors={
                      colorPalettes[i] ?? [
                        "#a855f7",
                        "#ec4899",
                        "#8b5cf6",
                        "#d946ef",
                      ]
                    }
                    slides={[
                      {
                        title: "Intro",
                        subtitle: "High-level overview of the project.",
                        imageSrc: "/city.png",
                        videoSrc: "/videos/intro.mp4",
                      },
                      {
                        title: "Timeline",
                        subtitle: "Key milestones and phases.",
                        imageSrc: "/city-timeline.png",
                        qrSrc: "/qr/Xcited_Timeline-QR_Code.png",
                      },
                      {
                        title: "Impact",
                        subtitle: "What success looks like.",
                        imageSrc: "/city-impact.png",
                        videoSrc: "/videos/impact.mp4",
                      },
                    ]}
                  />
              )}
            </section>
          )
        })}
      </main>
    </div>
  )
}