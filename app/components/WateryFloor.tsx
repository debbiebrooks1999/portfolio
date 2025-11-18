// components/WateryFloor.tsx
import * as React from "react"
import * as THREE from "three"
import { useFrame, useLoader } from "@react-three/fiber"
import { MeshReflectorMaterial } from "@react-three/drei"

type WateryFloorProps = {
  /** Center position of the plane */
  position?: [number, number, number]
  /** Rotation of the plane, default is flat on XZ */
  rotation?: [number, number, number]
  /** Plane size (width, height) */
  size?: [number, number]
  /** Path to a seamless normal texture for water ripples */
  normalMapUrl?: string
  /** Overall tint of the water */
  color?: THREE.ColorRepresentation
  /** Reflection resolution */
  resolution?: number
}

export default function WateryFloor({
  position = [0, -0.3, 0],
  rotation = [-Math.PI / 2, 0, 0],
  size = [20, 20],
  normalMapUrl = "/textures/waternormals.jpg",
  color = "#0e1115",
  resolution = 1024
}: WateryFloorProps) {
  const mat = React.useRef<THREE.ShaderMaterial>(null!)
  const normalMap = useLoader(THREE.TextureLoader, normalMapUrl)

  // Configure the normal map tiling
  React.useMemo(() => {
    normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
    normalMap.repeat.set(6, 6) // increase for choppier look
  }, [normalMap])

  // Animate scrolling normals for subtle ripples
  useFrame((_, delta) => {
    normalMap.offset.x += delta * 0.02
    normalMap.offset.y += delta * 0.015
  })

  return (
    <group position={position}>
      <mesh rotation={rotation} receiveShadow>
        <planeGeometry args={[size[0], size[1]]} />
        <MeshReflectorMaterial
          ref={mat as any}
          // reflection feel
          mirror={0.95}                // strong reflections
          roughness={0.08}             // sharper highlights
          metalness={0.0}              // water isn’t metal
          mixStrength={18}             // reflection contribution
          blur={[200, 400]}            // mild blur for realism
          resolution={resolution}
          envMapIntensity={1.0}
          // depth/fresnel-ish
          depthScale={0.015}
          minDepthThreshold={0.9}
          maxDepthThreshold={1.0}
          // color tint
          color={color}
          // waviness
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
        />
      </mesh>
    </group>
  )
}
