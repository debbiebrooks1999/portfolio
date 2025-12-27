"use client"

import React, { useState, Suspense, useMemo } from "react"
import * as THREE from "three"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls, Preload } from "@react-three/drei"

// Components
import BackdropPanel from "./BackdropPanel"
import PuddleCitySurface from "./PuddleCitySurface"
import { SprayCursor3D } from "./SprayCursor3D"
import { RoseGarden } from "./RoseGarden" // New component with recede logic
import { CyberpunkSkyline } from "./CyberpunkSkyline"

export default function CyberpunkPage() {
  // Shared state: the 3D coordinate where roses should spawn
  const [spawnPoint, setSpawnPoint] = useState<THREE.Vector3 | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  return (
    <div className="relative w-full h-screen bg-[#050010] overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [0, 6, 14], fov: 45 }}
        dpr={[1, 2]} // Performance optimization for high-res screens
      >
        <Suspense fallback={null}>
          {/* 1. Environment & Lighting */}
          <color attach="background" args={["#05000a"]} />
          <fog attach="fog" args={["#05000a", 10, 50]} />
          <Environment preset="night" />
          <ambientLight intensity={0.2} />
          <spotLight 
            position={[10, 15, 10]} 
            angle={0.3} 
            penumbra={1} 
            intensity={2} 
            castShadow 
          />

          {/* 2. Background Elements */}
          <CyberpunkSkyline girlTextureUrl="/textures/girl-spritesheet.png" />
          <BackdropPanel 
            showVideo={true} 
            onWallHover={(isHovered) => {
              // Optional: change cursor or lighting when hovering wall
            }}
          />

          {/* 3. The Ground (Interaction Layer) */}
          <group
            onPointerMove={(e) => {
              e.stopPropagation()
              setSpawnPoint(e.point.clone())
            }}
          >
            <PuddleCitySurface 
              position={[0, -0.5, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              size={[60, 60]}
            />
          </group>

          {/* 4. The Rose System (Listens to the Ground) */}
          <RoseGarden spawnAt={spawnPoint} />

          {/* 5. The Spray Can (Visual Follower) */}
          <SprayCursor3D enabled={true} />

          <OrbitControls 
            makeDefault 
            enablePan={false}
            maxPolarAngle={Math.PI / 1.8} // Prevent looking under the floor
            minDistance={5}
            maxDistance={25}
          />
          
          <Preload all />
        </Suspense>
      </Canvas>

      {/* UI Overlays (Scramble Text, Navigation, etc.) */}
      <div className="absolute top-10 left-10 pointer-events-none">
        <h1 className="text-magenta-500 font-mono text-xl tracking-widest uppercase">
          Neural Garden v2.0
        </h1>
        <p className="text-cyan-400 text-xs opacity-60">
          Interaction: Hover ground to bloom / Recede timer: 3.0s
        </p>
      </div>

      {/* Video Modal (if needed) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
           <button onClick={() => setSelectedVideo(null)} className="text-white">Close</button>
        </div>
      )}
    </div>
  )
}