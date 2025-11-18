'use client';

import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';

type VideoScreenLoaderProps = ThreeElements['group'] & {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;
  debugOutline?: boolean;
  onLoaded?: (root: THREE.Object3D) => void;
  onVideoReady?: (video: HTMLVideoElement) => void;
};

export function VideoScreenLoader({
  glbUrl,
  videoUrl,
  screenName,
  debugOutline = false,
  onLoaded,
  onVideoReady,
  ...groupProps
}: VideoScreenLoaderProps) {
  
  const group = useRef<THREE.Group>(null!);

  console.log(`[VideoScreenLoader] Attempting to load GLB: ${glbUrl}`);
  const gltf = useGLTF(glbUrl, true) as unknown as { scene: THREE.Group };
  const { scene } = gltf;
  console.log('[VideoScreenLoader] GLTF loaded successfully:', scene);

  const initializedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);

  /** 1️⃣ Normalize GLB scale and position **/
  useEffect(() => {
    if (!scene) return;
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const desiredSize = 10; // scale target (match your GLBViewerTest)
    const scaleFactor = desiredSize / maxDim;

    scene.scale.setScalar(scaleFactor);
    scene.position.sub(center.multiplyScalar(scaleFactor)); // center model
    console.log('[VideoScreenLoader] Normalized model scale & position:', {
      maxDim,
      scaleFactor,
      size,
      center,
    });

    // Notify wrapper when ready
    if (group.current) onLoaded?.(group.current);
  }, [scene, onLoaded]);

  /** 2️⃣ Set up video texture **/
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    console.log('[VideoScreenLoader] Initializing video:', videoUrl);
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

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    (videoTexture as any).colorSpace = THREE.SRGBColorSpace;
    videoTextureRef.current = videoTexture;

    onVideoReady?.(video);

    // Try to autoplay
    video
      .play()
      .then(() => console.log('[VideoScreenLoader] Video autoplay succeeded'))
      .catch((err) => console.warn('[VideoScreenLoader] Video autoplay failed:', err));

    return () => {
      console.log('[VideoScreenLoader] Cleaning up video resources');
      video.pause();
      video.src = '';
      videoTexture.dispose();
    };
  }, [videoUrl, onVideoReady]);

  /** 3️⃣ Apply video texture **/
  useEffect(() => {
    const tex = videoTextureRef.current;
    if (!tex || !scene) return;

    console.log('[VideoScreenLoader] Searching for screen meshes...');
    let applied = 0;

    scene.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      const target = screenName
        ? mesh.name === screenName
        : mesh.name?.toLowerCase?.().includes('screen');

      if (target) {
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        mesh.material = mat;
        (mesh.material as THREE.Material).needsUpdate = true;
        applied++;
        console.log(`[VideoScreenLoader] Applied video texture to mesh: ${mesh.name}`);

        if (debugOutline) {
          const helper = new THREE.BoxHelper(mesh, 0xffffff as any);
          scene.add(helper);
        }
      }
    });

    if (applied === 0) {
      console.warn(
        `[VideoScreenLoader] No meshes matched ${
          screenName ? `"${screenName}"` : '"screen"'
        } — check your model mesh names.`
      );
    }
  }, [scene, screenName, debugOutline]);

  return (
    <group ref={group} {...groupProps}>
      {scene ? <primitive object={scene} /> : null}
    </group>
  );
}