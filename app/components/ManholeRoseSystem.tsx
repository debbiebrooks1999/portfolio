import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EXRLoader } from 'three-stdlib';

// Constants
const VAT_FIRST_FRAME = 0;
const VAT_LAST_FRAME = 339;
const R1_START = 1, R1_END = 110;
const R2_START = 115, R2_END = 220;
const R3_START = 229, R3_END = 338;
const ROTATION_SPEED = Math.PI * 2;

// Types
export type ManholeState = 'idle' | 'growing' | 'grown' | 'shrinking';

export interface RoseData {
  mesh: THREE.Mesh | null;
  currentFrame: number;
  startFrame: number;
  endFrame: number;
  delay: number;
  delayTimer: number;
  isAnimating: boolean;
  direction: number;
  speed: number;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  roseType: number;
}

// Utility functions
export function clampFrame(frame: number): number {
  return Math.max(VAT_FIRST_FRAME, Math.min(VAT_LAST_FRAME, frame));
}

export function getRandomScale() {
  const baseScale = 20 + Math.random() * 25;
  const heightMultiplier = 0.9 + Math.random() * 0.2;
  const widthMultiplier = 0.9 + Math.random() * 0.2;
  
  return new THREE.Vector3(
    baseScale * widthMultiplier,
    baseScale * heightMultiplier,
    baseScale * widthMultiplier
  );
}

// Rose Shader Material
export const createRoseMaterial = (vatTexture: THREE.Texture | null) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      // R1: Green
      uGreen1: { value: new THREE.Color(0x325825) },
      uGreen2: { value: new THREE.Color(0x4f802b) },
      // R2: Red (bright red)
      uRedLight: { value: new THREE.Color(0xff3333) },
      uRedMid: { value: new THREE.Color(0xcc2222) },
      // R3: Deep Red (darker, more dramatic)
      uDeepRedLight: { value: new THREE.Color(0xdd2211) },
      uDeepRedDark: { value: new THREE.Color(0x660000) },
      uFrame: { value: 0.0 },
      uVatPosTex: { value: vatTexture },
      uFrameCount: { value: VAT_LAST_FRAME + 1.0 },
      uUseVAT: { value: vatTexture ? 1.0 : 0.0 },
      uRoseType: { value: 1.0 },
      uTime: { value: 0.0 },
      uVertexCount: { value: 1.0 }
    },
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      uniform float uFrame;
      uniform sampler2D uVatPosTex;
      uniform float uFrameCount;
      uniform float uUseVAT;
      uniform float uVertexCount;
      
      attribute float vertexIndex;

      void main() {
        vUv = uv;
        vec3 pos = position;

        if (uUseVAT > 0.5) {
          float u = clamp(uFrame, 0.0, uFrameCount - 1.0) / uFrameCount;
          float v = vertexIndex / uVertexCount;
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
      
      uniform vec3 uGreen1;
      uniform vec3 uGreen2;
      uniform vec3 uRedLight;
      uniform vec3 uRedMid;
      uniform vec3 uDeepRedLight;
      uniform vec3 uDeepRedDark;
      uniform float uRoseType;
      uniform float uTime;

      void main() {
        vec3 baseColor;

        if (uRoseType < 1.5) {
          // R1: Green gradient
          float t = smoothstep(0.0, 1.0, vUv.y);
          baseColor = mix(uGreen1, uGreen2, t);
          
        } else if (uRoseType < 2.5) {
          // R2: Red with variation
          float colorVariation = vUv.y * 0.7 + vUv.x * 0.3;
          float variation = sin(vUv.x * 8.0) * cos(vUv.y * 8.0) * 0.15 + 0.5;
          colorVariation = mix(colorVariation, variation, 0.2);
          baseColor = mix(uRedMid, uRedLight, colorVariation);
          
        } else {
          // R3: Deep Red with DARK base
          // More dramatic gradient - darker at base
          float heightGradient = smoothstep(0.0, 0.8, vUv.y);
          
          // Add variation
          float colorVariation = vUv.y * 0.5 + vUv.x * 0.2;
          float variation = sin(vUv.x * 10.0) * cos(vUv.y * 10.0) * 0.1 + 0.5;
          colorVariation = mix(colorVariation, variation, 0.3);
          
          // Mix: dark base → deep red top
          vec3 gradientColor = mix(uDeepRedDark, uDeepRedLight, heightGradient);
          baseColor = mix(gradientColor * 0.8, gradientColor, colorVariation);
        }

        // Enhanced lighting for all roses
        vec3 normal = normalize(vNormal);
        
        vec3 lightDir1 = normalize(vec3(1.0, 1.5, 1.0));
        float diffuse1 = max(dot(normal, lightDir1), 0.0);
        
        vec3 lightDir2 = normalize(vec3(-0.8, 0.3, -1.0));
        float diffuse2 = max(dot(normal, lightDir2), 0.0) * 0.4;
        
        // Stronger ambient occlusion for R3 (more dramatic shadows)
        float ao = 0.3 + 0.7 * (vUv.y * 0.5 + 0.5);
        if (uRoseType > 2.5) {
          ao = 0.2 + 0.8 * (vUv.y * 0.6 + 0.4); // Darker shadows for R3
        }
        
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
        float rim = 1.0 - max(dot(viewDir, normal), 0.0);
        rim = pow(rim, 3.0) * 0.3;
        
        float totalLight = diffuse1 * 0.7 + diffuse2 + 0.4;
        totalLight *= ao;
        totalLight = clamp(totalLight, 0.3, 1.2);
        
        vec3 finalColor = baseColor * totalLight;
        
        // Warm rim for reds, green rim for green
        if (uRoseType < 1.5) {
          finalColor += rim * vec3(0.7, 1.0, 0.7); // Green rim
        } else {
          finalColor += rim * vec3(1.0, 0.6, 0.5); // Warm red rim
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  });
};

// Manhole Component
export const Manhole: React.FC<{
  state: ManholeState;
  onStateChange: (state: ManholeState) => void;
  rosesRef: React.MutableRefObject<RoseData[]>;
}> = ({ state, onStateChange, rosesRef }) => {
  const manholeRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/Manhole.glb');
  const rotationRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (state === 'idle') {
      onStateChange('growing');
    } else if (state === 'grown') {
      onStateChange('shrinking');
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  useFrame((_, delta) => {
    if (!manholeRef.current) return;

    if (state === 'growing') {
      rotationRef.current += ROTATION_SPEED * delta;
      manholeRef.current.rotation.y = rotationRef.current;

      // Check if all roses are grown
      const allGrown = rosesRef.current.every(
        rose => rose.currentFrame >= rose.endFrame
      );
      if (allGrown) {
        onStateChange('grown');
      }
    } else if (state === 'shrinking') {
      rotationRef.current -= ROTATION_SPEED * delta;
      manholeRef.current.rotation.y = rotationRef.current;

      // Check if all roses are shrunk
      const allShrunk = rosesRef.current.every(
        rose => rose.currentFrame <= rose.startFrame
      );
      if (allShrunk) {
        onStateChange('idle');
        rotationRef.current = 0;
        manholeRef.current.rotation.y = 0;
      }
    }
  });

  const isRotating = state === 'growing' || state === 'shrinking';

  return (
    <group 
      ref={manholeRef} 
      position={[0, 0, 0]} 
      scale={[1, 1, 1]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={scene.clone()} />
      
      {/* Visual feedback for hover state */}
      {isHovered && !isRotating && (
        <>
          <pointLight
            position={[0, 0.5, 0]}
            intensity={2}
            distance={3}
            color="#00ffff"
          />
        
        </>
      )}
    </group>
  );
};

// Rose System Component
export const RoseSystem: React.FC<{
  manholeState: ManholeState;
  rosesRef: React.MutableRefObject<RoseData[]>;
}> = ({ manholeState, rosesRef }) => {
  const [roses, setRoses] = useState<RoseData[]>([]);
  const { nodes } = useGLTF('/models/Rose.glb');
  const vatTexture = useLoader(EXRLoader, '/textures/Rose_pos.exr');
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (vatTexture) {
      vatTexture.minFilter = THREE.NearestFilter;
      vatTexture.magFilter = THREE.NearestFilter;
    }
  }, [vatTexture]);

  useEffect(() => {
    // Find and setup rose geometry
    let foundGeometry: THREE.BufferGeometry | null = null;
    Object.values(nodes).forEach((node: any) => {
      if (node.isMesh && node.geometry) {
        const geom = node.geometry.clone();
        
        if (geom.attributes.color) {
          geom.deleteAttribute('color');
        }

        // Add vertexIndex attribute for VAT
        const vertexCount = geom.attributes.position.count;
        const vertexIndices = new Float32Array(vertexCount);
        for (let i = 0; i < vertexCount; i++) {
          vertexIndices[i] = i;
        }
        geom.setAttribute('vertexIndex', new THREE.BufferAttribute(vertexIndices, 1));

        foundGeometry = geom;
      }
    });
    setGeometry(foundGeometry);
  }, [nodes]);

  useEffect(() => {
    if (manholeState === 'growing' && geometry && roses.length === 0) {
      const newRoses: RoseData[] = [];
      
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const radius = 0.3 + Math.random() * 0.8;
        const offsetX = Math.cos(angle) * radius;
        const offsetZ = Math.sin(angle) * radius;
        const instanceScale = getRandomScale();

        for (let j = 0; j < 3; j++) {
          const startFrame = [R1_START, R2_START, R3_START][j];
          const endFrame = [R1_END, R2_END, R3_END][j];

          newRoses.push({
            mesh: null,
            currentFrame: clampFrame(startFrame),
            startFrame,
            endFrame,
            delay: i * 0.25,
            delayTimer: 0,
            isAnimating: false,
            direction: 1,
            speed: 0.8 + Math.random() * 0.8,
            position: new THREE.Vector3(offsetX, 0, offsetZ),
            scale: instanceScale,
            roseType: j + 1
          });
        }
      }
      
      setRoses(newRoses);
      rosesRef.current = newRoses;
    } else if (manholeState === 'idle' && roses.length > 0) {
      setRoses([]);
      rosesRef.current = [];
    }
  }, [manholeState, geometry, roses.length]);

  useFrame((state, delta) => {
    if (roses.length === 0) return;

    const time = state.clock.elapsedTime;

    roses.forEach((rose) => {
      // Set direction based on manhole state
      if (manholeState === 'growing' || manholeState === 'grown') {
        rose.direction = manholeState === 'growing' ? 1 : 0;
      } else if (manholeState === 'shrinking') {
        rose.direction = -1;
      }

      // Handle delay
      if (!rose.isAnimating && rose.direction !== 0) {
        rose.delayTimer += delta;
        if (rose.delayTimer >= rose.delay) {
          rose.isAnimating = true;
        }
      }

      // Animate
      if (rose.isAnimating && rose.direction !== 0) {
        const speed = rose.speed * rose.direction;
        rose.currentFrame += speed;

        if (rose.direction > 0) {
          if (rose.currentFrame >= rose.endFrame) {
            rose.currentFrame = rose.endFrame;
            rose.isAnimating = false;
          }
        } else if (rose.direction < 0) {
          if (rose.currentFrame <= rose.startFrame) {
            rose.currentFrame = rose.startFrame;
            rose.isAnimating = false;
          }
        }

        rose.currentFrame = clampFrame(rose.currentFrame);
      }

      // Update material uniforms
      if (rose.mesh) {
        const material = rose.mesh.material as THREE.ShaderMaterial;
        if (material.uniforms) {
          material.uniforms.uFrame.value = rose.currentFrame;
          material.uniforms.uTime.value = time;
        }
      }
    });
  });

  if (!geometry || roses.length === 0) return null;

  return (
    <>
      {roses.map((rose, index) => (
        <mesh
          key={index}
          ref={(ref) => {
            if (ref) {
              rose.mesh = ref;
              // Set vertex count uniform
              const material = ref.material as THREE.ShaderMaterial;
              if (material.uniforms && geometry) {
                material.uniforms.uVertexCount.value = geometry.attributes.position.count;
              }
            }
          }}
          geometry={geometry}
          position={rose.position}
          scale={rose.scale}
        >
          <primitive 
            object={createRoseMaterial(vatTexture)} 
            attach="material"
            uniforms-uRoseType-value={rose.roseType}
          />
        </mesh>
      ))}
    </>
  );
};