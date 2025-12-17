import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'

// --------------------
// HTML overlay loader (same as before, shortened a bit)
// --------------------
function GLBOverlayLoader() {
  const { active, progress } = useProgress()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setVisible(false), 450)
      return () => clearTimeout(t)
    } else setVisible(true)
  }, [active, progress])

  const p = Math.min(100, Math.max(0, progress))
  const scale = 0.85 + (p / 100) * 0.15

  if (!visible) return null

  return (
    <div className="overlay">
      <style jsx>{`
        .overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          z-index: 10;
        }
        .crt {
          width: min(80vmin, 900px);
          aspect-ratio: 1 / 1;
          border-radius: 28px;
          overflow: hidden;
          background: rgba(0, 8, 0, 0.35);
          box-shadow: 0 0 0 2px rgba(0, 255, 0, 0.12) inset, 0 0 35px rgba(0, 255, 0, 0.1);
          transform: perspective(900px) rotateX(2.5deg) scale(${scale});
          transition: transform 220ms ease, opacity 320ms ease;
          opacity: ${active ? 1 : 0};
          position: relative;
        }
        .crt::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 45%,
            rgba(0, 255, 0, 0.06) 0%,
            rgba(0, 0, 0, 0) 55%,
            rgba(0, 0, 0, 0.35) 78%,
            rgba(0, 0, 0, 0.65) 100%);
          transform: scale(1.06, 1.03);
          mix-blend-mode: multiply;
          pointer-events: none;
        }
        .crt::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.22;
          background: repeating-linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0) 0px,
            rgba(0, 0, 0, 0) 2px,
            rgba(0, 0, 0, 0.22) 3px,
            rgba(0, 0, 0, 0) 4px
          );
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .content {
          position: absolute;
          inset: 10%;
          font-family: 'Courier New', monospace;
          color: #00ff00;
          text-shadow: 0 0 5px rgba(0,255,0,0.85), 0 0 10px rgba(0,255,0,0.55), 0 0 18px rgba(0,255,0,0.3);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(0, 255, 0, 0.12);
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(0, 255, 0, 0.18) inset;
        }
        .barFill {
          width: ${p}%;
          height: 100%;
          background: rgba(0, 255, 0, 0.85);
          transition: width 140ms linear;
          box-shadow: 0 0 10px rgba(0,255,0,0.45), 0 0 18px rgba(0,255,0,0.25);
        }
      `}</style>

      <div className="crt">
        <div className="content">
          <div>{'> RUN SCENE.LOAD'}</div>
          <div>{`> LOADING 90sPC.GLB... ${p.toFixed(0)}%`}</div>
          <div className="bar"><div className="barFill" /></div>
        </div>
      </div>
    </div>
  )
}

// --------------------
// GLB with multi-material fade-in
// --------------------
function PCModelFading({
  fadeDuration = 1.0, // seconds
}: {
  fadeDuration?: number
}) {
  const { scene: original } = useGLTF('./models/90sPC.glb')

  // Clone so we don't mutate the cached GLTF
  const scene = useMemo(() => original.clone(true), [original])

  // Store original opacities per-material so we can fade to the intended value
  const materialTargetsRef = useRef<Map<THREE.Material, number>>(new Map())
  const tRef = useRef(0)

  useEffect(() => {
    materialTargetsRef.current.clear()
    tRef.current = 0

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m) => {
        if (!m) return
        const mat = m as THREE.Material & { opacity?: number; transparent?: boolean; depthWrite?: boolean }
        const target = typeof mat.opacity === 'number' ? mat.opacity : 1

        // remember where we want to end up
        materialTargetsRef.current.set(mat, target)

        // prep for fading
        mat.transparent = true
        if (typeof mat.opacity === 'number') mat.opacity = 0
        // helps avoid weird sorting artifacts during fade
        mat.depthWrite = false

        mat.needsUpdate = true
      })
    })

    // cleanup: restore depthWrite after fade (optional, but nice)
    return () => {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        if (!mesh.isMesh) return
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => {
          if (!m) return
          const mat = m as THREE.Material & { depthWrite?: boolean }
          mat.depthWrite = true
        })
      })
    }
  }, [scene])

  useFrame((_, delta) => {
    tRef.current = Math.min(1, tRef.current + delta / Math.max(0.001, fadeDuration))
    const t = tRef.current

    materialTargetsRef.current.forEach((targetOpacity, mat) => {
      const m = mat as THREE.Material & { opacity?: number; depthWrite?: boolean }
      if (typeof m.opacity === 'number') m.opacity = THREE.MathUtils.lerp(0, targetOpacity, t)
      if (t >= 1) m.depthWrite = true
    })
  })

  return (
    <group position={[0, -1.5, -1]} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} scale={0.5} />
    </group>
  )
}

useGLTF.preload('./models/90sPC.glb')

// --------------------
// Wrapper
// --------------------
export default function TerminalScene() {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000', position: 'relative' }}>
      <GLBOverlayLoader />

      <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <Environment preset="city" environmentIntensity={0.2} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <React.Suspense fallback={null}>
          <PCModelFading fadeDuration={1.2} />
        </React.Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}