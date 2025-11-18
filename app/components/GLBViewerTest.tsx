'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';


type GLBViewerTestProps = {
  glbUrl: string;
  position?: [number, number, number];
  scale?: number;
};

// Simple GLB renderer
function Model({ glbUrl }: { glbUrl: string }) {
  const { scene } = useGLTF(glbUrl);

  React.useEffect(() => {
    // const targetName = 'ScreenMaterial_2'; // from your console output
    const targetName = '4130c6244c49c5d5712e'; // from your console output
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    scene.traverse((child: any) => {
      if (!child?.isMesh) return;

      const mat = child.material;

      // Single material
      if (mat && !Array.isArray(mat) && mat.name === targetName) {
        child.material = redMat;
        return;
      }

      // Multi-material
      if (Array.isArray(mat)) {
        let changed = false;
        const newMats = mat.map((m) => {
          if (m?.name === targetName) {
            changed = true;
            return redMat;
          }
          return m;
        });
        if (changed) child.material = newMats;
      }
    });
  }, [scene, glbUrl]);

  return <primitive object={scene} />;
}

export default function GLBViewerTest({
  glbUrl,
  position = [0, 0, 2],
  scale = 1,
}: GLBViewerTestProps) {

  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

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
      //-6.37, 15.26, 320.65
        camera={{ position: [-1.96, 77.87, 311.48], fov: 90 }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 5]} intensity={1} />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.1}
          onChange={(e: any) => {
            const controls = e.target;
            const cam = controls.object;
            console.log(
              '📸 Camera:',
              'position =',
              `[${cam.position.x.toFixed(2)}, ${cam.position.y.toFixed(2)}, ${cam.position.z.toFixed(2)}]`,
              'target =',
              `[${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)}]`
            );
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
          <group position={position as any} scale={scale}>
            <Model glbUrl={glbUrl} />
          </group>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
