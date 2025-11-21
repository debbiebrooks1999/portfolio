// components/BackdropPanel.tsx
import * as THREE from "three"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useThree, useLoader, useFrame } from "@react-three/fiber"
import { Decal, useTexture, useVideoTexture } from "@react-three/drei"
import { onModelClick, onHoverModel } from "../events"
import { BillboardSkyscraper} from "./BillboardSkyscraper"

type DecalInfo = {
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: number
}

type Props = {
  rotate?: boolean
  minScale?: number
  maxScale?: number
  debug?: boolean
  bakedDisplacementScale?: number
  bakedDisplacementBias?: number
  videoUrl?: string
  showVideo?: boolean
  onWallHover?: (hovering: boolean) => void
  showGirlBillboard?: boolean
  girlTextureUrl?: string
  girlBillboardSize?: [number, number]
  girlBillboardPosition?: [number, number] // x, y offset from wall center
  girlBillboardZOffset?: number // distance in front of wall (default: 0.1)
  girlTilesX?: number
  girlTilesY?: number
  girlFps?: number
}

const DEFAULT_NEON = 0x39ff14

// Billboard shader for the animated girl
const billboardVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const billboardFragmentShader = `
  precision highp float;

  uniform sampler2D uGirlTex;
  uniform float uTime;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  uniform float uGlow;

  uniform vec2 uGrid;   // tilesX, tilesY
  uniform float uFps;   // frames per second

  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // --- SPRITESHEET FRAME SELECTION ---
    float totalFrames = uGrid.x * uGrid.y;
    float frame = mod(floor(uTime * uFps), totalFrames);

    float fx = mod(frame, uGrid.x);
    float fy = floor(frame / uGrid.x);

    vec2 cellSize   = 1.0 / uGrid;
    vec2 cellOrigin = vec2(fx, fy) * cellSize;

    // Local UV inside the frame (0–1), with a tiny margin to avoid edges
    float margin = 0.002;
    vec2 localUv = margin + vUv * (1.0 - 2.0 * margin);

    // Map into the correct cell
    vec2 uv = cellOrigin + localUv * cellSize;

    // Sample once – no UV shifting, so no bleeding between frames
    vec4 tex = texture2D(uGirlTex, uv);
    float alpha = tex.a;
    if (alpha < 0.02) discard;

    vec3 base = tex.rgb;

    // Scanlines (color only)
    float scan = sin((uv.y + uTime * 0.2) * 500.0) * 0.5 + 0.5;
    float scanStrength = mix(0.6, 1.4, scan);

    // Column flicker (color only)
    float colNoise = hash(vec2(floor(vWorldPos.x * 2.0), floor(uTime * 6.0)));
    float flicker = mix(0.7, 1.3, colNoise);

    // Neon tint
    float tintMix = 0.5 + 0.5 * sin(uTime + uv.y * 5.0);
    vec3 tint = mix(uTintA, uTintB, tintMix);

    vec3 color = base * tint * scanStrength * flicker * uGlow;

    // Edge glow
    float edge = smoothstep(0.0, 0.25, alpha) - smoothstep(0.25, 0.7, alpha);
    vec3 edgeColor = mix(uTintA, uTintB, 0.5);
    color += edgeColor * edge * 1.5;

    gl_FragColor = vec4(color, alpha);
  }
`

const BackdropPanel: React.FC<Props> = ({
  
  rotate = true,
  minScale = 0.25,
  maxScale = 0.45,
  debug = false,
  bakedDisplacementScale = 0.1,
  bakedDisplacementBias = -0.05,
  videoUrl = "/videos/video_3.mp4",
  showVideo = true,
  onWallHover,
  showGirlBillboard = true,
  girlTextureUrl = "/videos/girl_pha_v2.png",
  girlBillboardSize = [1.5, 1.0],
  girlBillboardPosition = [-1.5, 0.3], // x and y offset from wall center
  girlBillboardZOffset = 0.1, // distance in front of wall
  girlTilesX = 5,
  girlTilesY = 16,
  girlFps = 5,

}) => {

  const wallRef = useRef<THREE.Mesh>(null!)
  const { gl } = useThree()

  const hoveringModelRef = useRef(false)
  const neonColorRef = useRef<number>(DEFAULT_NEON)

  // Load video texture
  const videoTexture = showVideo ? useVideoTexture(videoUrl, {
    muted: true,
    loop: true,
    start: true,
  }) : null

  const wall = useTexture({
    map: "/textures/broken_brick_wall_diff_1k.jpg",
    normalMap: "/textures/broken_brick_wall_nor_gl_1k.jpg",
    displacementMap: "/textures/broken_brick_wall_disp_1k.jpg",
  })
  
  useMemo(() => {
    Object.values(wall).forEach((t) => {
      if (!t) return
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(3, 1.2)
      ;(t as any).anisotropy = 8
      t.needsUpdate = true
    })
  }, [wall])

  // Configure video texture
  useEffect(() => {
    if (videoTexture) {
      videoTexture.colorSpace = THREE.SRGBColorSpace
      videoTexture.minFilter = THREE.LinearFilter
      videoTexture.magFilter = THREE.LinearFilter
    }
  }, [videoTexture])

  // Load girl spritesheet texture
  const girlTex = showGirlBillboard 
    ? useLoader(THREE.TextureLoader, girlTextureUrl)
    : null

  useEffect(() => {
    if (girlTex) {
      girlTex.colorSpace = THREE.SRGBColorSpace
      girlTex.wrapS = girlTex.wrapT = THREE.ClampToEdgeWrapping
      girlTex.minFilter = THREE.NearestFilter
      girlTex.magFilter = THREE.NearestFilter
    }
  }, [girlTex])

  // Billboard material for animated girl
  const billboardUniforms = useMemo(() => {
    if (!girlTex) return null
    return {
      uGirlTex: { value: girlTex },
      uTime: { value: 0 },
      uTintA: { value: new THREE.Color(0x00ffff) },
      uTintB: { value: new THREE.Color(0xff00ff) },
      uGlow: { value: 1.8 },
      uGrid: { value: new THREE.Vector2(girlTilesX, girlTilesY) },
      uFps: { value: girlFps },
    }
  }, [girlTex, girlTilesX, girlTilesY, girlFps])

  const billboardMaterial = useMemo(() => {
    if (!billboardUniforms) return null
    return new THREE.ShaderMaterial({
      uniforms: billboardUniforms,
      vertexShader: billboardVertexShader,
      fragmentShader: billboardFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }) as THREE.ShaderMaterial
  }, [billboardUniforms])

  const decalDiffuse = useLoader(THREE.TextureLoader, "textures/decal/decal-diffuse.png")
  const decalNormal = useLoader(THREE.TextureLoader, "textures/decal/decal-normal.jpg")
  decalDiffuse.colorSpace = THREE.SRGBColorSpace

  const [decals, setDecals] = useState<DecalInfo[]>([])

  const intersection = useRef({
    point: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    intersects: false,
  })

  useEffect(() => {
    return onModelClick(({ color }) => {
      if (typeof color === "number") neonColorRef.current = color
    })
  }, [])

  // Listen to model hover - when model is hovered, it controls cursor
  useEffect(() => {
    return onHoverModel((over) => {
      hoveringModelRef.current = over
      // Don't set cursor here - let the model and wall handle it
    })
  }, [])

  // Update billboard animation time
  useFrame(({ clock }) => {
    if (billboardUniforms) {
      billboardUniforms.uTime.value = clock.getElapsedTime()
    }
  })

  useEffect(() => {
    const mesh = wallRef.current
    if (!mesh) return

    const geo = mesh.geometry as THREE.PlaneGeometry
    const disp = wall.displacementMap
    const uvAttr = geo.attributes.uv as THREE.BufferAttribute
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    const normAttr = geo.attributes.normal as THREE.BufferAttribute
    if (!disp?.image || !uvAttr || !posAttr || !normAttr) return

    const img = disp.image as HTMLImageElement | HTMLCanvasElement | ImageBitmap
    const cvs = document.createElement("canvas")
    cvs.width = (img as any).width
    cvs.height = (img as any).height
    const ctx = cvs.getContext("2d")!
    ctx.drawImage(img as CanvasImageSource, 0, 0)
    const pixels = ctx.getImageData(0, 0, cvs.width, cvs.height).data

    const sample01 = (u: number, v: number) => {
      u = (u % 1 + 1) % 1
      v = (v % 1 + 1) % 1
      const x = Math.floor(u * (cvs.width - 1))
      const y = Math.floor((1 - v) * (cvs.height - 1))
      const idx = (y * cvs.width + x) * 4
      return pixels[idx] / 255
    }

    const v = new THREE.Vector3()
    const n = new THREE.Vector3()
    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i)
      const vv = uvAttr.getY(i)
      const h = sample01(u, vv) * bakedDisplacementScale + bakedDisplacementBias
      v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      n.set(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i)).normalize()
      v.addScaledVector(n, h)
      posAttr.setXYZ(i, v.x, v.y, v.z)
    }
    posAttr.needsUpdate = true
    geo.computeVertexNormals()
    normAttr.needsUpdate = true
    geo.computeBoundingBox()
    geo.computeBoundingSphere()
  }, [wall.displacementMap, bakedDisplacementScale, bakedDisplacementBias])

  const worldNormalFromEvent = (e: any) => {
    const mesh = wallRef.current
    if (!mesh || !e.face) return new THREE.Vector3(0, 0, 1)
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    return e.face.normal.clone().applyNormalMatrix(normalMatrix).normalize()
  }

  const onWallPointerMove = (e: any) => {
    if (hoveringModelRef.current) return // Model owns cursor
    e.stopPropagation()
    intersection.current.point.copy(e.point)
    intersection.current.normal.copy(worldNormalFromEvent(e))
    intersection.current.intersects = true
    
    // Notify parent that wall is being hovered
    onWallHover?.(true)
  }

  const onWallPointerOut = () => {
    if (hoveringModelRef.current) return
    intersection.current.intersects = false
    
    // Notify parent that wall is no longer being hovered
    onWallHover?.(false)
  }

  const shoot = () => {
    if (!intersection.current.intersects || !wallRef.current) return
    const wall = wallRef.current

    const pWorld = intersection.current.point.clone()
    const nWorld = intersection.current.normal.clone().normalize()
    pWorld.addScaledVector(nWorld, 0.01)

    const pLocal = wall.worldToLocal(pWorld.clone())

    const up = new THREE.Vector3(0, 0, 1)
    const qWorld = new THREE.Quaternion().setFromUnitVectors(up, nWorld)
    const wallWorldQ = new THREE.Quaternion()
    wall.getWorldQuaternion(wallWorldQ)
    const qLocal = wallWorldQ.clone().invert().multiply(qWorld)
    const eLocal = new THREE.Euler().setFromQuaternion(qLocal)
    if (rotate) eLocal.z += Math.random() * Math.PI * 2

    const s = minScale + Math.random() * (maxScale - minScale)

    const info: DecalInfo = {
      position: [pLocal.x, pLocal.y, pLocal.z],
      rotation: [eLocal.x, eLocal.y, eLocal.z],
      scale: [s, s, s * 1.35],
      color: neonColorRef.current,
    }
    setDecals((list) => [...list, info])
  }

  const onWallClick = (e: any) => {
    if (hoveringModelRef.current) return
    e.stopPropagation()
    intersection.current.point.copy(e.point)
    intersection.current.normal.copy(worldNormalFromEvent(e))
    intersection.current.intersects = true
    shoot()
  }

  // Responsive scaling for small screens
  const { size } = useThree()
  const isMobile = size.width < 640
  const panelScale = isMobile ? 0.75 : 1

  const wallPos: [number, number, number] = [1, 0.2, -1]
  
  return (
    <group scale={panelScale}>

      {/* <BillboardSkyscraper
          position={[-5.5, 1, -4]}
          buildingSize={[1, 8, 1]}
          billboardSize={[1.5, 1]}
          girlTextureUrl="/videos/girl_pha_v2.png"
        /> */}
    
      {/* Main brick wall with decals */}
      <mesh
        ref={wallRef}
        position={wallPos}
        castShadow
        receiveShadow
        onPointerMove={onWallPointerMove}
        onPointerOut={onWallPointerOut}
        onClick={onWallClick}
      >
        <planeGeometry args={[6, 2, 600, 200]} />
        <meshStandardMaterial
          map={wall.map}
          normalMap={wall.normalMap}
          color="#ffffff"
          metalness={0.5}
          roughness={0.9}
          side={THREE.FrontSide}
        />

        {decals.map((d, i) => (
          <Decal
            key={i}
            position={d.position}
            rotation={d.rotation}
            scale={d.scale}
            renderOrder={i}
            frustumCulled={false}
          >
            <meshPhongMaterial
             map={decalDiffuse}
                normalMap={decalNormal}
                color={d.color}
                emissive={new THREE.Color(d.color)}
                emissiveIntensity={0.05}
                specular={new THREE.Color(0x444444)}
                shininess={10}
                alphaTest={0.01}
                transparent={false}
                depthTest
                depthWrite
                polygonOffset
                polygonOffsetFactor={-0.5}
                side={THREE.DoubleSide}
            />
          </Decal>
        ))}

        {debug && <primitive object={new THREE.AxesHelper(0.25)} />}
      </mesh>

      {/* Animated girl billboard on the wall */}
      {showGirlBillboard && billboardMaterial && (
        <mesh
          position={[
            wallPos[0] + girlBillboardPosition[0], 
            wallPos[1] + girlBillboardPosition[1], 
            wallPos[2] + girlBillboardZOffset
          ]}
          material={billboardMaterial}
        >
          <planeGeometry args={girlBillboardSize} />
        </mesh>
      )}
    </group>
  )
}

BackdropPanel.displayName = "BackdropPanel"
export default BackdropPanel