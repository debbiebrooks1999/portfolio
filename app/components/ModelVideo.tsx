'use client';

import * as THREE from 'three';
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';

type GLBViewerTestProps = {
  glbUrl: string;
  videoUrl: string;
  /** Optional: name of the mesh to receive the video texture (exact match).
   * If omitted, any mesh whose name includes "screen" (case-insensitive) is used. */
  screenName?: string;
  /** Show a white box helper around the textured mesh(es) */
  debugOutline?: boolean;

  /** Optional group transforms if you still want to offset the whole thing */
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Target size (longest dimension) after normalization */
  desiredSize?: number; // default 10
};

/* -----------------------------
   VideoScreenLoader
   1) Normalize GLB
   2) Set up video texture
   3) Apply video texture
------------------------------ */
function VideoScreenLoader({
  glbUrl,
  videoUrl,
  screenName,
  debugOutline = false,
  desiredSize = 10,
  ...groupProps
}: {
  glbUrl: string;
  videoUrl: string;
  screenName?: string;
  debugOutline?: boolean;
  desiredSize?: number;
} & ThreeElements['group']) {
  const group = useRef<THREE.Group>(null!);

  const gltf = useGLTF(glbUrl, true) as unknown as { scene: THREE.Group };
  const { scene } = gltf;

  const initializedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoTextureRef = useRef<THREE.VideoTexture | null>(null);

  // 1️⃣ Normalize GLB scale and position
  useEffect(() => {
    if (!scene) return;

    // reset transforms before measuring
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scaleFactor = desiredSize / maxDim;

    scene.scale.setScalar(scaleFactor);
    // Recompute center after scaling
    const scaledCenter = center.multiplyScalar(scaleFactor);
    scene.position.sub(scaledCenter); // center at origin
    scene.updateMatrixWorld(true);

    // Optional: sit on ground (base at y=0) — uncomment if you prefer this
    // const scaledBox = new THREE.Box3().setFromObject(scene);
    // scene.position.y -= scaledBox.min.y;

    // eslint-disable-next-line no-console
    console.log('[GLB] normalized:', { maxDim, scaleFactor, size, center: scaledCenter });
  }, [scene, desiredSize]);

  // 2️⃣ Set up video texture
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

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    // @ts-ignore - r3f/three version differences
    videoTexture.colorSpace = THREE.SRGBColorSpace;
    videoTextureRef.current = videoTexture;

    video
      .play()
      .then(() => console.log('[Video] autoplay OK'))
      .catch((err) => console.warn('[Video] autoplay failed (user gesture likely required):', err));

    return () => {
      console.log('[Video] cleanup');
      try {
        video.pause();
        video.src = '';
      } catch {}
      videoTexture.dispose();
    };
  }, [videoUrl]);

  // 3️⃣ Apply video texture
  useEffect(() => {
    const tex = videoTextureRef.current;
    if (!tex || !scene) return;

    let applied = 0;
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!(mesh as any).isMesh) return;

      const isTarget = screenName
        ? mesh.name === screenName
        : mesh.name?.toLowerCase?.().includes('screen');

      if (isTarget) {
        const mat = new THREE.MeshBasicMaterial({
          map: tex,
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        mesh.material = mat;
        (mesh.material as THREE.Material).needsUpdate = true;
        applied++;
        console.log(`[Video] applied to mesh: ${mesh.name}`);

        if (debugOutline) {
          const helper = new THREE.BoxHelper(mesh, 0xffffff as any);
          scene.add(helper);
        }
      }
    });

    if (applied === 0) {
      console.warn(
        `[Video] No meshes matched ${
          screenName ? `"${screenName}"` : '"screen"'
        } — check mesh names in your GLB.`
      );
    }
  }, [scene, screenName, debugOutline]);

  return (
    <group ref={group} {...groupProps}>
      {scene ? <primitive object={scene} /> : null}
    </group>
  );
}

/* -----------------------------
   GLBViewerTest (uses loader)
------------------------------ */
export default function GLBViewerTest({
  glbUrl,
  videoUrl,
  screenName,
  debugOutline = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  desiredSize = 10,
}: GLBViewerTestProps) {
  const controlsRef = useRef<any>(null);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        background: 'rgba(0,0,0,0)',
      }}
    >
      <Canvas
        camera={{ position: [0, 2, 12], fov: 45 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.1}
          onChange={(e: any) => {
            const controls = e.target;
            const cam = controls.object;
            // console.log(
            //   '📸 Camera:',
            //   'pos=',
            //   `[${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)}]`,
            //   'target=',
            //   `[${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)}]`
            // );
          }}
        />

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
          <VideoScreenLoader
            glbUrl={glbUrl}
            videoUrl={videoUrl}
            screenName={screenName}
            debugOutline={debugOutline}
            desiredSize={desiredSize}
            position={position}
            rotation={rotation}
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}