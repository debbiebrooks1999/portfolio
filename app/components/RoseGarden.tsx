"use client"

import * as THREE from "three"
import React, { useRef, useMemo, useState, useEffect } from "react"
import { useFrame, useLoader } from "@react-three/fiber"
import { EXRLoader } from "three-stdlib"
import { useGLTF } from "@react-three/drei"

const VAT_LAST_FRAME = 339
const TYPES = [
  { start: 1, end: 110, type: 1.0 },
  { start: 115, end: 220, type: 2.0 },
  { start: 229, end: 338, type: 3.0 },
]

function RoseInstance({ position, typeInfo, geometry, vatTexture, onLifeEnd }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [frame, setFrame] = useState(typeInfo.start)
  const [phase, setPhase] = useState<"growing" | "staying" | "receding">("growing")
  const timer = useRef(0)

  useFrame((state, delta) => {
    const mat = meshRef.current.material as THREE.ShaderMaterial
    mat.uniforms.uTime.value = state.clock.elapsedTime
    const speed = delta * 150 

    if (phase === "growing") {
      setFrame(f => {
        if (f + speed >= typeInfo.end) { setPhase("staying"); return typeInfo.end }
        return f + speed
      })
    } else if (phase === "staying") {
      timer.current += delta
      if (timer.current > 3.0) setPhase("receding")
    } else if (phase === "receding") {
      setFrame(f => {
        if (f - speed <= typeInfo.start) { onLifeEnd(); return typeInfo.start }
        return f - speed
      })
    }
    mat.uniforms.uFrame.value = frame
  })

  const shaderArgs = useMemo(() => ({
    uniforms: {
      uVatPosTex: { value: vatTexture },
      uFrame: { value: typeInfo.start },
      uFrameCount: { value: VAT_LAST_FRAME + 1 },
      uRoseType: { value: typeInfo.type },
      uTime: { value: 0 },
      uUseVAT: { value: 1.0 },
      uGreen1: { value: new THREE.Color(0x00ff88) },
      uGreen2: { value: new THREE.Color(0x00ffcc) },
      uRedLight: { value: new THREE.Color(0xff00ff) },
      uRedMid: { value: new THREE.Color(0xff0088) },
      uDeepRedLight: { value: new THREE.Color(0x8800ff) },
      uDeepRedDark: { value: new THREE.Color(0x0088ff) },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uFrame;
      uniform sampler2D uVatPosTex;
      uniform float uFrameCount;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float u = clamp(uFrame, 0.0, uFrameCount - 1.0) / uFrameCount;
        vec4 vatPos = texture2D(uVatPosTex, vec2(u, uv2.y));
        pos = vatPos.rgb;
        vNormal = normalize(normalMatrix * normal);
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      uniform float uRoseType;
      uniform float uTime;
      void main() {
        vec3 color = (uRoseType < 1.5) ? vec3(0.0, 1.0, 0.5) : vec3(1.0, 0.0, 1.0);
        float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
        gl_FragColor = vec4(color * pulse, 1.0);
      }
    `, // Simplified for testing; replace with your full neon logic
    side: THREE.DoubleSide
  }), [vatTexture, typeInfo])

  return <mesh ref={meshRef} position={position} scale={20} geometry={geometry}>
    <shaderMaterial args={[shaderArgs]} transparent />
  </mesh>
}

export function RoseGarden({ spawnAt }) {
  const [roses, setRoses] = useState<any[]>([])
  const { nodes } = useGLTF("/Rose.glb")
  const vatTexture = useLoader(EXRLoader, "/Rose_pos.exr")

  const roseGeo = useMemo(() => {
    const geo = (nodes.Rose as THREE.Mesh).geometry.clone()
    if (!geo.attributes.uv2) {
      const uv2 = new Float32Array(geo.attributes.position.count * 2)
      for (let i = 0; i < geo.attributes.position.count; i++) uv2[i * 2 + 1] = i / 987.0
      geo.setAttribute("uv2", new THREE.BufferAttribute(uv2, 2))
    }
    return geo
  }, [nodes])

  useEffect(() => {
    if (!spawnAt) return
    const isNearby = roses.some(r => new THREE.Vector3(...r.pos).distanceTo(spawnAt) < 1.0)
    if (!isNearby) {
      const id = Math.random()
      const type = TYPES[Math.floor(Math.random() * TYPES.length)]
      setRoses(prev => [...prev, { id, pos: [spawnAt.x, 0, spawnAt.z], type }])
    }
  }, [spawnAt])

  return (
    <group>
      {roses.map(r => (
        <RoseInstance 
          key={r.id} 
          position={r.pos} 
          typeInfo={r.type} 
          geometry={roseGeo} 
          vatTexture={vatTexture}
          onLifeEnd={() => setRoses(prev => prev.filter(rose => rose.id !== r.id))}
        />
      ))}
    </group>
  )
}