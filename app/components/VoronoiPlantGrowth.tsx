// components/VoronoiPlantGrowth.tsx
"use client"
import * as React from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"

type VoronoiPlantGrowthProps = {
  position?: [number, number, number]
  rotation?: [number, number, number]
  size?: [number, number]
  plantColor?: string
  circleRadius?: number // Expanding circle radius
  circleExpansionSpeed?: number // How fast circle expands
  baseColor?: string // Base asphalt color
}

export default function VoronoiPlantGrowth({
  position = [0, -0.45, 1],
  rotation = [-Math.PI / 2.5, 0, -Math.PI / 2],
  size = [10, 10],
  plantColor = "#00ff88",
  circleRadius = 1.5,
  circleExpansionSpeed = 0.5,
  baseColor = "#1a1a1c",
}: VoronoiPlantGrowthProps) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const materialRef = React.useRef<THREE.ShaderMaterial>(null)
  const raycaster = React.useRef(new THREE.Raycaster())
  const pointer = React.useRef(new THREE.Vector2())
  const mouseWorldPos = React.useRef(new THREE.Vector3())
  const isHovering = React.useRef(false)
  const expansionTime = React.useRef(0)

  const { camera, gl } = useThree()

  // Track mouse movement
  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      // Convert to normalized device coordinates
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    gl.domElement.addEventListener("pointermove", handlePointerMove)
    return () => gl.domElement.removeEventListener("pointermove", handlePointerMove)
  }, [gl])

  // Voronoi plant growth shader
  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uPlantColor;
    uniform vec3 uBaseColor;
    uniform vec3 uMousePos;
    uniform float uCircleRadius;
    uniform float uExpansionTime;
    uniform bool uIsHovering;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    
    // Voronoi noise function
    vec2 voronoiHash(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }
    
    float voronoi(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      
      float minDist = 1.0;
      
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = voronoiHash(i + neighbor);
          point = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * point);
          
          vec2 diff = neighbor + point - f;
          float dist = length(diff);
          minDist = min(minDist, dist);
        }
      }
      
      return minDist;
    }
    
    // Fractal Voronoi for organic patterns
    float fractalVoronoi(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 4; i++) {
        if(i >= octaves) break;
        value += amplitude * voronoi(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Base asphalt color
      vec3 color = uBaseColor;
      
      if(uIsHovering) {
        // Calculate distance from mouse position in world space
        vec2 worldPosXZ = vWorldPosition.xz;
        vec2 mousePosXZ = uMousePos.xz;
        float distToMouse = length(worldPosXZ - mousePosXZ);
        
        // Expanding circle with animated radius
        float animatedRadius = uExpansionTime * uCircleRadius;
        
        // Create growing plant effect in circle
        float circleMask = smoothstep(animatedRadius + 0.2, animatedRadius - 0.2, distToMouse);
        
        if(circleMask > 0.01) {
          // Get Voronoi pattern
          vec2 scaledUV = uv * 8.0;
          float voronoiPattern = fractalVoronoi(scaledUV + uTime * 0.2, 4);
          
          // Create organic plant growth pattern
          float plantPattern = smoothstep(0.3, 0.7, voronoiPattern);
          
          // Add some tendrils
          float tendrils = sin(uv.x * 20.0 + uTime) * sin(uv.y * 20.0 - uTime * 0.8);
          tendrils = smoothstep(0.3, 0.7, tendrils);
          
          // Combine patterns
          float finalPattern = plantPattern * tendrils;
          
          // Apply plant color with circle mask
          vec3 plantGlow = uPlantColor * finalPattern;
          color = mix(color, plantGlow, circleMask * finalPattern * 0.9);
          
          // Add subtle emissive
          color += plantGlow * circleMask * 0.3;
        }
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uPlantColor: { value: new THREE.Color(plantColor) },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uMousePos: { value: new THREE.Vector3() },
      uCircleRadius: { value: circleRadius },
      uExpansionTime: { value: 0 },
      uIsHovering: { value: false },
    }),
    [plantColor, baseColor, circleRadius]
  )

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return

    // Update time
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime

    // Raycast from mouse to detect hover
    raycaster.current.setFromCamera(pointer.current, camera)
    const intersects = raycaster.current.intersectObject(meshRef.current)

    if (intersects.length > 0) {
      // Mouse is over the asphalt
      isHovering.current = true
      mouseWorldPos.current.copy(intersects[0].point)
      
      // Update expansion time (grows continuously while hovering)
      expansionTime.current += state.clock.getDelta() * circleExpansionSpeed
      
      // Loop expansion
      if (expansionTime.current > 1.5) {
        expansionTime.current = 0
      }
      
      materialRef.current.uniforms.uMousePos.value.copy(mouseWorldPos.current)
      materialRef.current.uniforms.uIsHovering.value = true
      materialRef.current.uniforms.uExpansionTime.value = expansionTime.current
    } else {
      // Mouse is not over the asphalt
      if (isHovering.current) {
        // Just left the surface
        isHovering.current = false
        expansionTime.current = 0
      }
      materialRef.current.uniforms.uIsHovering.value = false
    }
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={[size[0], size[1], 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}