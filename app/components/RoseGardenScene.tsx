import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { useEXRTexture } from './useEXRTexture'

import * as THREE from 'three'
import { CursorDisc } from './CursorDisc'
import { YardGrass } from './YardGrass'
import { RoseZone } from './RoseZone'

import { RoseZoneClickArea } from './RoseZoneClickArea'

interface RoseZoneData {
  id: string
  position: { x: number; z: number }
  isActive: boolean
  createdAt: number
}

interface RoseGardenSceneProps {
  groundRef?: React.RefObject<THREE.Mesh | THREE.Group | THREE.Object3D>
}

const HOVER_DELAY = 0.3 // seconds
const ZONE_MIN_DISTANCE = 3 // units

export function RoseGardenScene({ groundRef }: RoseGardenSceneProps) {
  const { camera, gl } = useThree()
  const internalGroundRef = useRef<THREE.Mesh>(null!)
  const actualGroundRef = groundRef || internalGroundRef
  
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const mouse = useMemo(() => new THREE.Vector2(), [])
  
  const [cursorPosition, setCursorPosition] = useState<THREE.Vector3 | null>(null)
  const [currentHoverPos, setCurrentHoverPos] = useState<{ x: number; z: number } | null>(null)
  const [hoverTimer, setHoverTimer] = useState(0)
  const [roseZones, setRoseZones] = useState<RoseZoneData[]>([])

  // Load Rose geometry and VAT texture
  const roseGltf = useGLTF('/models/Rose.glb')
  const vatTexture = useEXRTexture('/textures/Rose_pos.exr')
  
  // Configure VAT texture
  useMemo(() => {
    vatTexture.minFilter = THREE.NearestFilter
    vatTexture.magFilter = THREE.NearestFilter
  }, [vatTexture])

  // Find nearby zone
  const findNearbyZone = (pos: { x: number; z: number }) => {
    return roseZones.find(zone => {
      const dx = zone.position.x - pos.x
      const dz = zone.position.z - pos.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      return distance < ZONE_MIN_DISTANCE
    })
  }

  // Mouse move handler
  const handleMouseMove = (event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    
    if (actualGroundRef.current) {
      const intersects = raycaster.intersectObject(actualGroundRef.current, true)
      
      if (intersects.length > 0) {
        const point = intersects[0].point
        setCursorPosition(new THREE.Vector3(point.x, 0.05, point.z))
        setCurrentHoverPos({ x: point.x, z: point.z })
      } else {
        setCursorPosition(null)
        setCurrentHoverPos(null)
        setHoverTimer(0)
      }
    }
  }

  // Setup mouse listener
  useMemo(() => {
    const canvas = gl.domElement
    canvas.addEventListener('mousemove', handleMouseMove)
    return () => canvas.removeEventListener('mousemove', handleMouseMove)
  }, [gl, camera])

  // Update hover timer and spawn zones
  useFrame((state, delta) => {
    if (currentHoverPos) {
      // Check if near existing zone
      const nearbyZone = findNearbyZone(currentHoverPos)
      
      if (nearbyZone) {
        // Reactivate existing zone
        setRoseZones(zones => 
          zones.map(z => z.id === nearbyZone.id ? { ...z, isActive: true } : { ...z, isActive: false })
        )
        setHoverTimer(0)
      } else {
        // New zone - increment hover timer
        setHoverTimer(prev => {
          const newTimer = prev + delta
          
          if (newTimer >= HOVER_DELAY && roseGltf) {
            // Spawn new zone!
            const newZone: RoseZoneData = {
              id: `zone-${Date.now()}-${Math.random()}`,
              position: { x: currentHoverPos.x, z: currentHoverPos.z },
              isActive: true,
              createdAt: Date.now()
            }
            
            setRoseZones(zones => [
              ...zones.map(z => ({ ...z, isActive: false })),
              newZone
            ])
            
            return 0
          }
          
          return newTimer
        })
      }
    } else {
      // Mouse not over ground - deactivate all
      setRoseZones(zones => zones.map(z => ({ ...z, isActive: false })))
      setHoverTimer(0)
    }
  })

  // Cleanup fully reversed zones
  const handleZoneComplete = (zoneId: string) => {
    setRoseZones(zones => zones.filter(z => z.id !== zoneId))
  }

  return (
    <>
      {/* Cursor Disc */}
      {/* {cursorPosition && <CursorDisc position={cursorPosition} />} */}

      {/* Yard Grass Instances */}
       {/* <YardGrass position={[-2, 0, -0.2]} scale={[0.02, 0.02,0.02]} />  */}
      {/* <YardGrass position={[0, 0, -1]} scale={[0.02, 0.02,0.02]}/>
      <YardGrass position={[2, 0, -0.2]} scale={[0.02, 0.02,0.02]}/> */}

      {/* Rose Zones */}
      {/* {roseZones.map(zone => (
        <RoseZone
          key={zone.id}
          position={zone.position}
          isActive={zone.isActive}
          roseGeometry={roseGltf.scene}
          vatTexture={vatTexture}
          onComplete={() => handleZoneComplete(zone.id)}
        />
      ))} */}
        <group scale={0.2}>
          <RoseZoneClickArea
              roseGeometry={roseGltf.scene}
              vatTexture={vatTexture}
              position={{ x: 6, z: -1 }} 
            />
           <RoseZoneClickArea
              roseGeometry={roseGltf.scene}
              vatTexture={vatTexture}
              position={{ x: -6, z: 2 }} 
            />
             <RoseZoneClickArea
              roseGeometry={roseGltf.scene}
              vatTexture={vatTexture}
              position={{ x: 0, z: 3 }} 
            />
      </group>
    </>
  )
}

// Preload assets
useGLTF.preload('/models/Rose.glb')
useGLTF.preload('/models/yard_grass.glb')
useTexture.preload('/textures/Rose_pos.exr')