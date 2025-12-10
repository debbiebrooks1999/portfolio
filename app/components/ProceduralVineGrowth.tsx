// components/ProceduralVineGrowth.tsx
"use client"
import * as React from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Instance, Instances } from "@react-three/drei"

type VineData = {
  id: number
  birthPoint: THREE.Vector3
  segments: THREE.Vector3[]
  growthProgress: number
  targetHeight: number
  curvature: THREE.Vector3
  thickness: number
  speed: number
}

type ProceduralVineGrowthProps = {
  birthSurface?: THREE.Mesh | null // The asphalt mesh to spawn from
  birthPoints?: THREE.Vector3[] // Specific spawn points
  vineCount?: number
  maxHeight?: number
  growthSpeed?: number
  segmentLength?: number
  maxSegments?: number
  vineColor?: string
  emissiveIntensity?: number
  climbTarget?: THREE.Object3D | null // Optional object to climb
  autoStart?: boolean
}

export default function ProceduralVineGrowth({
  birthSurface,
  birthPoints,
  vineCount = 20,
  maxHeight = 3,
  growthSpeed = 0.5,
  segmentLength = 0.1,
  maxSegments = 30,
  vineColor = "#00ff88",
  emissiveIntensity = 0.4,
  climbTarget,
  autoStart = true,
}: ProceduralVineGrowthProps) {
  const [vines, setVines] = React.useState<VineData[]>([])
  const [isGrowing, setIsGrowing] = React.useState(autoStart)
  const groupRef = React.useRef<THREE.Group>(null)

  // Initialize vines
  React.useEffect(() => {
    const newVines: VineData[] = []

    // Generate birth points
    let spawnPoints: THREE.Vector3[] = []

    if (birthPoints && birthPoints.length > 0) {
      spawnPoints = birthPoints
    } else {
      // Generate random points in a circular area
      for (let i = 0; i < vineCount; i++) {
        const angle = (i / vineCount) * Math.PI * 2 + Math.random() * 0.5
        const radius = Math.sqrt(Math.random()) * 4
        spawnPoints.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            0, // Start at floor level
            Math.sin(angle) * radius
          )
        )
      }
    }

    // Create vine data
    spawnPoints.forEach((point, i) => {
      const targetHeight = maxHeight * (0.6 + Math.random() * 0.4)
      
      newVines.push({
        id: i,
        birthPoint: point.clone(),
        segments: [point.clone()],
        growthProgress: 0,
        targetHeight,
        curvature: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          1,
          (Math.random() - 0.5) * 0.3
        ).normalize(),
        thickness: 0.02 + Math.random() * 0.03,
        speed: 0.5 + Math.random() * 0.5,
      })
    })

    setVines(newVines)
  }, [vineCount, maxHeight, birthPoints])

  // Grow vines over time
  useFrame((state, delta) => {
    if (!isGrowing) return

    setVines((prevVines) =>
      prevVines.map((vine) => {
        // Check if vine has reached target height
        const currentHeight = vine.segments[vine.segments.length - 1]?.y || 0
        if (currentHeight >= vine.targetHeight) {
          return vine // Stop growing
        }

        const newProgress = vine.growthProgress + delta * growthSpeed * vine.speed

        // Add new segment every time we cross a threshold
        if (
          newProgress > vine.segments.length * segmentLength &&
          vine.segments.length < maxSegments
        ) {
          const lastSegment =
            vine.segments[vine.segments.length - 1] || vine.birthPoint

          // Calculate next segment position
          let direction = vine.curvature.clone()

          // If there's a climb target, bias toward it
          if (climbTarget && currentHeight > 0.5) {
            const targetDir = new THREE.Vector3()
            climbTarget.getWorldPosition(targetDir)
            targetDir.sub(lastSegment)
            targetDir.normalize()
            
            // Blend natural growth with climb direction
            direction.lerp(targetDir, 0.3)
          }

          // Add some randomness/wiggle
          direction.x += (Math.random() - 0.5) * 0.2
          direction.z += (Math.random() - 0.5) * 0.2
          direction.normalize()

          const nextSegment = lastSegment
            .clone()
            .add(direction.multiplyScalar(segmentLength))

          return {
            ...vine,
            segments: [...vine.segments, nextSegment],
            growthProgress: newProgress,
          }
        }

        return {
          ...vine,
          growthProgress: newProgress,
        }
      })
    )
  })

  return (
    <group ref={groupRef}>
      {vines.map((vine) => (
        <Vine
          key={vine.id}
          segments={vine.segments}
          thickness={vine.thickness}
          color={vineColor}
          emissiveIntensity={emissiveIntensity}
        />
      ))}
    </group>
  )
}

// Individual vine renderer
function Vine({
  segments,
  thickness,
  color,
  emissiveIntensity,
}: {
  segments: THREE.Vector3[]
  thickness: number
  color: string
  emissiveIntensity: number
}) {
  const tubeRef = React.useRef<THREE.Mesh>(null)

  // Create curve from segments
  const curve = React.useMemo(() => {
    if (segments.length < 2) return null
    return new THREE.CatmullRomCurve3(segments)
  }, [segments])

  if (!curve) return null

  return (
    <>
      {/* Main vine tube */}
      <mesh ref={tubeRef}>
        <tubeGeometry args={[curve, segments.length * 2, thickness, 8, false]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Add leaves along the vine */}
      {segments.length > 2 && (
        <VineLeaves
          curve={curve}
          leafCount={Math.floor(segments.length / 2)}
          color={color}
          emissiveIntensity={emissiveIntensity}
        />
      )}
    </>
  )
}

// Leaves along the vine
function VineLeaves({
  curve,
  leafCount,
  color,
  emissiveIntensity,
}: {
  curve: THREE.Curve<THREE.Vector3>
  leafCount: number
  color: string
  emissiveIntensity: number
}) {
  const leaves = React.useMemo(() => {
    const leafData: Array<{
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: number
    }> = []

    for (let i = 0; i < leafCount; i++) {
      const t = (i + 0.5) / leafCount
      const point = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t)

      // Create rotation to align with vine direction
      const up = new THREE.Vector3(0, 1, 0)
      const axis = new THREE.Vector3().crossVectors(up, tangent).normalize()
      const angle = Math.acos(up.dot(tangent))

      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle)
      const euler = new THREE.Euler().setFromQuaternion(quaternion)
      
      // Add randomness
      euler.z += (Math.random() - 0.5) * Math.PI * 0.5

      leafData.push({
        position: point,
        rotation: euler,
        scale: 0.08 + Math.random() * 0.04,
      })
    }

    return leafData
  }, [curve, leafCount])

  return (
    <Instances limit={leafCount}>
      {/* Simple leaf geometry - could be replaced with custom shape */}
      <planeGeometry args={[1, 0.5]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity * 0.8}
        side={THREE.DoubleSide}
        roughness={0.7}
      />
      {leaves.map((leaf, i) => (
        <Instance
          key={i}
          position={leaf.position}
          rotation={leaf.rotation}
          scale={leaf.scale}
        />
      ))}
    </Instances>
  )
}

// Helper: Get random points on a mesh surface
export function getRandomPointsOnMesh(
  mesh: THREE.Mesh,
  count: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  const geometry = mesh.geometry

  if (!geometry.index) {
    geometry.computeBoundingBox()
  }

  const positionAttribute = geometry.attributes.position

  for (let i = 0; i < count; i++) {
    // Get random face
    const faceIndex = Math.floor(Math.random() * (positionAttribute.count / 3))
    const i0 = faceIndex * 3
    const i1 = i0 + 1
    const i2 = i0 + 2

    // Get triangle vertices
    const v0 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i0)
    const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i1)
    const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i2)

    // Random point on triangle (barycentric coordinates)
    const r1 = Math.random()
    const r2 = Math.random()
    const sqrt_r1 = Math.sqrt(r1)

    const point = new THREE.Vector3()
    point.addScaledVector(v0, 1 - sqrt_r1)
    point.addScaledVector(v1, sqrt_r1 * (1 - r2))
    point.addScaledVector(v2, sqrt_r1 * r2)

    // Transform to world space
    point.applyMatrix4(mesh.matrixWorld)

    points.push(point)
  }

  return points
}