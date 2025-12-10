import { useRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

interface YardGrassProps {
  position: [number, number, number]
  scale: [number, number, number]
}

export function YardGrass({ position, scale }: YardGrassProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/models/yard_grass.glb')
  const { actions, mixer } = useAnimations(animations, group)

  // Play all animations with looping
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      console.log('🌿 Playing yard_grass animations:', Object.keys(actions))
      
      Object.values(actions).forEach(action => {
        if (action) {
          action.reset()
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.clampWhenFinished = false
          action.play()
          console.log('  ✓ Started animation:', action.getClip().name)
        }
      })
    } else {
      console.warn('⚠️ No animations found in yard_grass.glb')
    }

    // Cleanup
    return () => {
      Object.values(actions).forEach(action => {
        action?.stop()
      })
    }
  }, [actions])

  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  )
}