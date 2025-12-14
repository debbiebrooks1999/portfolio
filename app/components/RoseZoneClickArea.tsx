import { useState, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { useGLTF, Clone } from '@react-three/drei'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { RoseZone } from './RoseZone'

interface RoseZoneClickAreaProps {
  roseGeometry: THREE.Object3D
  vatTexture: THREE.Texture
  position?: { x: number; z: number }
  scale?: number
}

type ManholeGLTF = GLTF & { scene: THREE.Group }

/**
 * Manhole that:
 * - On click: toggles between grow/shrink
 * - Grows: rotates clockwise
 * - Shrinks: rotates counter-clockwise
 */
export function RoseZoneClickArea({
  roseGeometry,
  vatTexture,
  position = { x: 0, z: 0 },
  scale = 1,
}: RoseZoneClickAreaProps) {
  const [isActive, setIsActive] = useState(false)       // controls RoseZone direction (true=grow, false=shrink)
  const [isRotating, setIsRotating] = useState(false)   // whether manhole is currently spinning
  const [rotationDir, setRotationDir] = useState<1 | -1>(1) // 1=clockwise, -1=counter-clockwise
  const [isHovered, setIsHovered] = useState(false)

  const manholeRef = useRef<THREE.Group>(null)

  const manholeGltf = useGLTF('/models/Manhole.glb') as ManholeGLTF

  // Rotate the manhole while animation is running
  useFrame((_, delta) => {
    if (isRotating && manholeRef.current) {
      const rotationSpeed = 2.0
      manholeRef.current.rotation.y += rotationDir * rotationSpeed * delta
    }
  })

  /**
   * Click: toggle between grow/shrink
   */
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    // Only toggle if not currently animating
    if (!isRotating) {
      const nextState = !isActive
      
      setIsActive(nextState)
      setRotationDir(nextState ? 1 : -1)  // Clockwise when growing, counter-clockwise when shrinking
      setIsRotating(true)
    }
  }

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(true)
  }

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setIsHovered(false)
  }

  /**
   * Called when RoseZone signals that the current animation is complete
   */
  const handleZoneComplete = () => {
    setIsRotating(false)
  }

  return (
    <group>
      {/* <group
        ref={manholeRef}
        position={[position.x, 0, position.z]}
        scale={scale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <Clone object={manholeGltf.scene} />
        
        {isHovered && !isRotating && (
          <pointLight
            position={[0, 0.5, 0]}
            intensity={2}
            distance={3}
            color="#00ffff"
          />
        )}
      </group> */}

      <RoseZone
        position={position}
        isActive={isActive}
        roseGeometry={roseGeometry}
        vatTexture={vatTexture}
        onComplete={handleZoneComplete}
      />
    </group>
  )
}

useGLTF.preload('/models/Manhole.glb')