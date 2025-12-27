"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { EXRLoader } from "three-stdlib"

const VAT_FIRST_FRAME = 0
const VAT_LAST_FRAME = 339
const R1_START = 1,
  R1_END = 110
const R2_START = 115,
  R2_END = 220
const R3_START = 229,
  R3_END = 338

function clampFrame(frame: number) {
  return Math.max(VAT_FIRST_FRAME, Math.min(VAT_LAST_FRAME, frame))
}

function getRandomScale() {
  const baseScale = 5 + Math.random() * 1  // Scale 0.8-1.4
  const heightMultiplier = 0.9 + Math.random() * 0.2
  const widthMultiplier = 0.9 + Math.random() * 0.2

  return {
    x: baseScale * widthMultiplier,
    y: baseScale * heightMultiplier,
    z: baseScale * widthMultiplier,
  }
}

type RoseInstance = {
  mesh: THREE.Mesh
  currentFrame: number
  startFrame: number
  endFrame: number
  delay: number
  delayTimer: number
  isAnimating: boolean
  direction: -1 | 0 | 1
  speed: number
}

type Zone = {
  position: { x: number; y: number; z: number }
  roses: RoseInstance[]
  isActive: boolean
  timeSinceActive: number
}

type VATRoseSystemProps = {
  /** Where the plane sits in Y. Default 0. */
  groundY?: number
  /** Plane size (square). Default 50. */
  size?: number
  /** How close mouse must be to reuse an existing zone. Default 1.5 */
  zoneRadius?: number
  /** How quickly a hover spawns. Default 0.05 */
  hoverDelay?: number
  /** How long after leaving before roses recede. Default 2.0 */
  recedeDelay?: number
  /** Show the cyan cursor disc. Default true */
  showCursor?: boolean
  /** Enable/disable system entirely. Default true */
  enabled?: boolean
}

/**
 * VAT Rose System (R3F)
 * - Hover over the ground plane to spawn “zones”
 * - Zones grow while hovered, pause briefly, then shrink & clean up
 * - Uses /Rose.glb + /Rose_pos.exr
 */
export default function VATRoseSystem({
  groundY = 0,
  size = 50,
  zoneRadius = 1.5,
  hoverDelay = 0.05,
  recedeDelay = 2.0,
  showCursor = false,
  enabled = true,
}: VATRoseSystemProps) {
  const { gl, scene } = useThree()

  // Load VAT texture (EXR)
  const vatPositionTexture = useMemo(() => {
    // loaded via EXRLoader below; this memo only exists for typing parity
    return null as unknown as THREE.DataTexture
  }, [])

  const [vatTex, setVatTex] = useState<THREE.DataTexture | null>(null)

  useEffect(() => {
    if (!enabled) return
    const loader = new EXRLoader()
    let cancelled = false

    loader.load(
      "./textures/Rose_pos.exr",
      (tex) => {
        if (cancelled) return
        tex.minFilter = THREE.NearestFilter
        tex.magFilter = THREE.NearestFilter
        tex.generateMipmaps = false
        tex.flipY = false
        setVatTex(tex as unknown as THREE.DataTexture)
      },
      undefined,
      (err) => {
        console.error("❌ Failed to load /Rose_pos.exr", err)
      }
    )

    return () => {
      cancelled = true
    }
  }, [enabled])

  // Load Rose GLB geometry
  const gltf = useGLTF("./models/Rose.glb") as any

  const roseGeometry = useMemo<THREE.BufferGeometry | null>(() => {
    if (!gltf?.scene) return null

    let geom: THREE.BufferGeometry | null = null

    gltf.scene.traverse((child: any) => {
      if (!child?.isMesh) return
      const g = child.geometry as THREE.BufferGeometry
      if (!g) return

      // Remove vertex colors if present
      if (g.attributes.color) g.deleteAttribute("color")

      // Ensure uv2 exists (VAT sampling uses uv2.y)
      if (!g.attributes.uv2) {
        const vertexCount = g.attributes.position.count
        const uv2Array = new Float32Array(vertexCount * 2)
        for (let i = 0; i < vertexCount; i++) {
          uv2Array[i * 2 + 0] = 0.0
          uv2Array[i * 2 + 1] = i / 987.0
        }
        g.setAttribute("uv2", new THREE.BufferAttribute(uv2Array, 2))
      }

      geom = g
    })

    return geom
  }, [gltf])

  const activeZonesRef = useRef<Zone[]>([])
  const currentZoneRef = useRef<{ position: { x: number; y: number; z: number }; isNew: true } | Zone | null>(null)
  const hoverTimerRef = useRef(0)

  // Cursor disc
  const cursorDiscRef = useRef<THREE.Mesh>(null)

  // Ground plane ref for pointer events
  const groundRef = useRef<THREE.Mesh>(null)

  function createRoseMaterial(tex: THREE.DataTexture | null) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uGreen1: { value: new THREE.Color(0x00ff88) },
        uGreen2: { value: new THREE.Color(0x00ffcc) },
        uRedLight: { value: new THREE.Color(0xff00ff) },
        uRedMid: { value: new THREE.Color(0xff0088) },
        uDeepRedLight: { value: new THREE.Color(0x8800ff) },
        uDeepRedDark: { value: new THREE.Color(0x0088ff) },
        uFrame: { value: 0.0 },
        uVatPosTex: { value: tex },
        uFrameCount: { value: VAT_LAST_FRAME + 1.0 },
        uUseVAT: { value: tex ? 1.0 : 0.0 },
        uRoseType: { value: 1.0 },
        uTime: { value: 0.0 },
      },
      side: THREE.DoubleSide,
      vertexColors: false,
      vertexShader: `
        attribute vec2 uv2;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform float uFrame;
        uniform sampler2D uVatPosTex;
        uniform float uFrameCount;
        uniform float uUseVAT;

        void main() {
          vUv = uv;
          vec3 pos = position;

          if (uUseVAT > 0.5) {
            float u = clamp(uFrame, 0.0, uFrameCount - 1.0) / uFrameCount;
            float v = uv2.y;
            vec4 vatPos = texture2D(uVatPosTex, vec2(u, v));
            pos = vatPos.rgb;
          }

          vNormal = normalize(normalMatrix * normal);
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        uniform vec3 uGreen1, uGreen2, uRedLight, uRedMid, uDeepRedLight, uDeepRedDark;
        uniform float uRoseType;
        uniform float uTime;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec3 baseColor;

          float noiseValue = noise(vUv * 10.0 + uTime * 0.5);
          float pulseNoise = sin(uTime * 2.0 + vUv.y * 5.0) * 0.5 + 0.5;

          if (uRoseType < 1.5) {
            float t = smoothstep(0.0, 1.0, vUv.y);
            baseColor = mix(uGreen1, uGreen2, t);
            baseColor *= 1.3;
          } else if (uRoseType < 2.5) {
            float petalId = fract(sin(dot(vPosition.xz, vec2(12.9898, 78.233))) * 43758.5453);
            vec3 magenta = vec3(0.7, 0.0, 0.7);
            vec3 hotPink = vec3(0.8, 0.0, 0.4);
            vec3 orange = vec3(1.0, 0.4, 0.0);
            vec3 darkYellow = vec3(0.7, 0.5, 0.0);

            vec3 petalColor;
            if (petalId < 0.25) petalColor = magenta;
            else if (petalId < 0.5) petalColor = hotPink;
            else if (petalId < 0.75) petalColor = orange;
            else petalColor = darkYellow;

            float heightVariation = vUv.y * 0.3;
            baseColor = petalColor * (0.9 + heightVariation);

            float edgeDetect = smoothstep(0.1, 0.2, vUv.x) * smoothstep(0.9, 0.8, vUv.x);
            baseColor += vec3(0.15) * (1.0 - edgeDetect);
            baseColor *= 1.3;
          } else {
            float petalId = fract(sin(dot(vPosition.xz, vec2(12.9898, 78.233))) * 43758.5453);

            vec3 electricBlue = vec3(0.0, 0.4, 0.8);
            vec3 deepPurple = vec3(0.5, 0.0, 0.8);
            vec3 cyan = vec3(0.0, 0.7, 0.8);
            vec3 violet = vec3(0.6, 0.0, 0.8);
            vec3 hotPink = vec3(0.8, 0.0, 0.5);

            vec3 petalColor;
            if (petalId < 0.2) petalColor = electricBlue;
            else if (petalId < 0.4) petalColor = deepPurple;
            else if (petalId < 0.6) petalColor = cyan;
            else if (petalId < 0.8) petalColor = violet;
            else petalColor = hotPink;

            float heightGradient = smoothstep(0.0, 1.0, vUv.y);
            baseColor = petalColor * (0.8 + heightGradient * 0.3);

            float edgeDetect = smoothstep(0.1, 0.2, vUv.x) * smoothstep(0.9, 0.8, vUv.x);
            baseColor += vec3(0.15) * (1.0 - edgeDetect);

            baseColor *= 1.3;
          }

          vec3 normal = normalize(vNormal);
          vec3 lightDir1 = normalize(vec3(1.0, 1.5, 1.0));
          float diffuse1 = max(dot(normal, lightDir1), 0.0);
          vec3 lightDir2 = normalize(vec3(-0.8, 0.3, -1.0));
          float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.4;

          float ao = 0.7 + 0.3 * (vUv.y * 0.5 + 0.5);
          if (uRoseType > 2.5) ao = 0.7 + 0.3 * (vUv.y * 0.6 + 0.4);

          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, 2.5) * 0.4;

          float totalLight = diffuse1 * 0.6 + diffuse2 + 0.5;
          totalLight *= ao;
          totalLight = clamp(totalLight, 0.7, 1.2);

          vec3 finalColor = baseColor * totalLight;

          if (uRoseType > 1.5) {
            float noiseIntensity = noiseValue * 0.1 + pulseNoise * 0.05;
            finalColor += finalColor * noiseIntensity;
          }

          if (uRoseType < 1.5) {
            finalColor += rim * vec3(0.0, 1.5, 1.0) * 0.8;
          } else if (uRoseType < 2.5) {
            finalColor += rim * vec3(1.5, 0.5, 0.0) * 0.8;
          } else {
            finalColor += rim * vec3(1.0, 1.0, 1.5) * 0.8;
          }

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false,
    })
  }

  function createRoseGroup(centerPos: { x: number; y: number; z: number }, geom: THREE.BufferGeometry, tex: THREE.DataTexture | null, scene: THREE.Scene) {
    const group: RoseInstance[] = []

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const radius = 0.3 + Math.random() * 0.8
      const offsetX = Math.cos(angle) * radius
      const offsetZ = Math.sin(angle) * radius

      const instanceScale = getRandomScale()

      for (let j = 0; j < 3; j++) {
        const mat = createRoseMaterial(tex)
        mat.uniforms.uVatPosTex.value = tex
        mat.uniforms.uUseVAT.value = tex ? 1.0 : 0.0
        mat.uniforms.uRoseType.value = j === 0 ? 1.0 : j === 1 ? 2.0 : 3.0

        const mesh = new THREE.Mesh(geom, mat)
        mesh.scale.set(instanceScale.x, instanceScale.y, instanceScale.z)
        mesh.position.set(centerPos.x + offsetX, centerPos.y, centerPos.z + offsetZ)

        // NOTE: Add meshes directly to scene via R3F root
        ;(mesh as any).__vatRose = true
        scene.add(mesh)

        const startFrame = [R1_START, R2_START, R3_START][j]
        const endFrame = [R1_END, R2_END, R3_END][j]

        group.push({
          mesh,
          currentFrame: clampFrame(startFrame),
          startFrame,
          endFrame,
          delay: i * 0.25,
          delayTimer: 0,
          isAnimating: false,
          direction: 1,
          speed: 0.8 + Math.random() * 0.8,
        })
      }
    }

    return group
  }

  function findNearbyZone(pos: { x: number; z: number }, maxDistance: number) {
    const zones = activeZonesRef.current
    for (const zone of zones) {
      const dx = zone.position.x - pos.x
      const dz = zone.position.z - pos.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      if (distance < maxDistance) return zone
    }
    return null
  }

  // Pointer events on the ground plane
  const onPointerMove = (e: any) => {
    if (!enabled) return
    if (!groundRef.current) return

    const point = e.point as THREE.Vector3

    if (cursorDiscRef.current) {
      cursorDiscRef.current.position.set(point.x, point.y + 0.05, point.z)
      cursorDiscRef.current.visible = showCursor
    }

    const nearby = findNearbyZone({ x: point.x, z: point.z }, zoneRadius)
    if (nearby) {
      currentZoneRef.current = nearby
      nearby.isActive = true
      nearby.timeSinceActive = 0
    } else {
      currentZoneRef.current = { position: { x: point.x, y: point.y, z: point.z }, isNew: true } as any
    }

    // Deactivate others
    activeZonesRef.current.forEach((z) => {
      if (z !== currentZoneRef.current) z.isActive = false
    })
  }

  const onPointerLeave = () => {
    if (!enabled) return
    if (cursorDiscRef.current) cursorDiscRef.current.visible = false
    currentZoneRef.current = null
    activeZonesRef.current.forEach((z) => (z.isActive = false))
  }

  // Main animation/update loop
  useFrame(({ clock }, delta) => {
    if (!enabled) return
    if (!roseGeometry) return

    const now = clock.getElapsedTime()

    const cz = currentZoneRef.current as any
    if (cz && cz.isNew && roseGeometry) {
      hoverTimerRef.current += delta
      if (hoverTimerRef.current >= hoverDelay) {
        const newZone: Zone = {
          position: cz.position,
          roses: createRoseGroup(cz.position, roseGeometry, vatTex, scene),
          isActive: true,
          timeSinceActive: 0,
        }
        activeZonesRef.current.push(newZone)
        currentZoneRef.current = newZone
        hoverTimerRef.current = 0
      }
    } else {
      hoverTimerRef.current = 0
    }

    // Update all zones
    const zones = activeZonesRef.current

    zones.forEach((zone) => {
      if (zone.isActive) zone.timeSinceActive = 0
      else zone.timeSinceActive += delta

      zone.roses.forEach((rose) => {
        const mat = rose.mesh.material as THREE.ShaderMaterial
        if (mat?.uniforms?.uTime) mat.uniforms.uTime.value = now

        if (zone.isActive) rose.direction = 1
        else if (zone.timeSinceActive >= recedeDelay) rose.direction = -1
        else rose.direction = 0

        if (!rose.isAnimating) {
          rose.delayTimer += delta
          if (rose.delayTimer >= rose.delay) rose.isAnimating = true
        }

        if (rose.isAnimating && rose.direction !== 0) {
          rose.currentFrame += rose.speed * rose.direction

          if (rose.direction > 0 && rose.currentFrame >= rose.endFrame) {
            rose.currentFrame = rose.endFrame
            rose.isAnimating = false
          } else if (rose.direction < 0 && rose.currentFrame <= rose.startFrame) {
            rose.currentFrame = rose.startFrame
            rose.isAnimating = false
          }

          rose.currentFrame = clampFrame(rose.currentFrame)
        } else if (rose.direction !== 0) {
          rose.isAnimating = true
        }

        if (mat?.uniforms?.uFrame) mat.uniforms.uFrame.value = rose.currentFrame
      })
    })

    // Cleanup fully reversed zones
    for (let i = zones.length - 1; i >= 0; i--) {
      const zone = zones[i]
      if (!zone.isActive && zone.roses.every((r) => r.currentFrame === r.startFrame)) {
        zone.roses.forEach((r) => {
          scene.remove(r.mesh)
          const mat = r.mesh.material as THREE.Material
          mat.dispose?.()
        })
        zones.splice(i, 1)
      }
    }
  })

  return (
    <group>
      {/* Lights + ground (matches your script vibe, you can delete if you already light the scene elsewhere) */}
      <ambientLight intensity={0.4} color={0x330066} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color={0x00ffff} />
      <directionalLight position={[-3, 2, -5]} intensity={0.5} color={0xff00ff} />

      {/* Ground plane: receives pointer hover */}
      <mesh
        ref={groundRef}
        rotation-x={-Math.PI / 2}
        position={[0, groundY, 0]}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color={0x0a0520}
          roughness={0.7}
          metalness={0.3}
          transparent
          opacity={0.3}
          emissive={0x110033}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Cursor disc */}
      <mesh
        ref={cursorDiscRef}
        rotation-x={-Math.PI / 2}
        position={[0, groundY + 0.05, 0]}
        visible={false}
      >
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color={0x00ffff} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

useGLTF.preload("./models/Rose.glb")