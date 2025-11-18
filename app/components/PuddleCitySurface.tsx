// components/PuddleCitySurface.tsx
import * as React from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { MeshReflectorMaterial } from "@react-three/drei"
import { EXRLoader } from "three-stdlib"

type PuddleCitySurfaceProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]

  waterNormalUrl?: string

  asphaltDiffuseUrl?: string
  asphaltDisplacementUrl?: string
  asphaltNormalUrl?: string
  asphaltRoughUrl?: string

  /** strength of displacement from asphalt_disp.png */
  asphaltDisplacementScale?: number

  /** 0–1: scale of the puddle plane relative to the asphalt */
  puddleScale?: number
}

export default function PuddleCitySurface({
  
  position = [0, -0.45, 1],
  rotation = [-Math.PI / 2.5, 0, -Math.PI / 2], // Added -Math.PI / 2 for Z-axis

  size = [10, 10],

  waterNormalUrl = "/textures/waternormals.jpg",

  asphaltDiffuseUrl = "/textures/asphalt_diff.jpg",
  asphaltDisplacementUrl = "/textures/asphalt_disp.png",
  asphaltNormalUrl = "/textures/asphalt_nor.exr",
  asphaltRoughUrl = "/textures/asphalt_rough.jpg",

  asphaltDisplacementScale = 0.05,
  puddleScale = 0.8, // puddle covers half the asphalt size
}: PuddleCitySurfaceProps) {
  /* ------------- Asphalt textures ------------- */
  const asphaltDiffuse = useOptionalTexture(asphaltDiffuseUrl)
  const asphaltDisplacement = useOptionalTexture(asphaltDisplacementUrl)
  const asphaltNormal = useOptionalTexture(asphaltNormalUrl)
  const asphaltRough = useOptionalTexture(asphaltRoughUrl)

  React.useMemo(() => {
    for (const t of [
      asphaltDiffuse,
      asphaltDisplacement,
      asphaltNormal,
      asphaltRough,
    ]) {
      if (t) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.repeat.set(4, 4)
      }
    }
  }, [asphaltDiffuse, asphaltDisplacement, asphaltNormal, asphaltRough])

  /* ------------- Water normal ------------- */
  const waterNormal = useOptionalTexture(waterNormalUrl)

  React.useMemo(() => {
    if (!waterNormal) return
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping
    waterNormal.repeat.set(6, 6)
  }, [waterNormal])

  // useFrame((_, delta) => {
  //   if (!waterNormal) return
  //   waterNormal.offset.x += delta * 0.011
  //   waterNormal.offset.y += delta * 0.011
  // })

  const puddleWidth = size[0] * puddleScale
  const puddleHeight = size[1] * puddleScale

  return (
    <group position={position}>
      
      {/* Base asphalt */}
      <mesh rotation={rotation} receiveShadow>
        
        <planeGeometry args={[size[0], size[1], 128, 128]} />
        <meshStandardMaterial
          color={new THREE.Color("#202225")}
          map={asphaltDiffuse ?? null}
          displacementMap={asphaltDisplacement ?? null}
          displacementScale={asphaltDisplacement ? asphaltDisplacementScale : 0}
          normalMap={asphaltNormal ?? null}
          roughnessMap={asphaltRough ?? null}
          roughness={0.95}
          metalness={0.0}
          envMapIntensity={0.25}
        />
      </mesh>

      {/* Big obvious reflective puddle in the middle */}
      <mesh
        rotation={rotation}
        position={[0, 0.03, 0]} // slightly above asphalt
        renderOrder={1}         // draw on top of asphalt
      >
        <planeGeometry args={[puddleWidth, puddleHeight]} />
       <MeshReflectorMaterial
          mirror={1}
          mixStrength={3}        // Reduced from 5 for subtler effect
          mixBlur={0.5}          // Reduced from 1 for sharper reflections
          blur={[50, 100]}       // Much lower - sharp puddle reflections
          resolution={1024}
          roughness={0.05}       // Slightly increased for still water
          depthScale={0.01}      // Reduced
          minDepthThreshold={0.8}
          maxDepthThreshold={1.0}
          color="#2a3f52"        // Darker, more subtle puddle color
          normalMap={waterNormal ?? null}
          normalScale={new THREE.Vector2(0.15, 0.15)}  // Much smaller - barely any ripples
          transparent={false}
        />
              </mesh>
    </group>
  )
}

/**
 * Loads a texture but tolerates 404/missing by returning undefined.
 * Uses EXRLoader only for .exr (your asphalt normal).
 */
function useOptionalTexture(url?: string) {
  const [tex, setTex] = React.useState<THREE.Texture | undefined>(undefined)

  React.useEffect(() => {
    if (!url) return
    let alive = true

    const isExr = url.toLowerCase().endsWith(".exr")
    const loader = isExr ? new EXRLoader() : new THREE.TextureLoader()

    loader.load(
      url,
      (loaded: any) => {
        if (!alive) return
        const texture = loaded as THREE.Texture
        setTex((prev) => {
          prev?.dispose?.()
          return texture
        })
      },
      undefined,
      () => setTex(undefined)
    )

    return () => {
      alive = false
    }
  }, [url])

  return tex
}