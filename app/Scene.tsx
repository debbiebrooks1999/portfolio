// Scene.tsx
"use client"

import React, { useEffect, useRef, useState, useMemo } from "react"
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
import ScrambleText, { type ScrambleHandle } from "./components/ScrambleText"
import CanvasBackground from "./components/CanvasBackground"
import PuddleCitySurface from "./components/PuddleCitySurface"
import ShootingRain from "./components/ShootingRain"
import { SprayCursor3D } from "./components/SprayCursor3D"
import { CyberpunkSkyline } from "./components/CyberpunkSkyline"
import CityModel from "./components/CityModel"
// import { Manhole, RoseSystem, ManholeState, RoseData } from "./components/ManholeRoseSystem"

import { onUserClick, onModelClick } from "./events"
import { CAMERA_CONFIG } from "./content-data"

type Phase = "intro" | "main"

type SceneProps = {
  active: number
  scrollProgress: number
  phase: Phase
  eventSourceEl: HTMLElement | null
  isOverWall: boolean
  setIsOverWall: (value: boolean) => void
}

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
           
          </group>
          {/* Add VAT roses (position/height depends on your world scale) */}
          {/* <group position={[0, -1, 0]}>
            <VATRoseSystem groundY={0} size={50} />
          </group> */}


                     {/* Manhole */}  {/* Rose System */}
        <group scale={[0.3, 0, 0.5]} 
              position={[0, -0.25, 0.78]}  
              rotation={[0.349, 0, 0]}>     

            <Manhole 
              state={manholeState} 
              onStateChange={setManholeState}
              rosesRef={rosesRef}
            />
            
          
            <group scale={[0.3, 0.3, 0.3]} position={[0, 0, 0]}>
              <RoseSystem 
                manholeState={manholeState}
                rosesRef={rosesRef}
              />
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



export default function Scene({
  active,
  scrollProgress,
  phase,
  eventSourceEl,
  isOverWall,
  setIsOverWall,
}: SceneProps) {
  const mainSceneOpacity = (phase === "main" ? 1 : 0) * (1 - scrollProgress)

  return (
    <>
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
          eventSource={eventSourceEl ?? undefined}
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
    </>
  )
}

