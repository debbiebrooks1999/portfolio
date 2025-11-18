// components/BackdropPanel.tsx
import * as THREE from "three"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useThree, useLoader, useFrame } from "@react-three/fiber"
import { Decal, useTexture } from "@react-three/drei"
import { onModelClick, onHoverModel } from "../events"

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
}

const DEFAULT_NEON = 0x39ff14

const BackdropPanel: React.FC<Props> = ({
  rotate = true,
  minScale = 0.25,
  maxScale = 0.45,
  debug = false,
  bakedDisplacementScale = 0.1,
  bakedDisplacementBias = -0.05,
}) => {
  const wallRef = useRef<THREE.Mesh>(null!)
  const { gl } = useThree()

  const hoveringModelRef = useRef(false)
  const neonColorRef = useRef<number>(DEFAULT_NEON)
  
  // Ripple effect state
  const [ripples, setRipples] = useState<Array<{
    position: THREE.Vector2
    startTime: number
    color: THREE.Color
  }>>([])

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

  const decalDiffuse = useLoader(THREE.TextureLoader, "textures/decal/decal-diffuse.png")
  const decalNormal = useLoader(THREE.TextureLoader, "textures/decal/decal-normal.jpg")
  decalDiffuse.colorSpace = THREE.SRGBColorSpace

  const [decals, setDecals] = useState<DecalInfo[]>([])

  // Create custom shader material with ripple effects
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: wall.map },
        uNormalMap: { value: wall.normalMap },
        uTime: { value: 0 },
        uRipple1Pos: { value: new THREE.Vector2(999, 999) },
        uRipple1Color: { value: new THREE.Color(DEFAULT_NEON) },
        uRipple1StartTime: { value: -999 },
        uRipple2Pos: { value: new THREE.Vector2(999, 999) },
        uRipple2Color: { value: new THREE.Color(DEFAULT_NEON) },
        uRipple2StartTime: { value: -999 },
        uRipple3Pos: { value: new THREE.Vector2(999, 999) },
        uRipple3Color: { value: new THREE.Color(DEFAULT_NEON) },
        uRipple3StartTime: { value: -999 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uNormalMap;
        uniform float uTime;
        uniform vec2 uRipple1Pos;
        uniform vec3 uRipple1Color;
        uniform float uRipple1StartTime;
        uniform vec2 uRipple2Pos;
        uniform vec3 uRipple2Color;
        uniform float uRipple2StartTime;
        uniform vec2 uRipple3Pos;
        uniform vec3 uRipple3Color;
        uniform float uRipple3StartTime;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        float gridRipple(vec2 uv, vec2 center, float startTime, float currentTime) {
          float elapsed = currentTime - startTime;
          
          // Don't show ripple if it hasn't started or is too old
          if (elapsed < 0.0 || elapsed > 2.5) return 0.0;
          
          // Distance from center
          vec2 diff = uv - center;
          float dist = length(diff);
          
          // Create expanding square/grid pattern
          vec2 gridUV = diff * 40.0; // Scale up for grid size
          
          // Animate the grid outward - start immediately from center
          float expansion = elapsed * 15.0;
          gridUV -= vec2(expansion);
          
          // Create grid lines
          vec2 gridLines = abs(fract(gridUV) - 0.5);
          float grid = min(gridLines.x, gridLines.y);
          grid = smoothstep(0.4, 0.5, grid); // Thin lines
          
          // Distance-based mask (square propagation)
          float maxDist = max(abs(diff.x), abs(diff.y));
          
          // Wave starts at center (no offset)
          float wave = abs(sin((maxDist * 30.0) - (elapsed * 10.0)));
          
          // Add initial burst at center
          float centerBurst = exp(-maxDist * 10.0) * smoothstep(0.3, 0.0, elapsed);
          
          // Combine grid with wave
          float pattern = (1.0 - grid) * (wave + centerBurst);
          
          // Fade out over time
          float timeFade = 1.0 - smoothstep(0.0, 2.5, elapsed);
          
          // Fade out with distance (square area) - but allow center to show immediately
          float distFade = 1.0 - smoothstep(0.0, 0.8, maxDist);
          
          return pattern * timeFade * distFade;
        }
        
        void main() {
          // Base texture (brick wall)
          vec4 baseColor = texture2D(uTexture, vUv);
          
          // Calculate all ripples
          float r1 = gridRipple(vUv, uRipple1Pos, uRipple1StartTime, uTime);
          float r2 = gridRipple(vUv, uRipple2Pos, uRipple2StartTime, uTime);
          float r3 = gridRipple(vUv, uRipple3Pos, uRipple3StartTime, uTime);
          
          // Combine ripple colors
          vec3 rippleGlow = uRipple1Color * r1 * 2.0 + 
                            uRipple2Color * r2 * 2.0 + 
                            uRipple3Color * r3 * 2.0;
          
          float totalRipple = r1 + r2 + r3;
          
          // Use brick texture as base
          vec3 finalColor = baseColor.rgb;
          
          // Add ripple glow on top
          finalColor += rippleGlow;
          
          // Strong emissive glow at ripple areas
          vec3 emissive = rippleGlow * totalRipple * 1.5;
          
          gl_FragColor = vec4(finalColor + emissive, 1.0);
        }
      `,
      side: THREE.FrontSide,
    })
  }, [wall.map, wall.normalMap])

  const intersection = useRef({
    point: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    intersects: false,
  })

  // Update shader time and clean up old ripples
  useFrame((state) => {
    if (!shaderMaterial) return
    
    const currentTime = state.clock.getElapsedTime()
    shaderMaterial.uniforms.uTime.value = currentTime
    
    // Clean up old ripples (2.5 seconds to match shader)
    setRipples(prev => prev.filter(r => currentTime - r.startTime < 2.5))
  })

  useEffect(() => {
    return onModelClick(({ color }) => {
      if (typeof color === "number") neonColorRef.current = color
    })
  }, [])

  // Listen to model hover
  useEffect(() => {
    return onHoverModel((over) => {
      hoveringModelRef.current = over
    })
  }, [])

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
    if (hoveringModelRef.current) return
    e.stopPropagation()
    intersection.current.point.copy(e.point)
    intersection.current.normal.copy(worldNormalFromEvent(e))
    intersection.current.intersects = true
    
    gl.domElement.style.cursor = "crosshair"
    document.body.style.cursor = "crosshair"
  }

  const onWallPointerOut = () => {
    if (hoveringModelRef.current) return
    intersection.current.intersects = false
    
    gl.domElement.style.cursor = "auto"
    document.body.style.cursor = "auto"
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
    
    // Add ripple effect at click position
    const geo = wall.geometry as THREE.PlaneGeometry
    const width = geo.parameters.width
    const height = geo.parameters.height
    
    // Convert local position to UV coordinates (0-1)
    const uvX = (pLocal.x / width) + 0.5
    const uvY = (pLocal.y / height) + 0.5
    
    const currentTime = performance.now() / 1000
    
    const newRipple = {
      position: new THREE.Vector2(uvX, uvY),
      startTime: currentTime,
      color: new THREE.Color(neonColorRef.current)
    }
    
    setRipples(prev => {
      const updated = [newRipple, ...prev].slice(0, 3) // Keep max 3 ripples
      
      // Update shader uniforms
      if (updated[0]) {
        shaderMaterial.uniforms.uRipple1Pos.value.copy(updated[0].position)
        shaderMaterial.uniforms.uRipple1Color.value.copy(updated[0].color)
        shaderMaterial.uniforms.uRipple1StartTime.value = updated[0].startTime
      }
      if (updated[1]) {
        shaderMaterial.uniforms.uRipple2Pos.value.copy(updated[1].position)
        shaderMaterial.uniforms.uRipple2Color.value.copy(updated[1].color)
        shaderMaterial.uniforms.uRipple2StartTime.value = updated[1].startTime
      }
      if (updated[2]) {
        shaderMaterial.uniforms.uRipple3Pos.value.copy(updated[2].position)
        shaderMaterial.uniforms.uRipple3Color.value.copy(updated[2].color)
        shaderMaterial.uniforms.uRipple3StartTime.value = updated[2].startTime
      }
      
      return updated
    })
  }

  const onWallClick = (e: any) => {
    if (hoveringModelRef.current) return
    e.stopPropagation()
    intersection.current.point.copy(e.point)
    intersection.current.normal.copy(worldNormalFromEvent(e))
    intersection.current.intersects = true
    shoot()
  }

  // Responsive scaling
  const { size } = useThree();
  const isMobile = size.width < 640;
  const panelScale = isMobile ? 0.75 : 1;
  const wallPos: [number, number, number] = isMobile ? [0.6, 0.2, -0.8] : [1.2, 0.2, -1];
  
  return (
    <group scale={panelScale}>
      <mesh
        ref={wallRef}
        position={wallPos}
        castShadow
        receiveShadow
        onPointerMove={onWallPointerMove}
        onPointerOut={onWallPointerOut}
        onClick={onWallClick}
        material={shaderMaterial}
      >
        <planeGeometry args={[6, 2, 600, 200]} />

        {decals.map((d, i) => (
          <Decal
            key={i}
            position={d.position}
            rotation={d.rotation}
            scale={d.scale}
            renderOrder={i}
            frustumCulled={false}
          >
            <shaderMaterial
              uniforms={{
                uDiffuse: { value: decalDiffuse },
                uNormal: { value: decalNormal },
                uColor: { value: new THREE.Color(d.color) },
                uEmissive: { value: new THREE.Color(d.color) },
                uTime: { value: 0 },
              }}
              vertexShader={`
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                void main() {
                  vUv = uv;
                  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                  vNormal = normalize(normalMatrix * normal);
                  vViewPosition = -mvPosition.xyz;
                  gl_Position = projectionMatrix * mvPosition;
                }
              `}
              fragmentShader={`
                uniform sampler2D uDiffuse;
                uniform sampler2D uNormal;
                uniform vec3 uColor;
                uniform vec3 uEmissive;
                uniform float uTime;
                
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                void main() {
                  // Base texture
                  vec4 texColor = texture2D(uDiffuse, vUv);
                  
                  // Alpha test for transparency
                  if (texColor.a < 0.35) discard;
                  
                  // Apply color tint
                  vec3 baseColor = texColor.rgb * uColor;
                  
                  // Fresnel effect (rim lighting)
                  vec3 viewDir = normalize(vViewPosition);
                  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
                  
                  // Edge detection from alpha
                  float dx = dFdx(texColor.a);
                  float dy = dFdy(texColor.a);
                  float edgeDetect = length(vec2(dx, dy));
                  float edgeGlow = smoothstep(0.0, 0.3, edgeDetect);
                  
                  // Combine edge glow and fresnel
                  float glowAmount = max(fresnel * 0.8, edgeGlow * 1.2);
                  
                  // Add emissive glow
                  vec3 emissiveGlow = uEmissive * glowAmount * 2.5;
                  
                  // Base emissive
                  vec3 baseEmissive = uEmissive * 1.25;
                  
                  // Final color
                  vec3 finalColor = baseColor + baseEmissive + emissiveGlow;
                  
                  gl_FragColor = vec4(finalColor, texColor.a);
                }
              `}
              transparent={true}
              depthTest={true}
              depthWrite={true}
              side={THREE.DoubleSide}
            />
          </Decal>
        ))}

        {debug && <primitive object={new THREE.AxesHelper(0.25)} />}
      </mesh>
    </group>
  )
}

BackdropPanel.displayName = "BackdropPanel"
export default BackdropPanel
