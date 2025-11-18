import * as THREE from "three"
import React, { useEffect, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import { ThreeElements, useFrame } from "@react-three/fiber"
import { fireModelClick, fireHoverModel, fireUserClick } from "../events"

type ModelLoaderProps = ThreeElements["group"] & {
  glbUrl: string
  onClick?: (e: any) => void
}

// New mesh step order
const STEP_ORDER = [
  "Platonic__0",
  "Torus_3__0",
  "Torus_1__0",
  "Torus__0",
  "Torus_2__0",
] as const

// Traveling color order (same color pulses across all meshes, then next color)
const TRAVEL_COLORS: Array<{ color: number; label: string }> = [
  { color: 0x39ff14, label: "neon-green" },
  { color: 0x00ffff, label: "cyan" },
  { color: 0xff00ff, label: "magenta" },
  { color: 0xffff00, label: "yellow" },
]

export default function ModelLoader({ glbUrl, onClick: userOnClick, ...groupProps }: ModelLoaderProps) {
  const group = useRef<THREE.Group>(null!)
  const gltf = useGLTF(glbUrl)
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene
  const animations = Array.isArray(gltf) ? gltf[0].animations : gltf.animations

  // Animation: only on click
  const mixer = useRef<THREE.AnimationMixer | null>(null)
  const actionRef = useRef<THREE.AnimationAction | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)

  const [isHovered, setIsHovered] = React.useState(false)

  const targetsRef = useRef<Array<{
    mesh: THREE.Mesh
    mat: THREE.MeshPhysicalMaterial
    baseColor: THREE.Color
    baseEmissive: THREE.Color
  }>>([])

  const nameToIndexRef = useRef<Record<string, number>>({})
  const meshIdxRef = useRef(0)   // current mesh in STEP_ORDER
  const colorIdxRef = useRef(0)  // current traveling color
  const stepIntervalRef = useRef<number | null>(null)

  // Set up GLB animation (play only when user clicks)
  useEffect(() => {
    if (animations && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene)
      const action = mixer.current.clipAction(animations[0])
      action.timeScale = 4
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      actionRef.current = action
      mixer.current.addEventListener("finished", () => setIsPlaying(false))
    }
    return () => { mixer.current?.stopAllAction() }
  }, [scene, animations])

  // Assign all meshes a glassy material and collect only those in STEP_ORDER
  useEffect(() => {
    const localTargets: typeof targetsRef.current = []
    const idxMap: Record<string, number> = {}

    const makeGlass = () =>
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        thickness: 0.35,
        ior: 1.5,
        roughness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.2,
      })

    scene.traverse((obj: THREE.Object3D) => {
      if (!(obj as any).isMesh) return
      const m = obj as THREE.Mesh

      const mat = makeGlass()
      mat.emissive = new THREE.Color(0x000000)
      m.material = mat
      m.raycast = THREE.Mesh.prototype.raycast

      if (STEP_ORDER.includes(m.name as any)) {
        localTargets.push({
          mesh: m,
          mat,
          baseColor: mat.color.clone(),
          baseEmissive: mat.emissive.clone(),
        })
      }
    })

    // sort by STEP_ORDER
    localTargets.sort((a, b) => STEP_ORDER.indexOf(a.mesh.name as any) - STEP_ORDER.indexOf(b.mesh.name as any))
    localTargets.forEach((t, i) => { idxMap[t.mesh.name] = i })

    targetsRef.current = localTargets
    nameToIndexRef.current = idxMap
  }, [scene])

  // Ease materials back to glass each frame
  useFrame((_, delta) => {
    targetsRef.current.forEach(({ mat, baseColor, baseEmissive }) => {
      mat.color.lerp(baseColor, Math.min(1, delta * 2))
      mat.emissive.lerp(baseEmissive, Math.min(1, delta * 4))
      ;(mat as any).emissiveIntensity = Math.max(0, ((mat as any).emissiveIntensity ?? 0) * Math.pow(0.5, delta * 8))
    })
    if (mixer.current && isPlaying) mixer.current.update(delta)
  })

  // Pulse current mesh with current traveling color
  const popCurrent = () => {
    const targets = targetsRef.current
    if (!targets.length) return

    const activeMesh = targets[meshIdxRef.current % targets.length]
    const { color, label } = TRAVEL_COLORS[colorIdxRef.current % TRAVEL_COLORS.length]

    fireModelClick({ color })

    activeMesh.mat.color.set(color)
    activeMesh.mat.emissive = new THREE.Color(color)
    ;(activeMesh.mat as any).emissiveIntensity = 2.0
  }

  // Run sequence: same color travels across meshes; after last mesh, advance to next color (no auto animation)
  useEffect(() => {
    const tick = () => {
      popCurrent()

      const atLastMesh = meshIdxRef.current === (targetsRef.current.length - 1)
      meshIdxRef.current = (meshIdxRef.current + 1) % Math.max(1, targetsRef.current.length)

      if (atLastMesh) {
        // completed a lap with this color → move to next color
        colorIdxRef.current = (colorIdxRef.current + 1) % TRAVEL_COLORS.length
      }
    }

    const start = () => {
      tick() // immediate first pulse
      stepIntervalRef.current = window.setInterval(tick, 500) as unknown as number
    }
    const stop = () => {
      if (stepIntervalRef.current) {
        window.clearInterval(stepIntervalRef.current)
        stepIntervalRef.current = null
      }
    }

    stop()
    if (!isHovered) start()
    return stop
  }, [isHovered])

  // hover behavior
  const handlePointerOver = (e: any) => {
    if (isHovered) return
    e.stopPropagation()
    setIsHovered(true)
    fireHoverModel(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e: any) => {
    if (!isHovered) return
    e.stopPropagation()
    setIsHovered(false)
    fireHoverModel(false)
    document.body.style.cursor = "auto"
  }

  // On click: pulse current mesh AND play the GLB animation (only here)
  const handleClick = (e: any) => {
    e.stopPropagation()
    popCurrent()
    
    // Fire user click event (only on actual clicks, not automatic pulses)
    const { color } = TRAVEL_COLORS[colorIdxRef.current % TRAVEL_COLORS.length]
    fireUserClick({ color })
    
    if (actionRef.current && !isPlaying) {
      actionRef.current.reset()
      actionRef.current.play()
      setIsPlaying(true)
    }
    userOnClick?.(e)
  }

  return (
    <group
      ref={group}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...groupProps}
    >
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload("/models/gyro.glb")