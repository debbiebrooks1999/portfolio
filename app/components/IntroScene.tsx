import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'

function ScreenContent({
  text,
  speed = 25,
  position = [0, 1.48, -1],
  rotation = [THREE.MathUtils.degToRad(20), 0, 0], // default 20° X tilt
}: {
  text: string
  speed?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayText('')
    indexRef.current = 0
    const type = () => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text.charAt(indexRef.current))
        indexRef.current++
        setTimeout(type, Math.random() * 30 + speed)
      }
    }
    type()
  }, [text, speed])

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(v => !v), 700)
    return () => clearInterval(blink)
  }, [])

  const texture = useMemo(() => {
    const canvas = canvasRef.current
    canvas.width = 1024
    canvas.height = 768
    const tex = new THREE.CanvasTexture(canvas)
    textureRef.current = tex
    return tex
  }, [])

  useFrame(() => {
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#010a01'
    ctx.fillRect(0, 0, 1024, 768)

    ctx.fillStyle = 'rgba(0, 255, 0, 0.05)'
    for (let i = 0; i < 768; i += 4) ctx.fillRect(0, i, 1024, 2)

    const gradient = ctx.createRadialGradient(512, 384, 100, 512, 384, 600)
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)')
    gradient.addColorStop(1, 'rgba(0, 20, 0, 0.4)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 768)

    ctx.font = 'bold 36px "Courier New", monospace'
    ctx.fillStyle = '#33ff33'
    ctx.shadowBlur = 12
    ctx.shadowColor = '#00ff00'

    const lines = ("> RUN PORTFOLIO.BAS\nLOADING...\n\n" + displayText).toUpperCase().split('\n')
    lines.forEach((line, i) => ctx.fillText(line, 60, 100 + i * 45))

    if (showCursor) {
      const lastLine = lines[lines.length - 1]
      const metrics = ctx.measureText(lastLine)
      ctx.fillRect(65 + metrics.width, 70 + (lines.length - 1) * 45, 20, 35)
    }

    textureRef.current!.needsUpdate = true
  })

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[1.8, 1.35]} />
        <meshStandardMaterial
          map={texture}
          emissive={'#00ff00'}
          emissiveIntensity={0.5}
          emissiveMap={texture}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

//  position={[0, -1.5, -1]} // Move down 1 unit
//       rotation={[0, Math.PI / 2, 0]} // Rotate 90 deg right

function PCModel({
  text,
  modelPosition = [0, -1.5, -1],
  modelRotation = [0, Math.PI / 2, 0], // 90° right
  screenPosition = [0, 0, 0],
  screenRotation = [THREE.MathUtils.degToRad(-20), 0, 0],
}: {
  text: string
  modelPosition?: [number, number, number]
  modelRotation?: [number, number, number]
  screenPosition?: [number, number, number]
  screenRotation?: [number, number, number]
}) {
  const { scene } = useGLTF('./models/90sPC.glb')

  return (
    <group>
      {/* GLTF model: rotate/position independently */}
      <group position={modelPosition} rotation={modelRotation}>
        <primitive object={scene} scale={0.5} />
      </group>

      {/* Screen: rotate/position independently */}
      <ScreenContent
        text={text}
        position={screenPosition}
        rotation={screenRotation}
      />
    </group>
  )
}

export default function TerminalScene({ text = "Handshake established...\nSystem ready." }) {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <Environment preset="city" environmentIntensity={0.2} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <React.Suspense fallback={null}>
          <PCModel
            text={text}
            // Example: rotate only the model
            // modelRotation={[0, Math.PI / 2 + 0.2, 0]}

            // Example: rotate only the screen
            // screenRotation={[THREE.MathUtils.degToRad(35), 0, 0]}
          />
        </React.Suspense>

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}