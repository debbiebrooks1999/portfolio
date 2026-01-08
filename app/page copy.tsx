// app/page.tsx
"use client"

import React, { useMemo, useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Environment,
  Preload,
  Points,
  PointMaterial,
  useProgress,
} from "@react-three/drei"
import { Selection } from "@react-three/postprocessing"
import Header from "./components/Header"

import BackdropPanel from "./components/BackdropPanel"
import CursorSparkle from "./components/CursorSparkle"
import ModelLoader from "./components/ModelLoader"
import ScrambleText, { ScrambleHandle } from "./components/ScrambleText"
import { onUserClick, onModelClick } from "./events"
import CanvasBackground from "./components/CanvasBackground"
import ShaderFrame from "./components/ShaderFrame"
import ArchivePortal from "./components/ArchivePortal"
import VideoModelTexture from "./components/VideoModelTexture"
import { sections as sectionData } from "./lib/patterns"
import PuddleCitySurface from "./components/PuddleCitySurface"
import ShootingRain from "./components/ShootingRain"
import { SprayCursor3D } from "./components/SprayCursor3D"
import { CyberpunkSkyline } from "./components/CyberpunkSkyline"
import CityModel from "./components/CityModel"
import EnhancedAbout from "./components/EnhancedAbout"
import VATRoseSystem from "./components/VATRoseSystem"
import TerminalTypewriter from "./components/TerminalTypewriter"
import MusicSection from "./components/MusicSection"

import {
  CAMERA_CONFIG,
  musicVideos,
  BIO_TEXT,
  MUSIC_CONTENT,
  slug,
  generateColorPalettes,
  type MusicVideo,
} from "./content-data"


type Phase = "boot" | "main"

/* ---------- Constants ---------- */

const SECTIONS = [
  "Graffiti Fun - Interactive Surface Study",
  ...sectionData.map((s) => s.name),
]
const colorPalettes = generateColorPalettes(SECTIONS)
const GRAFFITI_INDEX = 0
const MAIN_FADE_MS = 160

/* ---------- Boot Overlay ---------- */

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
        {/* Skip appears ONLY once assets are fully loaded */}
        {assetsDone && (
    <button
        type="button"
        onClick={onSkip}
        className="tty-skip"
        aria-label="Skip intro"
        >
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

              text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 20px #00ff00,
                0 0 40px #00ff00;

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

/* ---------- Camera Controller (Intro Animation + Rotation) ---------- */

function CameraController({
  animStarted,
  introComplete,
  setIntroComplete,
  introProgress,
  introDuration,
  introStartZ,
  introTargetZ,
  introStartY,
  introTargetY,
  targetRotationY,
  currentRotationY,
  clampZMin,
  clampZMax,
}: {
  animStarted: boolean
  introComplete: boolean
  setIntroComplete: (value: boolean) => void
  introProgress: React.MutableRefObject<number>
  introDuration: number
  introStartZ: number
  introTargetZ: number
  introStartY: number
  introTargetY: number
  targetRotationY: React.MutableRefObject<number>
  currentRotationY: React.MutableRefObject<number>
  clampZMin: number
  clampZMax: number
}) {
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

  useFrame(({ camera }, delta) => {
    if (!animStarted) {
      camera.position.z = introStartZ
      camera.position.y = introStartY
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        clampZMin,
        clampZMax
      )
      return
    }

    if (!introComplete) {
      introProgress.current += delta
      const t = Math.min(introProgress.current / introDuration, 1.0)
      const easedT = easeOutCubic(t)

      camera.position.z = introStartZ + (introTargetZ - introStartZ) * easedT
      camera.position.y = introStartY + (introTargetY - introStartY) * easedT
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        clampZMin,
        clampZMax
      )

      if (t >= 1.0) setIntroComplete(true)
      return
    }

    const lerpFactor = CAMERA_CONFIG.LERP_FACTOR
    currentRotationY.current +=
      (targetRotationY.current - currentRotationY.current) * lerpFactor
    camera.rotation.y = currentRotationY.current
    camera.position.z = THREE.MathUtils.clamp(
      camera.position.z,
      clampZMin,
      clampZMax
    )
  })

  return null
}

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

/* ---------- Landing Scene (main content) ---------- */

function LandingScene({
  setIsOverWall,
  enabled,
  isMobile,
}: {
  setIsOverWall: (value: boolean) => void
  enabled: boolean
  isMobile: boolean
}) {
  const scrambleRef = useRef<ScrambleHandle>(null)
  const [hasScrambled, setHasScrambled] = useState(false)
  const currentFontRef = useRef("/fonts/Inversionz.ttf")

  const setCursor = useCallback((cursor: string) => {
    document.body.style.cursor = cursor
  }, [])

  useEffect(() => {
    return () => setCursor("auto")
  }, [setCursor])

  const [cameraIntroComplete, setCameraIntroComplete] = useState(false)
  const [cameraAnimStarted, setCameraAnimStarted] = useState(false)
  const cameraIntroProgress = useRef(0)

  const mouseX = useRef(0)
  const targetRotationY = useRef(0)
  const currentRotationY = useRef(0)

  const introTargetZ = useMemo(
  () => (isMobile ? CAMERA_CONFIG.INTRO_TARGET_Z_MOBILE : CAMERA_CONFIG.INTRO_TARGET_Z),
  [isMobile]
)

  const { clampZMin, clampZMax } = useMemo(() => {
    const minZ = Math.min(
      CAMERA_CONFIG.INTRO_START_Z,
      CAMERA_CONFIG.INTRO_TARGET_Z
    )
    const maxZ = Math.max(
      CAMERA_CONFIG.INTRO_START_Z,
      CAMERA_CONFIG.INTRO_TARGET_Z
    )
    return { clampZMin: minZ - 0.1, clampZMax: maxZ + 0.1 }
  }, [])

  // mouse rotation only when enabled + intro complete
  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!cameraIntroComplete) return
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1
      targetRotationY.current = mouseX.current * CAMERA_CONFIG.ROTATION_AMOUNT
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [cameraIntroComplete, enabled])

  // START zoom animation ONLY when enabled
  useEffect(() => {
    if (!enabled) return
    if (cameraAnimStarted) return

    // ✅ Start ~4s sooner than before
    const fasterDelayMs = Math.max(0, CAMERA_CONFIG.INTRO_SCENE_DELAY - 4000)

    const timer = window.setTimeout(() => {
      if (scrambleRef.current && !hasScrambled) {
        scrambleRef.current.scramble()
        setHasScrambled(true)
      }
      setCameraAnimStarted(true)
    }, fasterDelayMs)

    return () => window.clearTimeout(timer)
  }, [enabled, cameraAnimStarted, hasScrambled])

  useEffect(() => {
    return onUserClick(() => {
      if (!enabled) return
      currentFontRef.current =
        currentFontRef.current === "/fonts/Inversionz.ttf"
          ? "/fonts/Artka.ttf"
          : "/fonts/Inversionz.ttf"

      scrambleRef.current?.setFont(currentFontRef.current)
    })
  }, [enabled])

  return (
    <>
      <Environment
        files="/hdr/studio_small_09_1k.hdr"
        background={false}
        environmentIntensity={1.0}
      />
      <fog attach="fog" args={["#000000", 2.5, 9]} />

      <CameraController
          animStarted={enabled && cameraAnimStarted}
          introComplete={cameraIntroComplete}
          setIntroComplete={setCameraIntroComplete}
          introProgress={cameraIntroProgress}
          introDuration={CAMERA_CONFIG.INTRO_DURATION}
          introStartZ={CAMERA_CONFIG.INTRO_START_Z}
          introTargetZ={introTargetZ}                 
          introStartY={CAMERA_CONFIG.INTRO_START_Y}
          introTargetY={CAMERA_CONFIG.INTRO_TARGET_Y}
          targetRotationY={targetRotationY}
          currentRotationY={currentRotationY}
          clampZMin={clampZMin}                      
          clampZMax={clampZMax}
      />

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

          <group
            scale={[0.5, 0.5, 0.5]}
            position={[0, -1, 0.78]}
            rotation={[0.349, 0, 0]}
          >
            <VATRoseSystem groundY={-0.5} size={20} />
          </group>

          <group scale={[2, 1, 1]} position={[1, -1, 0.1]}>
            <group
              onPointerOver={(e) => {
                if (!enabled) return
                e.stopPropagation()
                setCursor("pointer")
              }}
              onPointerOut={() => setCursor("auto")}
            >
              <PuddleCitySurface />
            </group>
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


/* ---------- Page ---------- */

export default function Page() {

  const [phase, setPhase] = useState<Phase>("boot")
  // asset progress from drei (kept)
  const { progress, active: loadingActive } = useProgress()
  const assetsDone = !loadingActive && progress >= 100

  // boot gating: terminal + assets
  const [terminalDone, setTerminalDone] = useState(false)
  const [bootVisible, setBootVisible] = useState(true)

  // Add mobile detection
  const getIsMobile = () => {
    if (typeof window === "undefined") return true

    const uaMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

  const coarsePointer =
    window.matchMedia?.("(pointer: coarse)")?.matches ?? false

  const smallScreen =
    window.matchMedia?.("(max-width: 767px)")?.matches ?? window.innerWidth < 768

  return uaMobile || coarsePointer || smallScreen
}
  const [isMobile, setIsMobile] = useState(getIsMobile)

  useEffect(() => {
    const onChange = () => setIsMobile(getIsMobile())
    onChange()
    window.addEventListener("resize", onChange)
    window.addEventListener("orientationchange", onChange)
    return () => {
      window.removeEventListener("resize", onChange)
      window.removeEventListener("orientationchange", onChange)
    }
  }, [])

  // Move to main only once typing is done AND assets are done
  useEffect(() => {
    if (phase === "main") return
    if (!terminalDone) return
    if (!assetsDone) return

    setBootVisible(false)
    window.setTimeout(() => setPhase("main"), 450)
  }, [phase, terminalDone, assetsDone])

  // Skip (button only appears at 100%, but guard anyway)
  const handleSkip = useCallback(() => {
    if (!assetsDone) return
    setBootVisible(false)
    setPhase("main")
  }, [assetsDone])

  const [active, setActive] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isOverWall, setIsOverWall] = useState(false)

  const [bgOpacity, setBgOpacity] = useState(0)
  const [bgTransitionMs, setBgTransitionMs] = useState(200)

  const [selectedMusicVideo, setSelectedMusicVideo] = useState<MusicVideo | null>(
    null
  )

  const ids = useMemo(() => SECTIONS.map(slug), [])
  const mainRef = useRef<HTMLDivElement>(null)
  const scrollLockUntilRef = useRef(0)
  const [eventSrcEl, setEventSrcEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (mainRef.current) setEventSrcEl(mainRef.current)
  }, [])

  const setBackgroundForIndex = useCallback((i: number, source: string) => {
    const next = i === GRAFFITI_INDEX ? 0 : 1
    const ms = next === 1 ? 80 : 200
    setBgTransitionMs(ms)
    setBgOpacity(next)
  }, [])

  // Scroll progress
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    const handleScroll = () => {
      if (Date.now() < scrollLockUntilRef.current) return
      const scrollTop = main.scrollTop
      const firstSectionHeight = main.clientHeight || window.innerHeight
      setScrollProgress(Math.min(1, scrollTop / firstSectionHeight))
    }

    handleScroll()
    main.addEventListener("scroll", handleScroll, { passive: true })
    return () => main.removeEventListener("scroll", handleScroll)
  }, [])

  // Intersection observer for active section
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
              setBackgroundForIndex(index, "intersection")

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
  }, [ids, setBackgroundForIndex])

  // Jump handler (disabled during boot)
  const handleJump = useCallback(
    (i: number) => {
      if (phase === "boot") return

      setActive(i)
      setBackgroundForIndex(i, "jump")

      scrollLockUntilRef.current = Date.now() + 350
      setScrollProgress(i === GRAFFITI_INDEX ? 0 : 1)

      const target = document.getElementById(ids[i])
      target?.scrollIntoView({ behavior: "smooth", block: "start" })

      const url = new URL(window.location.href)
      url.searchParams.set("pattern", String(i))
      window.history.replaceState({}, "", url)
    },
    [ids, phase, setBackgroundForIndex]
  )

  // Query param jump
  useEffect(() => {
    if (phase === "boot") return

    const params = new URLSearchParams(window.location.search)
    const patternParam = params.get("pattern")
    if (patternParam !== null) {
      const i = parseInt(patternParam, 10)
      if (!isNaN(i) && i >= 0 && i < SECTIONS.length) {
        requestAnimationFrame(() => {
          setActive(i)
          setBackgroundForIndex(i, "query")
          scrollLockUntilRef.current = Date.now() + 350
          setScrollProgress(i === GRAFFITI_INDEX ? 0 : 1)

          const target = document.getElementById(ids[i])
          target?.scrollIntoView({
            behavior: "instant" as ScrollBehavior,
            block: "start",
          })
        })
      }
    }
  }, [ids, phase, setBackgroundForIndex])

  // Main scene fade + pointer events gating
  const [mainOpacity, setMainOpacity] = useState(0)
  const [mainInteractive, setMainInteractive] = useState(false)
  const isGraffitiActive = active === GRAFFITI_INDEX

  useEffect(() => {
    if (phase !== "main") {
      setMainOpacity(0)
      setMainInteractive(false)
      return
    }

    if (isGraffitiActive) {
      setMainInteractive(true)
      requestAnimationFrame(() => setMainOpacity(1))
      return
    }

    setMainOpacity(0)
    const t = window.setTimeout(() => setMainInteractive(false), MAIN_FADE_MS)
    return () => window.clearTimeout(t)
  }, [active, phase, isGraffitiActive])

  // Keep wall hover sane if not on graffiti
  useEffect(() => {
    if (active !== 0 && isOverWall) setIsOverWall(false)
  }, [active, isOverWall])

  return (
    <div style={{ width: "100vw", height: "100svh", position: "relative", overflow: "hidden" }}>
      <BootOverlay
        visible={bootVisible}
        terminalText={BIO_TEXT}
        onTerminalDone={() => setTerminalDone(true)}
        onSkip={handleSkip}
      />

      {/* Main landing 3D scene */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: mainOpacity,
          pointerEvents: mainInteractive ? "auto" : "none",
          transition: `opacity ${MAIN_FADE_MS}ms ease-out`,
          willChange: "opacity",
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
          <LandingScene setIsOverWall={setIsOverWall} enabled={phase === "main"} isMobile={isMobile}/>
          <SprayCursor3D enabled={phase === "main" && isOverWall} />
        </Canvas>

        <CursorSparkle enabled={phase === "main" && isOverWall} />
      </div>

      {/* Background for later sections */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          opacity: bgOpacity,
          pointerEvents: "none",
          transition: `opacity ${bgTransitionMs}ms ease-out`,
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
          height: "100svh",
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
            height: "100svh",
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
              <div className="w-full h-full">
                <ArchivePortal activeSection={active} />
              </div>
            )
          } else if (isARSection) {
            content = <VideoModelTexture rotate={isARSection} />
          } else if (isArtSection) {
            content = (
              <ShaderFrame isMobile={isMobile} headerHeight="64px"/>
            )
          } else if (isMusicSection) {
            content = (
              <MusicSection
                title={section.name}
                subtitle={section.text}
                colors={
                  colorPalettes[i] ?? ["#22c55e", "#06b6d4", "#4f46e5", "#a855f7"]
                }
                bandcampUrl={MUSIC_CONTENT.bandcampUrl}
                musicTitle={MUSIC_CONTENT.title}
                musicDescription={MUSIC_CONTENT.description}
                videos={musicVideos}
              />
            )
            
          } else if (isAboutSection) {
            content = (
              <ShaderFrame isMobile={isMobile} headerHeight="0px">
                <EnhancedAbout />
              </ShaderFrame>
            )
          } else {
            content = (
              <ShaderFrame isMobile={isMobile} headerHeight="0px"/>
            )
          }

          return (
   
            <section
              key={section.name}
              id={ids[i]}
              data-index={i}
              style={{
                minHeight: "100svh",
                height: isAboutSection || isWorkSection ? "100svh" : "auto",
                scrollSnapAlign: "start",
                display: "flex",
                alignItems: isAboutSection || isWorkSection ? "stretch" : "center",
                justifyContent: "center",
                padding: isMobile 
                  ? (isAboutSection || isWorkSection ? "1rem 0.5rem" : "0.5rem 0.5rem")
                  : (isAboutSection || isWorkSection ? "5rem 1rem" : "6rem 1.5rem"),
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                pointerEvents: "auto",
              }}
            >
              {content}
            </section>

          )
        })}
      </main>

      {/* Music video overlay */}
      {selectedMusicVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <button
            type="button"
            onClick={() => setSelectedMusicVideo(null)}
            className="absolute inset-0 w-full h-full cursor-default"
          />

          <div className="relative w-full max-w-4xl px-4">
            <div className="mb-3 text-center text-xs md:text-sm uppercase tracking-[0.2em] text-white/70">
              {selectedMusicVideo.title}
            </div>

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