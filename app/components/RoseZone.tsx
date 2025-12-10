import { useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoseInstance } from './RoseInstance'

interface RoseZoneProps {
  position: { x: number; z: number }
  isActive: boolean
  roseGeometry: THREE.Object3D
  vatTexture: THREE.Texture
  onComplete: () => void
  scaleMultiplier?: number,

}

interface RoseData {
  id: string
  position: [number, number, number]
  scale: [number, number, number]
  delay: number
  roseType: number
  startFrame: number
  endFrame: number
}

const ROSE_CONFIGS = [
  { startFrame: 1, endFrame: 110, type: 1 },   // Green
  { startFrame: 115, endFrame: 220, type: 2 }, // Red
  { startFrame: 229, endFrame: 338, type: 3 }  // Deep Red
]

function getRandomScale() {
  const baseScale = 20 + Math.random() * 25
  const heightMultiplier = 0.9 + Math.random() * 0.2
  const widthMultiplier = 0.9 + Math.random() * 0.2
  
  return [
    baseScale * widthMultiplier,
    baseScale * heightMultiplier,
    baseScale * widthMultiplier
  ] as [number, number, number]
}

export function RoseZone({ position, isActive, roseGeometry, vatTexture, onComplete }: RoseZoneProps) {
  const [roses, setRoses] = useState<RoseData[]>([])
  const [allReversed, setAllReversed] = useState(false)

  // Generate rose positions on mount
  useEffect(() => {
    const newRoses: RoseData[] = []
    
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const radius = 0.4 + Math.random() * 0.6
      const offsetX = Math.cos(angle) * radius
      const offsetZ = Math.sin(angle) * radius
      const instanceScale = getRandomScale()

      // Create 3 roses per position (different colors)
      for (let j = 0; j < 3; j++) {
        const config = ROSE_CONFIGS[j]
        
        newRoses.push({
          id: `rose-${i}-${j}-${Date.now()}`,
          position: [
            position.x + offsetX,
            0,
            position.z + offsetZ
          ],
          scale: instanceScale,
          delay: i * 0.4,
          roseType: config.type,
          startFrame: config.startFrame,
          endFrame: config.endFrame
        })
      }
    }
    
    setRoses(newRoses)
  }, [])

  // Check if all roses are fully reversed
  const handleRoseUpdate = (id: string, isAtStart: boolean) => {
    if (!isActive) {
      const allAtStart = roses.every((_, idx) => {
        // This is a simplified check - in real implementation,
        // each rose would report its state
        return true // Placeholder
      })
      
      if (allAtStart && !allReversed) {
        setAllReversed(true)
        onComplete()
      }
    }
  }

  return (
    <group>
      {roses.map(rose => (
        <RoseInstance
          key={rose.id}
          position={rose.position}
          scale={rose.scale}
          delay={rose.delay}
          roseType={rose.roseType}
          startFrame={rose.startFrame}
          endFrame={rose.endFrame}
          isActive={isActive}
          roseGeometry={roseGeometry}
          vatTexture={vatTexture}
          onUpdate={(isAtStart) => handleRoseUpdate(rose.id, isAtStart)}
        />
      ))}
    </group>
  )
}
