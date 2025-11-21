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
import ArchivePortal from "./components/ArchivePortal"
import VideoModelTexture from "./components/VideoModelTexture"
import { sections as sectionData } from "./lib/patterns"
import PuddleCitySurface from "./components/PuddleCitySurface"
import ShootingRain from "./components/ShootingRain"
import ImageWall from "./components/ImageWall"
import { SprayCursor3D } from "./components/SprayCursor3D"
import { CyberpunkSkyline } from "./components/CyberpunkSkyline"
import CityModel from "./components/CityModel"

/* ---------- Types ---------- */

type HeaderProps = {
  active: number
  onJump: (i: number) => void
  sections: string[]
}

type Phase = "intro" | "main"

type MusicVideo = {
  src: string
  title: string
}

type ArtSlide =
  | {
      id: number
      heroSrc: string
      heroAlt: string
      kind: "facebook"
      title: string
      body: string
      facebookSrc: string
    }
  | {
      id: number
      heroSrc: string
      heroAlt: string
      kind: "video"
      title: string
      body: string
      videoSrc: string
    }

/* ---------- Helpers & constants ---------- */

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const ACCENTS = [
  { a: "#78E8FF", b: "#7C5FF", c: "#FF6BD6" },
  { a: "#00aaff", b: "#44ccff", c: "#0055cc" },
  { a: "#8800cc", b: "#cc00ff", c: "#660099" },
  { a: "#00cc66", b: "#33ff99", c: "#99ff66" },
  { a: "#ff9900", b: "#ffcc33", c: "#ff6600" },
  { a: "#ff3399", b: "#ff66aa", c: "#ff0066" },
]

const SECTIONS = [
  "Graffiti Fun - Interactive Surface Study",
  ...sectionData.map((s) => s.name),
]

const colorPalettes: [string, string, string, string][] = SECTIONS.map(
  (_, idx) => {
    const acc = ACCENTS[idx] ?? ACCENTS[ACCENTS.length - 1]
    const { a, b, c } = acc
    return [a, b, c, b]
  }
)

// Music videos (grid + overlay)
const musicVideos: MusicVideo[] = [
  {
    src: "/videos/music1.mp4",
    title: "Neon Drift",
  },
  {
    src: "/videos/music2.mp4",
    title: "Rain City Loops",
  },
  {
    src: "/videos/music3.mp4",
    title: "Glitch Bloom",
  },
  {
    src: "/videos/music4.mp4",
    title: "Analog Ghosts",
  },
  {
    src: "/videos/music5.mp4",
    title: "Chromatic Pulse",
  },
  {
    src: "/videos/music6.mp4",
    title: "Midnight Debug",
  },
]

// Art section slides: hero + video + text
const artSlides: ArtSlide[] = [
  {
    id: 0,
    heroSrc: "/city.png",
    heroAlt: "Graffiti wall – AR demo",
    kind: "facebook",
    title: "Graffiti Wall – AR Surface Study",
    body: "An interactive AR graffiti wall experiment combining WebGL, shaders, and real-time spray interactions.",
    facebookSrc:
      "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fdebbie.brooks.3367%2Fvideos%2F10157338752441791%2F&show_text=false&width=267&t=0",
  },
  {
    id: 1,
    heroSrc: "/city-alt.png", // make sure this asset exists or swap it
    heroAlt: "Concept sketches and stills",
    kind: "video",
    title: "Process & Concept Sketches",
    body: "Behind-the-scenes look at motion studies, concept art, and shader explorations that informed the final wall.",
    videoSrc: "/videos/art-process.mp4", // make sure this exists or change
  },
]

const INTRO_SECONDS = 5

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
        pointsRef.current.geometry.attributes
          .position as THREE.BufferAttribute
      ).needsUpdate = true
    }
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions.current}
      frustumCulled={false}
    >
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
        <group position={[0, -3, -4]}>
          <CityModel />
        </group>

        <CyberpunkSkyline
          position={[0, -1, -20]}
          girlTextureUrl="/videos/girl_pha_v2.png"
        />

        <group position={[-1, 0, -0.5]}>
          <BackdropPanel
            girlBillboardPosition={[-2.2, -0.2]}
            girlBillboardZOffset={0.1}
            showGirlBillboard={true}
            girlBillboardSize={[2, 1.5]}
            girlFps={5}
            onWallHover={setIsOverWall}
          />

          <FloatingParticlesReactive />

          <group scale={1} position={[0, 0, -2]}>
            <ShootingRain />
            {/* <ImageWall url="/city.png" position={[1, 1.5, 0]} /> */}
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

          <group scale={[2, 1, 1]} position={[1, -1, 0.1]}>
            <PuddleCitySurface puddleScale={0.8} />
          </group>

          <group scale={1.2} position={[1, 0.2, 0]}>
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
            position={[3, 0.6, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.001}
          />
        </group>
      </Selection>

      <Preload all />
    </>
  )
}

/* ---------- Header ---------- */

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
          Debbie Brooks - Web Augmented Ltd
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

/* ---------- Page ---------- */

export default function Page() {
  const [active, setActive] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isOverWall, setIsOverWall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)

  const [phase, setPhase] = useState<Phase>("intro")
  const [introOpacity, setIntroOpacity] = useState(0)
  const [introSecondsLeft, setIntroSecondsLeft] =
    useState<number>(INTRO_SECONDS)

  // Art section slider state
  const [slide, setSlide] = useState(0)

  // Music overlay state
  const [selectedMusicVideo, setSelectedMusicVideo] =
    useState<MusicVideo | null>(null)

  const ids = useMemo(() => SECTIONS.map(slug), [])
  const mainRef = useRef<HTMLDivElement>(null)
  const [eventSrcEl, setEventSrcEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (mainRef.current) setEventSrcEl(mainRef.current)
  }, [])

  // Ensure spray cursor is disabled outside graffiti section
  useEffect(() => {
    if (active !== 0 && isOverWall) {
      setIsOverWall(false)
    }
  }, [active, isOverWall])

  /* --- Phase timing: intro -> main --- */

  useEffect(() => {
    if (phase !== "intro") return

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

    const fadeInId = setTimeout(() => setIntroOpacity(1), 50)
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
    [ids, phase]
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

  /* ---------- Render ---------- */

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

      {/* Intro text scene */}
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

      {/* Main landing 3D scene */}
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

      {/* Main scrolling content */}
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
        {/* Top spacer section for graffiti scene */}
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
          const lowerName = section.name.toLowerCase()
          const isWorkSection = lowerName === "work"
          const isARSection = lowerName === "showreel"
          const isArtSection = lowerName === "art"
          const isMusicSection = lowerName === "music"
          const isAboutSection = lowerName === "about"

          let content: React.ReactNode = null

          if (isWorkSection) {
            content = (
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  aspectRatio: "16 / 9",
                }}
              >
                <ArchivePortal />
                {/* <SlideshowStack slides={workSlides} /> */}
              </div>
            )
          } else if (isARSection) {
            content = <VideoModelTexture />
          } else if (isArtSection) {
            const totalArtSlides = artSlides.length
            const currentArtSlide =
              artSlides[slide % totalArtSlides]

            const goPrev = () =>
              setSlide(
                (prev) => (prev - 1 + totalArtSlides) % totalArtSlides
              )
            const goNext = () =>
              setSlide((prev) => (prev + 1) % totalArtSlides)

            content = (
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
                showText={false}
              >
                {/* Outer layout: big arrows outside the inner frame */}
                <div className="flex items-center gap-6 h-full pointer-events-auto">
                  {/* Left Arrow – outside frame, bigger */}
                  <button
                    onClick={goPrev}
                    className="
                      hidden md:flex
                      items-center justify-center
                      rounded-full border border-white/40 bg-black/60
                      hover:bg-black/80 hover:scale-105
                      transition-transform transition-colors
                      w-14 h-14 text-3xl
                      shrink-0
                    "
                  >
                    ‹
                  </button>

                  {/* Mobile-friendly small arrow above content */}
                  <button
                    onClick={goPrev}
                    className="
                      md:hidden
                      absolute left-4 top-4 z-10
                      rounded-full bg-black/70 px-3 py-2 text-lg
                    "
                  >
                    ‹
                  </button>

                  {/* Inner framed content */}
                  <div className="flex-1 flex flex-col md:flex-row h-full gap-6">
                    {/* Left: hero image, changes per slide */}
                    <div className="w-full md:w-1/3 flex-shrink-0 h-full">
                      <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img
                          src={currentArtSlide.heroSrc}
                          alt={currentArtSlide.heroAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Right: video + text block */}
                    <div className="flex-1 h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex flex-col md:flex-row">
                      {/* Video / embed */}
                      <div className="flex-1 flex items-center justify-center p-4">
                        {currentArtSlide.kind === "facebook" && (
                          <iframe
                            src={currentArtSlide.facebookSrc}
                            width="267"
                            height="476"
                            style={{
                              border: "none",
                              overflow: "hidden",
                            }}
                            scrolling="no"
                            frameBorder={0}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        )}

                        {currentArtSlide.kind === "video" &&
                          "videoSrc" in currentArtSlide && (
                            <video
                              src={currentArtSlide.videoSrc}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          )}
                      </div>

                      {/* Text content */}
                      <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 p-5 flex flex-col justify-center">
                        <h2 className="text-xl md:text-2xl font-semibold mb-3 text-white">
                          {currentArtSlide.title}
                        </h2>
                        <p className="text-sm md:text-base text-white/80 leading-relaxed">
                          {currentArtSlide.body}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Arrow – outside frame, bigger */}
                  <button
                    onClick={goNext}
                    className="
                      hidden md:flex
                      items-center justify-center
                      rounded-full border border-white/40 bg-black/60
                      hover:bg-black/80 hover:scale-105
                      transition-transform transition-colors
                      w-14 h-14 text-3xl
                      shrink-0
                    "
                  >
                    ›
                  </button>

                  {/* Mobile-friendly small arrow above content */}
                  <button
                    onClick={goNext}
                    className="
                      md:hidden
                      absolute right-4 top-4 z-10
                      rounded-full bg-black/70 px-3 py-2 text-lg
                    "
                  >
                    ›
                  </button>
                </div>

                {/* Slide Indicator Below Full Layout */}
                <div className="w-full text-center mt-6 text-sm tracking-[0.2em] uppercase text-white/60">
                  Slide {currentArtSlide.id + 1} / {totalArtSlides}
                </div>
              </ShaderFrame>
            )
          } else if (isMusicSection) {
            content = (
              <ShaderFrame
                title={section.name}
                subtitle={section.text}
                colors={
                  colorPalettes[i] ?? [
                    "#22c55e",
                    "#06b6d4",
                    "#4f46e5",
                    "#a855f7",
                  ]
                }
                showText={false}
              >
                <div className="h-full flex flex-col md:flex-row gap-6 pointer-events-auto">
                  {/* Bandcamp embed */}
                  <div className="w-full md:w-[350px] flex-shrink-0">
                    <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-4">
                      <iframe
                        style={{
                          border: 0,
                          width: "100%",
                          height: "470px",
                        }}
                        src="https://bandcamp.com/EmbeddedPlayer/album=3691821394/size=large/bgcol=333333/linkcol=9a64ff/tracklist=false/transparent=true/"
                        seamless
                      >
                        <a href="https://debxox.bandcamp.com/album/14-nonanalgous-tracks-2015-2018">
                          14 nonanalgous tracks 2015-2018 by debx0x
                        </a>
                      </iframe>
                    </div>
                  </div>

                  {/* Headline + 6 wide-screen video tiles */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Headline text */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 px-5 py-4">
                      <h2 className="text-lg md:text-xl font-semibold mb-1">
                        debx0x
                      </h2>
                      <p className="text-xs md:text-sm opacity-80 leading-snug">
                        debx0x is my personal music project where I handle
                        everything – production, composition, and all visual
                        content including music videos.
                      </p>
                    </div>

                    {/* 6 widescreen tiles */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {musicVideos.map((video, idx2) => {
                        const hasSrc = !!video.src
                        return (
                          <div
                            key={idx2}
                            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60"
                          >
                            {hasSrc ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedMusicVideo(video)
                                }
                                className="absolute inset-0 w-full h-full group cursor-pointer"
                              >
                                <video
                                  src={video.src}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                />

                                {/* Dark gradient + title at bottom */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-2">
                                  <p className="text-[10px] md:text-xs font-medium text-white/90 tracking-[0.16em] uppercase truncate">
                                    {video.title}
                                  </p>
                                </div>

                                {/* Optional hover hint */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/80">
                                    Tap to enlarge
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                                <div className="mb-2 text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/40">
                                  Video Placeholder
                                </div>
                                <div className="h-10 w-16 rounded-md border border-dashed border-white/20" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </ShaderFrame>
            )
          } else if (isAboutSection) {
            content = (
              <ShaderFrame
                title={section.name}
                subtitle={section.text}
                colors={
                  colorPalettes[i] ?? [
                    "#fbbf24",
                    "#fb923c",
                    "#f87171",
                    "#f472b6",
                  ]
                }
                showText={false}
              >
                <div className="text-white space-y-4 text-sm md:text-base">
                  <div>
                    <h3 className="font-semibold mb-1">Profile</h3>
                    <p className="text-white/80">
                      Frontend engineer and creative technologist exploring
                      WebGL, shaders, and immersive web experiences.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Tech Stack</h3>
                    <p className="text-white/80">
                      React, TypeScript, Next.js, Three.js, React Three Fiber,
                      GLSL shaders, WebGL.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Video Editing</h3>
                    <p className="text-white/80">
                      End-to-end video and motion design for music videos,
                      installations, and interactive experiences.
                    </p>
                  </div>
                </div>
              </ShaderFrame>
            )
          } else {
            content = (
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
              />
            )
          }

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
              {content}
            </section>
          )
        })}
      </main>

      {/* ⭐ Music video overlay */}
      {selectedMusicVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          {/* Clickable backdrop to close */}
          <button
            type="button"
            onClick={() => setSelectedMusicVideo(null)}
            className="absolute inset-0 w-full h-full cursor-default"
          />

          <div className="relative w-full max-w-4xl px-4">
            {/* Title above video */}
            <div className="mb-3 text-center text-xs md:text-sm uppercase tracking-[0.2em] text-white/70">
              {selectedMusicVideo.title}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedMusicVideo(null)}
              className="absolute -top-10 right-4 rounded-full bg-black/80 border border-white/40 w-10 h-10 flex items-center justify-center text-2xl leading-none text-white hover:bg-black"
            >
              ×
            </button>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black">
              <video
                src={selectedMusicVideo.src}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                controls
                playsInline
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}