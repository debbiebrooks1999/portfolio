// components/PuddleCitySurface.tsx
import * as React from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
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
  
  /** Show red hover disc */
  showHoverDisc?: boolean
  
  /** Hover disc radius */
  hoverDiscRadius?: number
  
  /** Hover disc color */
  hoverDiscColor?: string
}

export default function PuddleCitySurface({
  
  position = [0, -0.45, 1],
  rotation = [-Math.PI / 2.5, 0, -Math.PI / 2],

  size = [10, 10],

  waterNormalUrl = "/textures/waternormals.jpg",

  asphaltDiffuseUrl = "/textures/asphalt_diff.jpg",
  asphaltDisplacementUrl = "/textures/asphalt_disp.png",
  asphaltNormalUrl = "/textures/asphalt_nor.exr",
  asphaltRoughUrl = "/textures/asphalt_rough.jpg",

  asphaltDisplacementScale = 0.05,
  puddleScale = 0.8,
  
  showHoverDisc = false,
  hoverDiscRadius = 0.3,
  hoverDiscColor = "#ff0000",
}: PuddleCitySurfaceProps) {
  const asphaltRef = React.useRef<THREE.Mesh>(null)
  const hoverDiscRef = React.useRef<THREE.Mesh>(null)
  const raycaster = React.useRef(new THREE.Raycaster())
  const pointer = React.useRef(new THREE.Vector2())

  const { camera, gl, size: viewport } = useThree()


  /* ------------- Texture Loading ------------- */
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

  const waterNormal = useOptionalTexture(waterNormalUrl)

  React.useMemo(() => {
    if (!waterNormal) return
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping
    waterNormal.repeat.set(6, 6)
  }, [waterNormal])


  // Track mouse movement
  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / viewport.width) * 2 - 1
      pointer.current.y = -(event.clientY / viewport.height) * 2 + 1
    }

    window.addEventListener("pointermove", handlePointerMove)
    return () => window.removeEventListener("pointermove", handlePointerMove)
  }, [viewport])

  // Raycast to detect hover and update the disc position
  useFrame(() => {
    const yOffset = 1.3 // The required offset to ensure raycasting hits the mesh

    if (!showHoverDisc || !asphaltRef.current || !hoverDiscRef.current) {
      return
    }

    raycaster.current.setFromCamera(pointer.current, camera)
    
    // Only raycast against the asphalt mesh specifically
    const intersects = raycaster.current.intersectObject(asphaltRef.current, false)

    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point
      
      // Position the hover disc at intersection point + the Y offset
      hoverDiscRef.current.position.copy(intersectPoint)
      hoverDiscRef.current.position.y += yOffset 
      hoverDiscRef.current.visible = true 

    } else {
      hoverDiscRef.current.visible = false
    }
  })

  const puddleWidth = size[0] * puddleScale
  const puddleHeight = size[1] * puddleScale

  return (
    <group position={position}>
      
      {/* Base asphalt (The original surface) */}
      <mesh ref={asphaltRef} rotation={rotation} receiveShadow>
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
          // No onBeforeCompile hook here
        />
      </mesh>

      {/* Reflective puddle */}
      <mesh
        rotation={rotation}
        position={[0, 0.03, 0]}
        renderOrder={1}
      >
        <planeGeometry args={[puddleWidth, puddleHeight]} />
        <MeshReflectorMaterial
          mirror={1}
          mixStrength={3}
          mixBlur={0.5}
          blur={[50, 100]}
          resolution={1024}
          roughness={0.05}
          depthScale={0.01}
          minDepthThreshold={0.8}
          maxDepthThreshold={1.0}
          color="#2a3f52"
          normalMap={waterNormal ?? null}
          normalScale={new THREE.Vector2(0.15, 0.15)}
          transparent={false}
        />
      </mesh>

      {/* Red hover disc - Now used only for simple position tracking */}
      {showHoverDisc && (
        <mesh
          ref={hoverDiscRef}
          rotation={rotation}
          visible={false} 
          renderOrder={2}
        >
          <circleGeometry args={[hoverDiscRadius, 32]} />
          <meshBasicMaterial
            color={hoverDiscColor}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
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