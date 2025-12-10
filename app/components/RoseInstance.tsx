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
  const [currentFrame, setCurrentFrame] = useState(startFrame)
  const [delayTimer, setDelayTimer] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const shouldNotifyAtStart = useRef(false)
  
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

  // VAT Shader Material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uGreen1: { value: new THREE.Color(0x325825) },
        uGreen2: { value: new THREE.Color(0x4f802b) },
        uRedLight: { value: new THREE.Color(0xff3333) },
        uRedMid: { value: new THREE.Color(0xcc2222) },
        uDeepRedLight: { value: new THREE.Color(0xdd2211) },
        uDeepRedDark: { value: new THREE.Color(0x660000) },
        uFrame: { value: startFrame },
        uVatPosTex: { value: vatTexture },
        uFrameCount: { value: VAT_LAST_FRAME + 1.0 },
        uUseVAT: { value: 1.0 },
        uRoseType: { value: roseType }
      },
      side: THREE.DoubleSide,
      vertexShader: `
              // Add this:
              attribute vec2 uv2;

              varying vec2 vUv;
              varying vec3 vNormal;
              
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
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        uniform vec3 uGreen1, uGreen2, uRedLight, uRedMid, uDeepRedLight, uDeepRedDark;
        uniform float uRoseType;

        void main() {
          vec3 baseColor;

          if (uRoseType < 1.5) {
            float t = smoothstep(0.0, 1.0, vUv.y);
            baseColor = mix(uGreen1, uGreen2, t);
          } else if (uRoseType < 2.5) {
            float colorVariation = vUv.y * 0.7 + vUv.x * 0.3;
            float variation = sin(vUv.x * 8.0) * cos(vUv.y * 8.0) * 0.15 + 0.5;
            colorVariation = mix(colorVariation, variation, 0.2);
            baseColor = mix(uRedMid, uRedLight, colorVariation);
          } else {
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
          
          vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
          float rim = 1.0 - max(dot(viewDir, normal), 0.0);
          rim = pow(rim, 3.0) * 0.3;
          
          float totalLight = diffuse1 * 0.7 + diffuse2 + 0.4;
          totalLight *= ao;
          totalLight = clamp(totalLight, 0.3, 1.2);
          
          vec3 finalColor = baseColor * totalLight;
          
          if (uRoseType < 1.5) {
            finalColor += rim * vec3(0.7, 1.0, 0.7);
          } else {
            finalColor += rim * vec3(1.0, 0.6, 0.5);
          }
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })
  }, [roseType, vatTexture])

  // Animation loop
  useFrame((state, delta) => {
    if (!isAnimating) {
      setDelayTimer(prev => {
        const newTimer = prev + delta
        if (newTimer >= delay) {
          setIsAnimating(true)
          return 0
        }
        return newTimer
      })
    }

    if (isAnimating) {
      const speed = 0.6 * direction

      shouldNotifyAtStart.current = false

      setCurrentFrame(prev => {
        let newFrame = prev + speed

        if (direction > 0) {
          if (newFrame >= endFrame) {
            newFrame = endFrame
            setIsAnimating(false)
          }
        } else {
          if (newFrame <= startFrame) {
            newFrame = startFrame
            setIsAnimating(false)
            // defer the callback to after the state update
            shouldNotifyAtStart.current = true
          }
        }

        return clampFrame(newFrame)
      })

      if (shouldNotifyAtStart.current) {
        onUpdate(true)
      }
    }
  })

  // Update uniform
  useEffect(() => {
    if (meshRef.current?.material) {
      const mat = meshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uFrame.value = currentFrame
    }
  }, [currentFrame])

  // Reset animation state when direction changes
  useEffect(() => {
    setDelayTimer(0)
    setIsAnimating(false)
  }, [isActive])

  if (!geometry) return null

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      scale={scale}
    />
  )
}
