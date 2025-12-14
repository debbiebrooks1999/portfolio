import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface RoseInstanceProps {
  position: [number, number, number]
  scale: [number, number, number]
  delay: number
  roseType: number
  startFrame: number
  endFrame: number
  isActive: boolean
  roseGeometry: THREE.Object3D
  vatTexture: THREE.Texture
  onUpdate: (isAtStart: boolean) => void
}

const VAT_LAST_FRAME = 339

function clampFrame(frame: number) {
  return Math.max(0, Math.min(VAT_LAST_FRAME, frame))
}

export function RoseInstance({
  position,
  scale,
  delay,
  roseType,
  startFrame,
  endFrame,
  isActive,
  roseGeometry,
  vatTexture,
  onUpdate
}: RoseInstanceProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const wireframeRef = useRef<THREE.Mesh>(null!)
  const [currentFrame, setCurrentFrame] = useState(startFrame)
  const [delayTimer, setDelayTimer] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const shouldNotify = useRef<{ notify: boolean; isAtStart: boolean }>({ notify: false, isAtStart: false })
  
  const direction = isActive ? 1 : -1

  // Extract geometry and setup UV2
  const geometry = useMemo(() => {
    let targetGeometry: THREE.BufferGeometry | null = null
    
    roseGeometry.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !targetGeometry) {
        const mesh = child as THREE.Mesh
        targetGeometry = mesh.geometry.clone()
        
        // Delete vertex colors
        if (targetGeometry.attributes.color) {
          targetGeometry.deleteAttribute('color')
        }
        
        // Add UV2 if missing
        if (!targetGeometry.attributes.uv2) {
          const vertexCount = targetGeometry.attributes.position.count
          const uv2Array = new Float32Array(vertexCount * 2)
          for (let i = 0; i < vertexCount; i++) {
            uv2Array[i * 2] = 0.0
            uv2Array[i * 2 + 1] = i / 987.0
          }
          targetGeometry.setAttribute('uv2', new THREE.BufferAttribute(uv2Array, 2))
        }
      }
    })
    
    return targetGeometry
  }, [roseGeometry])

  // VAT Shader Material with Cyberpunk Effects
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        // Cyberpunk color palette
        uGreen1: { value: new THREE.Color(0x00ff41) }, // Neon green
        uGreen2: { value: new THREE.Color(0x00ffaa) }, // Bright cyan-green
        uRedLight: { value: new THREE.Color(0xff00ff) }, // Magenta
        uRedMid: { value: new THREE.Color(0xff0080) }, // Hot pink
        uDeepRedLight: { value: new THREE.Color(0xff00cc) }, // Bright magenta
        uDeepRedDark: { value: new THREE.Color(0x9d00ff) }, // Purple
        uFrame: { value: startFrame },
        uVatPosTex: { value: vatTexture },
        uFrameCount: { value: VAT_LAST_FRAME + 1.0 },
        uUseVAT: { value: 1.0 },
        uRoseType: { value: roseType },
        uTime: { value: 0 },
        uGlowIntensity: { value: 1.0 }
      },
      side: THREE.DoubleSide,
      vertexShader: `
        attribute vec2 uv2;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
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
          vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  uniform vec3 uGreen1, uGreen2, uRedLight, uRedMid, uDeepRedLight, uDeepRedDark;
  uniform float uRoseType;
  uniform float uTime;
  uniform float uGlowIntensity;

  void main() {
    vec3 baseColor;

    if (uRoseType < 1.5) {
      // Neon green stem
      float t = smoothstep(0.0, 1.0, vUv.y);
      baseColor = mix(uGreen1, uGreen2, t);
    } else if (uRoseType < 2.5) {
      // Magenta/pink petals
      float colorVariation = vUv.y * 0.7 + vUv.x * 0.3;
      float variation = sin(vUv.x * 8.0) * cos(vUv.y * 8.0) * 0.15 + 0.5;
      colorVariation = mix(colorVariation, variation, 0.2);
      baseColor = mix(uRedMid, uRedLight, colorVariation);
    } else {
      // Deep purple/magenta petals
      float heightGradient = smoothstep(0.0, 0.8, vUv.y);
      float colorVariation = vUv.y * 0.5 + vUv.x * 0.2;
      float variation = sin(vUv.x * 10.0) * cos(vUv.y * 10.0) * 0.1 + 0.5;
      colorVariation = mix(colorVariation, variation, 0.3);
      vec3 gradientColor = mix(uDeepRedDark, uDeepRedLight, heightGradient);
      baseColor = mix(gradientColor * 0.8, gradientColor, colorVariation);
    }

    vec3 normal = normalize(vNormal);
    vec3 lightDir1 = normalize(vec3(1.0, 1.5, 1.0));
    float diffuse1 = max(dot(normal, lightDir1), 0.0);
    vec3 lightDir2 = normalize(vec3(-0.8, 0.3, -1.0));
    float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.4;
    
    float ao = 0.3 + 0.7 * (vUv.y * 0.5 + 0.5);
    if (uRoseType > 2.5) {
      ao = 0.2 + 0.8 * (vUv.y * 0.6 + 0.4);
    }
    
    // Enhanced Fresnel/rim lighting for cyberpunk glow
    vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = pow(rim, 2.0) * uGlowIntensity;
    
    // Reduced lighting influence for darker, glowier look
    float totalLight = diffuse1 * 0.4 + diffuse2 * 0.3 + 0.3;
    totalLight *= ao;
    totalLight = clamp(totalLight, 0.2, 1.0); // Darker overall
    
    vec3 finalColor = baseColor * totalLight;
    
    // Stronger rim light with cyberpunk colors
    if (uRoseType < 1.5) {
      finalColor += rim * vec3(0.0, 2.0, 1.0); // Cyan glow on stem
    } else {
      finalColor += rim * vec3(2.0, 0.0, 1.5); // Magenta glow on petals
    }
    
    // Reduced emissive boost (was 0.3, now 0.15)
    finalColor += baseColor * 0.15;
    
    // Add scanning lines effect
    float scan = sin(vWorldPosition.y * 20.0 + uTime * 3.0) * 0.5 + 0.5;
    finalColor += vec3(0.0, 1.0, 1.0) * scan * 0.15;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`
    })
  }, [roseType, vatTexture, startFrame])

  // Animation loop
    useFrame((state, delta) => {
    // Update time uniform for animated effects
    if (meshRef.current?.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value = state.clock.elapsedTime
      mat.uniforms.uFrame.value = currentFrame
    }

    // Handle initial delay before animating
    if (!isAnimating) {
      setDelayTimer(prev => {
        const newTimer = prev + delta
        if (newTimer >= delay) {
          setIsAnimating(true)
          return 0
        }
        return newTimer
      })
      return // don't do frame logic until we're animating
    }

    // We are animating here
    const speed = 0.6 * direction

    let didComplete = false
    let completedAtStart = false

    setCurrentFrame(prev => {
      let newFrame = prev + speed

      if (direction > 0) {
        // Growing
        if (newFrame >= endFrame) {
          newFrame = endFrame
          didComplete = true
          completedAtStart = false
        }
      } else {
        // Shrinking
        if (newFrame <= startFrame) {
          newFrame = startFrame
          didComplete = true
          completedAtStart = true
        }
      }

      return clampFrame(newFrame)
    })

    if (didComplete) {
      // Stop animating and notify
      setIsAnimating(false)

      const directionLabel = completedAtStart ? 'SHRUNK (at start)' : 'GROWN (at end)'

      console.log(`Rose Type ${roseType} animation complete: ${directionLabel}`)
      // Or use alert if you prefer:
      // alert(`Rose Type ${roseType} animation complete: ${directionLabel}`)

      onUpdate(completedAtStart)
    }
  })

  // Reset animation state when direction changes
  useEffect(() => {
    setDelayTimer(0)
    setIsAnimating(false)
  }, [isActive])

  if (!geometry) return null

  return (
    <group>
      {/* Main rose mesh with cyberpunk shader */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={position}
        scale={scale}
      />
      
      {/* Wireframe overlay for extra cyberpunk effect */}
      <mesh
        ref={wireframeRef}
        geometry={geometry}
        position={position}
        scale={scale.map(s => s * 1.01) as [number, number, number]}
      >
        <meshBasicMaterial
          color="#00ffff"
          wireframe={true}
          transparent={true}
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}