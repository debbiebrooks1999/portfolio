"use client"

import React, { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"

type Props = {
  start: boolean
  duration?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  url?: string
}

export default function PCModelWithIntro({
  start,
  duration = 1.2,
  position = [0, -1.5, -1],
  rotation = [0, Math.PI / 2, 0],
  scale = 0.5,
  url = "/models/90sPC.glb",
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const tRef = useRef(0)

  const { scene: original } = useGLTF(url)
  const scene = useMemo(() => original.clone(true), [original])

  useEffect(() => {
    if (!groupRef.current) return

    // ✅ set final pose immediately so you can position it before anim
    groupRef.current.position.set(...position)
    groupRef.current.rotation.set(...rotation)
    groupRef.current.scale.setScalar(scale)

    if (start) tRef.current = 0
  }, [start, position, rotation, scale])

  useFrame((_, delta) => {
    if (!start || !groupRef.current) return
    tRef.current = Math.min(1, tRef.current + delta / Math.max(0.001, duration))
    const t = tRef.current
    const ease = t * t * (3 - 2 * t) // smoothstep
    const mult = THREE.MathUtils.lerp(0.85, 1.0, ease)
    groupRef.current.scale.setScalar(scale * mult)
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload("/models/90sPC.glb")