'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({
  glbUrl,
  videoUrl,
  screenName,
  debugOutline = false,
  desiredSize = 10,
}: {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;
  debugOutline?: boolean;
  desiredSize?: number;
}) {
  const { scene } = useGLTF(glbUrl);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);

  // Create video texture
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

  // Apply video texture to material
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

      // Single material
      if (mat && !Array.isArray(mat) && mat.name === targetName) {
        child.material = videoMat;
        applied++;
        console.log(`✅ Video applied to: ${child.name}`);
        return;
      }

      // Multi-material
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

export default function VideoModelTexture() {
  const controlsRef = useRef<any>(null);
  
  // Define position and scale here
  const position: [number, number, number] = [0, 1, 0];
  const scale = 0.3;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        
        <group position={position} scale={scale}>
          <Model 
            videoUrl="/videos/video.mp4" 
            glbUrl="/models/iphone_16.glb" 
          />
        </group>
       
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.1}
          minPolarAngle={Math.PI / 2}  // restrict vertical up/down
          maxPolarAngle={Math.PI / 2}  // both set to 90° = lock Y-axis only rotation
          enablePan={true}            // optional: disable panning
          enableZoom={false}            // optional: allow zooming
        />
      </Canvas>
    </div>
  );
}