// RoseZoneClickArea.tsx
import { useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { RoseZone } from './RoseZone'

interface RoseZoneClickAreaProps {
  roseGeometry: THREE.Object3D
  vatTexture: THREE.Texture

  /**
   * World-space spawn location for the roses and the click object.
   * Matches RoseZone's { x, z } format.
   */
  position?: { x: number; z: number }
}

/**
 * A clearly visible click target that toggles a RoseZone animation:
 * - click when OFF  -> roses grow (isActive = true)
 * - click when ON   -> roses reverse (isActive = false)
 *
 * Works alongside the existing mouseover/mouseout approach.
 */
export function RoseZoneClickArea({
  roseGeometry,
  vatTexture,
  position = { x: 0, z: 0 },
}: RoseZoneClickAreaProps) {
  const [isActive, setIsActive] = useState(false)

  const CLICK_Y = 0.02
  const CLICK_RADIUS = 0.6

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()

    // 🔁 TOGGLE behavior:
    // - if currently inactive -> activate (play forward)
    // - if currently active   -> deactivate (play reverse)
    setIsActive(prev => !prev)
  }

  return (
    <group>
      {/* Visible clickable disc */}
      <mesh
        position={[position.x, CLICK_Y, position.z]}
        onClick={handleClick}
        castShadow={false}
        receiveShadow={false}
      >
        <cylinderGeometry args={[CLICK_RADIUS, CLICK_RADIUS, 0.04, 32]} />
        <meshStandardMaterial
          transparent
          opacity={0.6}
          color={isActive ? 'hotpink' : 'white'}
          emissive={isActive ? 'hotpink' : 'black'}
        />
      </mesh>

      {/* Roses grow/reverse from this same position */}
      <RoseZone
        position={position}
        isActive={isActive}
        roseGeometry={roseGeometry}
        vatTexture={vatTexture}
        onComplete={() => {
          // With your current RoseZone, this is used mainly by the hover system.
          // For toggle-click behavior, we usually keep the zone around, so we
          // don't remove it here.
        }}
      />
    </group>
  )
}