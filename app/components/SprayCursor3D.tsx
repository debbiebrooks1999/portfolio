"use client"

import * as THREE from "three"
import { useEffect, useRef } from "react"
import { useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"

type Props = {
  enabled: boolean
}

export function SprayCursor3D({ enabled }: Props) {
  const group = useRef<THREE.Group>(null)

  const { camera, size } = useThree()
  const { scene } = useGLTF("/models/spray_can.glb") 

  useEffect(() => {
    if (!enabled) return

    const handleMove = (e: PointerEvent) => {
        if (!group.current) return

        // Screen (client) → NDC with 50px downward offset
        const ndcX = (e.clientX / size.width) * 2 - 1
        const ndcY = -((e.clientY + 120) / size.height) * 2 + 1

        const ndc = new THREE.Vector3(ndcX, ndcY, 0.5)
        ndc.unproject(camera)

        const dir = ndc.sub(camera.position).normalize()
        const distance = 2
        const pos = camera.position.clone().add(dir.multiplyScalar(distance))

        group.current.position.copy(pos)

        group.current.lookAt(
            camera.position.x,
            camera.position.y,
            camera.position.z + 5
        )
    }

    window.addEventListener("pointermove", handleMove)
    return () => window.removeEventListener("pointermove", handleMove)
  }, [camera, size.width, size.height, enabled])

  if (!enabled) return null

  return (
    <group ref={group} scale={0.7} position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

// optional: pre-load the model
useGLTF.preload("/models/spray_can.glb")