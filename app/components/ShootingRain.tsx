// components/ShootingRain.tsx
import * as React from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

type ShootingRainProps = {
  position?: [number, number, number]
}

export default function ShootingRain({
  position = [0, 0, 0],
}: ShootingRainProps) {
  return (
    <group position={position}>
      {/* 4 capsules moving up */}
      <RainCapsule
        startPos={[-2, -3, 0]}
        direction="up"
        color="#00ffff"
        speed={2.5}
        delay={0}
      />
      <RainCapsule
        startPos={[-0.5, -4, 0.5]}
        direction="up"
        color="#ff00ff"
        speed={3}
        delay={0.3}
      />
      <RainCapsule
        startPos={[1.2, -2.5, -0.3]}
        direction="up"
        color="#00ff88"
        speed={2.8}
        delay={0.6}
      />
      <RainCapsule
        startPos={[2.5, -3.8, 0.2]}
        direction="up"
        color="#ffff00"
        speed={2.6}
        delay={0.9}
      />

      {/* 3 capsules moving down */}
      <RainCapsule
        startPos={[-1.5, 3, -0.4]}
        direction="down"
        color="#ff0088"
        speed={2.7}
        delay={0.2}
      />
      <RainCapsule
        startPos={[0.8, 4, 0.3]}
        direction="down"
        color="#8800ff"
        speed={3.2}
        delay={0.5}
      />
      <RainCapsule
        startPos={[2, 2.5, -0.2]}
        direction="down"
        color="#00ffaa"
        speed={2.4}
        delay={0.8}
      />
    </group>
  )
}

type RainCapsuleProps = {
  startPos: [number, number, number]
  direction: "up" | "down"
  color: string
  speed: number
  delay: number
}

function RainCapsule({
  startPos,
  direction,
  color,
  speed,
  delay,
}: RainCapsuleProps) {
  const capsuleRef = React.useRef<THREE.Mesh>(null!)
  const glowRef = React.useRef<THREE.Mesh>(null!)
  const trailRef = React.useRef<THREE.Line>(null!)
  const timeRef = React.useRef(delay)
  const trailPositions = React.useRef<THREE.Vector3[]>([])

  const colorObj = React.useMemo(() => new THREE.Color(color), [color])
  
  // Travel distance (ping pong range)
  const travelDistance = 6

  useFrame((_, delta) => {
    timeRef.current += delta

    // Ping-pong animation
    const cycle = (timeRef.current * speed) % (Math.PI * 2)
    const pingPong = Math.sin(cycle) // oscillates -1 to 1
    
    const offset = pingPong * travelDistance
    const yPos = direction === "up" 
      ? startPos[1] + offset 
      : startPos[1] - offset

    if (capsuleRef.current && glowRef.current) {
      const newPosition = new THREE.Vector3(startPos[0], yPos, startPos[2])
      capsuleRef.current.position.copy(newPosition)
      glowRef.current.position.copy(newPosition)
      
      // Track positions for motion blur trail
      trailPositions.current.push(capsuleRef.current.position.clone())
      if (trailPositions.current.length > 8) {
        trailPositions.current.shift()
      }
    }

    // Update motion blur trail
    if (trailRef.current && trailPositions.current.length > 1) {
      const geometry = trailRef.current.geometry as THREE.BufferGeometry
      const positions = new Float32Array(trailPositions.current.length * 3)
      
      trailPositions.current.forEach((pos, i) => {
        positions[i * 3] = pos.x
        positions[i * 3 + 1] = pos.y
        positions[i * 3 + 2] = pos.z
      })
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    }
  })

  return (
    <group>
      {/* Main capsule */}
      <mesh ref={capsuleRef}>
        <capsuleGeometry args={[0.02, 0.4, 4, 16]} />
        <meshStandardMaterial
          color={colorObj}
          emissive={colorObj}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Motion blur trail */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial
          color={colorObj}
          transparent
          opacity={0.4}
          linewidth={3}
          blending={THREE.AdditiveBlending}
        />
      </line>

      {/* Glow effect */}
      <mesh ref={glowRef}>
        <capsuleGeometry args={[0.12, 0.5, 8, 16]} />
        <meshBasicMaterial
          color={colorObj}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
