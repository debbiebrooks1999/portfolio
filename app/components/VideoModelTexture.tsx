'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';

type Props = {
  rotate?: boolean;
};

function Model({
  glbUrl,
  videoUrl,
}: {
  glbUrl: string;
  videoUrl: string;
}) {
  const { scene } = useGLTF(glbUrl);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    texture.colorSpace = THREE.SRGBColorSpace;

    setVideoTexture(texture);

    video.play().catch((err) => {
      console.warn('Video autoplay failed:', err);
    });

    return () => {
      video.pause();
      video.src = '';
      texture.dispose();
    };
  }, [videoUrl]);

  useEffect(() => {
    if (!videoTexture) return;

    const targetName = '4130c6244c49c5d5712e';
    const videoMat = new THREE.MeshBasicMaterial({
      map: videoTexture,
      toneMapped: false,
    });

    let applied = 0;

    scene.traverse((child: any) => {
      if (!child?.isMesh) return;

      const mat = child.material;

      if (mat && !Array.isArray(mat) && mat.name === targetName) {
        child.material = videoMat;
        applied++;
        return;
      }

      if (Array.isArray(mat)) {
        let changed = false;
        const newMats = mat.map((m) => {
          if (m?.name === targetName) {
            changed = true;
            applied++;
            return videoMat;
          }
          return m;
        });
        if (changed) child.material = newMats;
      }
    });

    if (applied === 0) {
      console.warn(`❌ No materials found with name: ${targetName}`);
    }
  }, [scene, videoTexture]);

  return <primitive object={scene} />;
}

/** ✅ This component runs INSIDE <Canvas>, so hooks like useFrame are allowed */
function RotatingModelGroup({ rotate }: { rotate: boolean }) {
  const modelRef = useRef<Group>(null)

  const START_Y = Math.PI / 1  // 180°
  const TARGET_Y = Math.PI * 2 // 360° (same as 0°)
  const DURATION = 1.2

  const playingRef = useRef(false)
  const tRef = useRef(0)

  // for console throttling
  const logAccRef = useRef(0)

  const resetPose = useCallback(() => {
    const m = modelRef.current
    if (!m) return
    m.rotation.set(0, START_Y, 0)
    tRef.current = 0
    playingRef.current = false
    console.log("[Showreel] reset rotation:", {
      x: THREE.MathUtils.radToDeg(m.rotation.x).toFixed(1),
      y: THREE.MathUtils.radToDeg(m.rotation.y).toFixed(1),
      z: THREE.MathUtils.radToDeg(m.rotation.z).toFixed(1),
    })
  }, [])

  useEffect(() => {
    if (!modelRef.current) return

    if (rotate) {
      // entering showreel: reset then play
      resetPose()
      playingRef.current = true
      console.log("[Showreel] play rotation")
    } else {
      // leaving showreel: reset so next entry starts clean
      resetPose()
    }
  }, [rotate, resetPose])

  useFrame((_, delta) => {
    const model = modelRef.current
    if (!model) return

    if (playingRef.current) {
      tRef.current = Math.min(tRef.current + delta, DURATION)
      const u = tRef.current / DURATION
      const eased = 1 - Math.pow(1 - u, 3) // easeOutCubic

      model.rotation.y = THREE.MathUtils.lerp(START_Y, TARGET_Y, eased)

      if (u >= 1) {
        model.rotation.y = TARGET_Y
        playingRef.current = false
        console.log("[Showreel] done rotation:", THREE.MathUtils.radToDeg(model.rotation.y).toFixed(1))
      }
    }

    // log rotation ~4x/sec
    logAccRef.current += delta
    if (logAccRef.current > 0.25) {
      logAccRef.current = 0
      console.log("[Showreel] rot deg", {
        x: THREE.MathUtils.radToDeg(model.rotation.x).toFixed(1),
        y: THREE.MathUtils.radToDeg(model.rotation.y).toFixed(1),
        z: THREE.MathUtils.radToDeg(model.rotation.z).toFixed(1),
      })
    }
  })

  return (
    <group ref={modelRef} position={[0, 1, 0]} scale={0.3}>
      <Model videoUrl="/videos/video.mp4" glbUrl="/models/iphone_16.glb" />
    </group>
  )
}

export default function VideoModelTexture({ rotate = false }: Props) {
  const controlsRef = useRef<any>(null);

   useEffect(() => {
    // whenever showreel is (re)entered, snap controls back
    if (!controlsRef.current) return
    if (rotate) {
      controlsRef.current.reset()
      controlsRef.current.update()
      console.log("[Showreel] OrbitControls reset")
    }
  }, [rotate])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* ✅ useFrame lives inside here */}
        <RotatingModelGroup rotate={rotate} />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.1}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          enablePan={true}
          enableZoom={false}
        />
      </Canvas>
    </div>
  );
}