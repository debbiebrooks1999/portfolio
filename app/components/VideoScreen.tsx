'use client';

import React, { Suspense, useRef } from 'react';
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas } from '@react-three/fiber';
import { Environment, Html, OrbitControls } from '@react-three/drei';
import { VideoScreenLoader } from './VideoScreenLoader';
import * as THREE from 'three';

type Props = {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;
  debugOutline?: boolean;
};

export default function VideoScreen({
  
  glbUrl,
  videoUrl,
  screenName,
  debugOutline = false,
}: Props) {


  const wrapperRef = useRef<THREE.Group>(null);

    useGSAP(() => {
    const g = wrapperRef.current;
    if (!g) return;

    // start a touch smaller, pop to target scale
    gsap.fromTo(
      g.scale,
      { x: 9.3, y: 9.3, z: 9.3 },
      { x: 9.8, y: 9.8, z: 9.8, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        aspectRatio: '16 / 9',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
        <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }} dpr={[1, 2]}>
    
        {/* Basic lighting & controls */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} />
        <OrbitControls enableDamping dampingFactor={0.1} />

        {/* Loader fallback */}
        <Suspense
          fallback={
            <Html center>
              <div
                style={{
                  color: 'white',
                  background: 'rgba(0,0,0,0.7)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                Loading 3D model...
              </div>
            </Html>
          }
        >
          {/* Centered, consistent scale */}
          <group
                ref={wrapperRef}
                position={[0, 0, 0]}
                rotation={[0, Math.PI, 0]}   // 180°
                scale={[9.8, 9.8, 9.8]}      // final/resting scale
              >
                <VideoScreenLoader
                  glbUrl={glbUrl}
                  videoUrl={videoUrl}
                  screenName={screenName}
                  debugOutline={debugOutline}
                />
              </group>

          {/* Optional lighting environment */}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}