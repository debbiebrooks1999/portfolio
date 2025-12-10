// components/VoronoiPlantGrowth3D.tsx
"use client"
import * as React from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Instance, Instances } from "@react-three/drei"

type VoronoiPlantGrowth3DProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]
  plantCount?: number
  growthSpeed?: number
  plantColor?: string
  crackColor?: string
  emissiveIntensity?: number
  showCracks?: boolean
}

export default function VoronoiPlantGrowth3D({
  position = [0, -0.45, 1],
  rotation = [-Math.PI / 2.5, 0, -Math.PI / 2],
  size = [10, 10],
  plantCount = 150,
  growthSpeed = 0.5,
  plantColor = "#00ff88",
  crackColor = "#0affff",
  emissiveIntensity = 0.4,
  showCracks = true,
}: VoronoiPlantGrowth3DProps) {
  const groupRef = React.useRef<THREE.Group>(null)

  // Generate Voronoi-based plant positions
  const plantData = React.useMemo(() => {
    const plants: Array<{
      position: [number, number, number]
      scale: number
      rotation: number
      speed: number
      offset: number
    }> = []

    // Voronoi hash function
    const hash = (x: number, y: number) => {
      const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
      return h - Math.floor(h)
    }

    // Create Voronoi cells and place plants at edges (cracks)
    for (let i = 0; i < plantCount; i++) {
      const angle = (i / plantCount) * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * (size[0] / 2) * 0.9

      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 2

      // Voronoi clustering - plants grow in cracks
      const cellX = Math.floor(x * 0.5)
      const cellZ = Math.floor(z * 0.5)
      const voronoiOffset = hash(cellX, cellZ)

      if (voronoiOffset > 0.6) {
        // Only place plants in certain Voronoi cells
        plants.push({
          position: [x, 0, z],
          scale: 0.2 + Math.random() * 0.4,
          rotation: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 0.5,
          offset: Math.random() * Math.PI * 2,
        })
      }
    }

    return plants
  }, [plantCount, size])

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Cracked asphalt base (optional) */}
      {showCracks && (
        <mesh receiveShadow>
          <planeGeometry args={[size[0], size[1], 64, 64]} />
          <meshStandardMaterial
            color="#1a1a1c"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Glowing cracks (Voronoi pattern) */}
      {showCracks && (
        <VoronoiCracks
          size={size}
          color={crackColor}
          emissiveIntensity={emissiveIntensity}
        />
      )}

      {/* 3D Plant instances */}
      <PlantInstances
        plants={plantData}
        plantColor={plantColor}
        growthSpeed={growthSpeed}
        emissiveIntensity={emissiveIntensity}
      />
    </group>
  )
}

// Voronoi crack overlay
function VoronoiCracks({
  size,
  color,
  emissiveIntensity,
}: {
  size: [number, number]
  color: string
  emissiveIntensity: number
}) {
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uEmissive;
    varying vec2 vUv;
    
    vec2 hash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    
    float voronoi(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float minDist = 1.0;
      
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash(i + neighbor);
          vec2 diff = neighbor + point - f;
          minDist = min(minDist, length(diff));
        }
      }
      return minDist;
    }
    
    void main() {
      vec2 uv = vUv * 5.0;
      float v = voronoi(uv);
      
      // Create crack lines at Voronoi boundaries
      float cracks = smoothstep(0.05, 0.08, v);
      cracks = 1.0 - cracks;
      
      // Pulsing glow
      float pulse = sin(uTime * 2.0) * 0.3 + 0.7;
      vec3 glowColor = uColor * cracks * pulse * uEmissive;
      
      float alpha = cracks * 0.6;
      gl_FragColor = vec4(glowColor, alpha);
    }
  `

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uEmissive: { value: emissiveIntensity },
    }),
    [color, emissiveIntensity]
  )

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh position={[0, 0.01, 0]} renderOrder={1}>
      <planeGeometry args={[size[0], size[1]]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

// Instanced plant geometry
function PlantInstances({
  plants,
  plantColor,
  growthSpeed,
  emissiveIntensity,
}: {
  plants: Array<{
    position: [number, number, number]
    scale: number
    rotation: number
    speed: number
    offset: number
  }>
  plantColor: string
  growthSpeed: number
  emissiveIntensity: number
}) {
  const instancesRef = React.useRef<any>(null)

  useFrame((state) => {
    if (!instancesRef.current) return

    plants.forEach((plant, i) => {
      const t = state.clock.elapsedTime * growthSpeed * plant.speed + plant.offset

      // Animate growth - emerge and sway
      const growthHeight = Math.min(1, t * 0.2)
      const sway = Math.sin(t + plant.offset) * 0.1

      const matrix = new THREE.Matrix4()
      matrix.makeRotationY(plant.rotation + sway)
      matrix.setPosition(
        plant.position[0],
        plant.position[1] + growthHeight * plant.scale,
        plant.position[2]
      )
      matrix.scale(
        new THREE.Vector3(
          plant.scale,
          plant.scale * growthHeight,
          plant.scale
        )
      )

      instancesRef.current.setMatrixAt(i, matrix)
    })

    instancesRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <Instances ref={instancesRef} limit={plants.length}>
      <coneGeometry args={[0.05, 0.3, 3]} />
      <meshStandardMaterial
        color={plantColor}
        emissive={plantColor}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.2}
      />
      {plants.map((plant, i) => (
        <Instance key={i} />
      ))}
    </Instances>
  )
}