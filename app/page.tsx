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
  Preload,
  Points,
  PointMaterial,
  OrbitControls,
} from "@react-three/drei"
import { Selection } from "@react-three/postprocessing"

import BackdropPanel from "./components/BackdropPanel"
import CursorSparkle from "./components/CursorSparkle"
import ModelLoader from "./components/ModelLoader"
import TerminalTypewriter from './components/TerminalTypewriter'
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
import { ArtSlideshow, type ArtSlide } from "./components/ArtSlideshow"
import { Manhole, RoseSystem, ManholeState, RoseData } from "./components/ManholeRoseSystem"
import { LotusLeaf, LotusFlower } from "./components/LotusComponents"
import EnhancedAbout from "./components/EnhancedAbout"
import { GLBOverlayLoader } from './components/GLBOverlayLoader'
import PCModelWithIntro from './components/PCModelWithIntro'

// Import content data
import {
  INTRO_SECONDS,
  CAMERA_CONFIG,
  ACCENTS,
  musicVideos,
  artSlides,
  BIO_TEXT,
  MUSIC_CONTENT,
  slug,
  generateColorPalettes,
  type MusicVideo,
  type ArtSlide as ArtSlideType,
} from "./content-data"


/* ---------- Types ---------- */

type HeaderProps = {
  active: number
  onJump: (i: number) => void
  sections: string[]
}

type Phase = "intro" | "main"

/* ---------- Constants ---------- */

const SECTIONS = [
  "Graffiti Fun - Interactive Surface Study",
  ...sectionData.map((s) => s.name),
]

const colorPalettes = generateColorPalettes(SECTIONS)

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
  currentRotationY 
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
}) {
  // Easing function for smooth intro animation (ease-out cubic)
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  useFrame(({ camera }, delta) => {
    // WAITING PHASE - before animation starts
    if (!animStarted) {
      // Keep camera at start position during delay
      camera.position.z = introStartZ;
      camera.position.y = introStartY;
      return;
    }

    // INTRO ANIMATION PHASE
    if (!introComplete) {
      introProgress.current += delta;
      const t = Math.min(introProgress.current / introDuration, 1.0);
      const easedT = easeOutCubic(t);
      
      // Interpolate camera Z position from start to target
      const currentZ = introStartZ + (introTargetZ - introStartZ) * easedT;
      camera.position.z = currentZ;
      // Interpolate camera Y position from start to target
      const currentY = introStartY + (introTargetY - introStartY) * easedT;
      camera.position.y = currentY;
      
      // Mark intro as complete when done
      if (t >= 1.0) {
        setIntroComplete(true);
        console.log('🎬 Camera intro animation complete');
      }
      
      return; // Skip rotation during intro
    }

    // ROTATION PHASE (after intro is complete)
    // Smooth interpolation (lerp) for camera rotation
    const lerpFactor = CAMERA_CONFIG.LERP_FACTOR;
    currentRotationY.current += (targetRotationY.current - currentRotationY.current) * lerpFactor;
    
    // Apply rotation to camera
    camera.rotation.y = currentRotationY.current;
  });

  return null;
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

/* ---------- Intro Scene (minimal backdrop) ---------- */

function IntroScene() {
  return (
    <>
      <Environment
        files="/hdr/studio_small_09_1k.hdr"
        background={false}
        environmentIntensity={0.3}
      />
      <fog attach="fog" args={["#000000", 2.5, 12]} />
      <ambientLight intensity={0.2} />
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

  // Manhole and Rose state
  const [manholeState, setManholeState] = useState<ManholeState>('idle');
  const rosesRef = useRef<RoseData[]>([]);
  
  // Lotus flower state management - SINGLE DECLARATION
  const [flowers, setFlowers] = useState<Array<{ 
    id: number; 
    position: [number, number, number]; 
    parentLeaf: any 
  }>>([]);
  const nextFlowerId = useRef(0);
  const nextId = useRef(0);


  // Camera intro animation state
  const [cameraIntroComplete, setCameraIntroComplete] = useState(false);
  const [cameraAnimStarted, setCameraAnimStarted] = useState(false);
  const cameraIntroProgress = useRef(0);

  // Mouse tracking for camera rotation (only active after intro)
  const mouseX = useRef(0);
  const targetRotationY = useRef(0);
  const currentRotationY = useRef(0);

  // Lotus event handlers - SINGLE DECLARATION
  const handleFlowerSpawn = (position: [number, number, number], parentLeaf: any) => {
    setFlowers(prev => [...prev, { 
      id: nextFlowerId.current++, 
      position, 
      parentLeaf 
    }]);
    console.log(`🪷 Spawning lotus flower at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
  };

  const handleFlowerRemoved = (id: number) => {
    setFlowers(prev => prev.filter(f => f.id !== id));
    console.log('✓ Removed lotus flower');
  };

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!cameraIntroComplete) return;
      
      // Normalize mouse X to -1 to 1
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      // Convert to rotation angle (rotate ±15 degrees)
      targetRotationY.current = mouseX.current * CAMERA_CONFIG.ROTATION_AMOUNT;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cameraIntroComplete]);

  // Intro scene timer - handles both scramble and camera animation start
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrambleRef.current && !hasScrambled) {
        scrambleRef.current.scramble()
        setHasScrambled(true)
      }
      // Start camera animation after delay
      setCameraAnimStarted(true)
      console.log('🎬 Starting camera intro animation')
    }, CAMERA_CONFIG.INTRO_SCENE_DELAY)
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

      {/* Camera intro animation and rotation controller */}
      <CameraController 
        animStarted={cameraAnimStarted}
        introComplete={cameraIntroComplete}
        setIntroComplete={setCameraIntroComplete}
        introProgress={cameraIntroProgress}
        introDuration={CAMERA_CONFIG.INTRO_DURATION}
        introStartZ={CAMERA_CONFIG.INTRO_START_Z}
        introTargetZ={CAMERA_CONFIG.INTRO_TARGET_Z}
        introStartY={CAMERA_CONFIG.INTRO_START_Y}
        introTargetY={CAMERA_CONFIG.INTRO_TARGET_Y}
        targetRotationY={targetRotationY} 
        currentRotationY={currentRotationY} 
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

          <group scale={[2, 1, 1]} position={[1, -1, 0.1]}>
            <PuddleCitySurface />

            {/* Manhole, Roses, and Lotus Garden */}
            <group 
              scale={[0.5, 0.5, 0.5]} 
              position={[0, -0.25, 0.78]}  
              rotation={[0.349, 0, 0]}
            >
              {/* Manhole */}
              <Manhole 
                state={manholeState} 
                onStateChange={setManholeState}
                rosesRef={rosesRef}
              />
              
              {/* Rose System */}
              <group scale={[0.3, 0.3, 0.3]} position={[0, 0, 0]}>
                <RoseSystem 
                  manholeState={manholeState}
                  rosesRef={rosesRef}
                />
              </group>
              
              {/* Lotus Garden */}
              <group scale={[0.1, 0.1, 0.1]} position={[0, 0.1, 0]}>

              <LotusLeaf 
                position={[-20, 0, 0]} 
                onFlowerSpawn={(pos, leaf) => {
                  setFlowers(prev => [...prev, { 
                    id: nextId.current++, 
                    position: pos, 
                    parentLeaf: leaf 
                  }]);
                }}
              />

               <LotusLeaf 
                position={[20, 0, 0]} 
                onFlowerSpawn={(pos, leaf) => {
                  setFlowers(prev => [...prev, { 
                    id: nextId.current++, 
                    position: pos, 
                    parentLeaf: leaf 
                  }]);
                }}
              />

              {flowers.map(f => (
                <LotusFlower
                  key={f.id}
                  position={f.position}
                  parentLeaf={f.parentLeaf}
                  onRemoved={() => setFlowers(prev => prev.filter(x => x.id !== f.id))}
                />
               ))}

              </group>
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

     {/* Camera Controls */}
      <OrbitControls 
        enableDamping 
        target={[0, 0, 0]}
        enableRotate={false} // Disable manual rotation to let mouse control it
        enablePan={false}
        enabled={cameraIntroComplete} // Disable during intro animation
      />                             
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
  const [bubbleActive, setBubbleActive] = useState(false)
  const [phase, setPhase] = useState<Phase>("intro")
  const [introOpacity, setIntroOpacity] = useState(0)
  const [introSecondsLeft, setIntroSecondsLeft] =
    useState<number>(INTRO_SECONDS)

  const [startIntro, setStartIntro] = useState(false)


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
        {/* <TerminalTypewriter 
          text={BIO_TEXT}
          speed={25}
        /> */}
     
        {!startIntro && <GLBOverlayLoader onStart={() => setStartIntro(true)} />}
        <Canvas
          camera={{ position: [0, 0.5, 4], fov: 45 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ alpha: true, antialias: true }}
        >
          <Environment files="/hdr/studio_small_09_1k.hdr" environmentIntensity={0.3} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          <React.Suspense fallback={null}>
            <PCModelWithIntro
              start={startIntro}
              duration={1.2}
              url="/models/90sPC.glb"
              position={[0, -4, -1]}
              rotation={[0, Math.PI / 2, 0]}
              scale={1}
            />
          </React.Suspense>

          <OrbitControls enableZoom={false} />
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
              <div className="w-full h-full">
                <ArchivePortal />
              </div>
            )
          }
          
          else if (isARSection) {
            content = <VideoModelTexture />
          } else if (isArtSection) {
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
              ></ShaderFrame>
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
                        src={MUSIC_CONTENT.bandcampUrl}
                        style={{
                          border: 0,
                          width: "100%",
                          height: "470px",
                        }}
                        allow="autoplay"
                      />
                    </div>
                  </div>

                  {/* Headline + 6 wide-screen video tiles */}
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Headline text */}
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 px-5 py-4">
                      <h2 className="text-lg md:text-xl font-semibold mb-1">
                        {MUSIC_CONTENT.title}
                      </h2>
                      <p className="text-xs md:text-sm opacity-80 leading-snug">
                        {MUSIC_CONTENT.description}
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
                <EnhancedAbout />
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
                height: isAboutSection || isWorkSection ? "100vh" : "auto",
                scrollSnapAlign: "start",
                display: "flex",
                alignItems: isAboutSection || isWorkSection ? "stretch" : "center",
                justifyContent: "center",
                padding: isAboutSection || isWorkSection ? "5rem 1rem" : "6rem 1.5rem",
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