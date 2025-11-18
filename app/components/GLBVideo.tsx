'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

type GLBViewerTestProps = {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;   // mesh to target; defaults to "ScreenCube"
  scale?: number;        // static scale (no animation). Default 30.
};

function VideoScreenModel({
  glbUrl,
  videoUrl,
  screenName = 'ScreenCube',
}: {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;
}) {
  const { scene } = useGLTF(glbUrl);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);
  const initializedRef = useRef(false);

  // Create video + texture once (guarded for Strict Mode)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.setAttribute('muted', '');
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.preload = 'auto';
    videoRef.current = video;

    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format = THREE.RGBAFormat;
    (tex as any).colorSpace = THREE.SRGBColorSpace;
    videoTextureRef.current = tex;

    const tryPlay = async () => {
      try {
        if (video.paused) await video.play();
      } catch (e) {
        // Autoplay may be blocked; retry on user interaction
      }
    };

    const onPointer = () => tryPlay();
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('touchstart', onPointer);

    video.load();
    tryPlay();

    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('touchstart', onPointer);
      try { video.pause(); } catch {}
      video.src = '';
      tex.dispose();
    };
  }, [videoUrl]);

  // Assign the video material to the target mesh name
  useEffect(() => {
    const tex = videoTextureRef.current;
    if (!tex || !scene) return;

    let found = 0;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if ((mesh as any).isMesh && mesh.name === screenName) {
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map(() => mat);
        } else {
          mesh.material = mat;
        }
        (mesh.material as THREE.Material).needsUpdate = true;
        found++;
      }
    });

    if (found === 0) {
      console.warn(`[GLBViewerTest] Mesh "${screenName}" not found. Check your GLB mesh names.`);
    }
  }, [scene, screenName]);

  return <primitive object={scene} />;
}

export default function GLBViewerTest({
  glbUrl,
  videoUrl,
  screenName = 'ScreenCube',
  scale = 30,
}: GLBViewerTestProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 45 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} />
        <OrbitControls enableDamping dampingFactor={0.1} />

        <Suspense
          fallback={
            <Html center>
              <div
                style={{
                  color: 'white',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                }}
              >
                Loading GLB...
              </div>
            </Html>
          }
        >
          {/* Centered, static scale. No animation. */}
          <group position={[0, 0, 0]} scale={[scale, scale, scale]}>
            <VideoScreenModel
              glbUrl={glbUrl}
              videoUrl={videoUrl}
              screenName={screenName}
            />
          </group>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Optional: warm the cache
// useGLTF.preload('/models/iphone.glb');