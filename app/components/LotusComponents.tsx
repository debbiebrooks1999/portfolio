import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// TYPES
// ============================================================================

export type LotusFlowerState = 
  | 'scaling'    // Growing from 0.01 to 1.0 scale
  | 'blooming'   // Playing bloom animation
  | 'bloomed'    // Fully bloomed (clickable to close)
  | 'closing'    // Playing close animation in reverse
  | 'shrinking'  // Shrinking from 1.0 to 0.01 scale
  | 'removed';   // Cleanup and unmount

interface ParentLeafRef {
  restoreMaterial: () => void;
}

export interface LotusLeafProps {
  position: [number, number, number];
  onFlowerSpawn: (position: [number, number, number], leafRef: ParentLeafRef) => void;
}

export interface LotusFlowerProps {
  position: [number, number, number];
  parentLeaf: ParentLeafRef;
  onRemoved: () => void;
}

// ============================================================================
// LOTUS LEAF COMPONENT
// ============================================================================

export const LotusLeaf: React.FC<LotusLeafProps> = ({ position, onFlowerSpawn }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/lotus_leaf.glb');
  const [hasFlower, setHasFlower] = useState(false);
  const [shaderApplied, setShaderApplied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);
  
  const originalMaterialsRef = useRef<THREE.Material[]>([]);
  const clonedSceneRef = useRef<THREE.Group | null>(null);

  // Store original materials on mount
  useEffect(() => {
    if (clonedSceneRef.current) {
      const materials: THREE.Material[] = [];
      clonedSceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              materials.push(...mesh.material.map((m) => m.clone()));
            } else {
              materials.push(mesh.material.clone());
            }
          }
        }
      });
      originalMaterialsRef.current = materials;
    }
  }, []);

  // Apply shader material when shaderApplied changes
  useEffect(() => {
    if (!clonedSceneRef.current) return;

    if (shaderApplied) {
      // Apply shader material to all meshes
      clonedSceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          // Create shader material for this mesh
          const shaderMat = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: time },
              uColor: { value: new THREE.Color(0x00ff88) },
              uScanlineColor: { value: new THREE.Color(0x00ffff) }
            },
            vertexShader: `
              varying vec3 vPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              
              void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float uTime;
              uniform vec3 uColor;
              uniform vec3 uScanlineColor;
              varying vec3 vPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              
              void main() {
                vec3 baseColor = uColor;
                
                float scanline = sin(vPosition.y * 15.0 + uTime * 1.5) * 0.5 + 0.5;
                scanline = smoothstep(0.45, 0.55, scanline);
                
                float grid = step(0.98, fract(vUv.x * 8.0)) + step(0.98, fract(vUv.y * 8.0));
                grid = clamp(grid, 0.0, 1.0);
                
                float pulse = sin(uTime * 1.0 + vPosition.x * 1.0) * 0.1 + 0.95;
                
                vec3 scanlineColor = mix(baseColor, uScanlineColor, scanline * 0.08);
                vec3 finalColor = mix(scanlineColor, uScanlineColor * 1.2, grid * 0.15);
                finalColor *= pulse;
                
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(normal, lightDir), 0.0) * 0.5 + 0.5;
                finalColor *= diff;
                
                gl_FragColor = vec4(finalColor, 1.0);
              }
            `,
            side: THREE.DoubleSide
          });
          mesh.material = shaderMat;
        }
      });
    }
  }, [shaderApplied]);

  // Update shader time
  useFrame((_, delta) => {
    if (shaderApplied && clonedSceneRef.current) {
      setTime((t) => t + delta);
      // Update time uniform in all shader materials
      clonedSceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && (mesh.material as any).uniforms?.uTime) {
            (mesh.material as any).uniforms.uTime.value = time;
          }
        }
      });
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    // Apply shader if not already applied
    if (!shaderApplied) {
      setShaderApplied(true);
      console.log(`✓ Shader applied to lotus leaf at (${position[0]}, ${position[2]})`);
    }

    // Spawn flower if not already spawned
    if (!hasFlower) {
      onFlowerSpawn(position, {
        restoreMaterial: () => {
          // Restore original materials
          if (clonedSceneRef.current && originalMaterialsRef.current.length > 0) {
            let matIndex = 0;
            clonedSceneRef.current.traverse((child) => {
              if ((child as THREE.Mesh).isMesh && matIndex < originalMaterialsRef.current.length) {
                const mesh = child as THREE.Mesh;
                mesh.material = originalMaterialsRef.current[matIndex].clone();
                matIndex++;
              }
            });
          }
          setShaderApplied(false);
          setHasFlower(false);
          console.log(`✓ Restored leaf material at (${position[0]}, ${position[2]})`);
        }
      });
      setHasFlower(true);
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

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Clone the lotus leaf model */}
      <Clone
        object={scene}
        ref={(clone: THREE.Group) => {
          if (clone && !clonedSceneRef.current) {
            clonedSceneRef.current = clone;
          }
        }}
      />

      {/* Visual feedback for hover state */}
      {isHovered && !hasFlower && (
        <>
          <pointLight position={[0, 0.5, 0]} intensity={1.5} distance={2.5} color="#00ff88" />
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.8, 32]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
};

// ============================================================================
// LOTUS FLOWER COMPONENT
// ============================================================================

export const LotusFlower: React.FC<LotusFlowerProps> = ({ position, parentLeaf, onRemoved }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('./models/lotus_flower_blooming_animation.glb');
  const [state, setState] = useState<LotusFlowerState>('scaling');
  const [isHovered, setIsHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(0.01);
  const [time, setTime] = useState(0);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<THREE.AnimationAction[]>([]);
  const sceneCloneRef = useRef<THREE.Group | null>(null);

  // Setup animation mixer and apply shader
  useEffect(() => {
    if (!sceneCloneRef.current) return;

    console.log('🪷 LotusFlower setting up animation');

    // Apply shader material to flower meshes
    sceneCloneRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const materialName = mesh.material ? (mesh.material as any).name : '';
        
        // Only apply to specific flower material (wire mesh)
        if (materialName === 'wire_196088225.002' || materialName.includes('wire_196088225')) {
          const shaderMat = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0.0 },
              uColor: { value: new THREE.Color(0xff00ff) },
              uScanlineColor: { value: new THREE.Color(0x00ffff) },
              uWireframeColor: { value: new THREE.Color(0xff00ff) }
            },
            vertexShader: `
              varying vec3 vPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              
              void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `,
            fragmentShader: `
              uniform float uTime;
              uniform vec3 uColor;
              uniform vec3 uScanlineColor;
              uniform vec3 uWireframeColor;
              varying vec3 vPosition;
              varying vec3 vNormal;
              varying vec2 vUv;
              
              void main() {
                vec3 baseColor = uColor;
                
                float scanline = sin(vPosition.y * 20.0 + uTime * 3.0) * 0.5 + 0.5;
                scanline = smoothstep(0.4, 0.6, scanline);
                
                float wireframe = 0.0;
                float edgeWidth = 0.05;
                if (vUv.x < edgeWidth || vUv.x > 1.0 - edgeWidth || 
                    vUv.y < edgeWidth || vUv.y > 1.0 - edgeWidth) {
                  wireframe = 1.0;
                }
                
                float grid = step(0.95, fract(vUv.x * 10.0)) + step(0.95, fract(vUv.y * 10.0));
                grid = clamp(grid, 0.0, 1.0);
                
                float pulse = sin(uTime * 2.0 + vPosition.x * 2.0) * 0.3 + 0.7;
                
                vec3 scanlineColor = mix(baseColor, uScanlineColor, scanline * 0.3);
                vec3 finalColor = mix(scanlineColor, uWireframeColor, wireframe * 0.5);
                finalColor = mix(finalColor, uWireframeColor * 1.5, grid * 0.4);
                finalColor *= pulse;
                
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                float diff = max(dot(normal, lightDir), 0.0) * 0.5 + 0.5;
                finalColor *= diff;
                
                gl_FragColor = vec4(finalColor, 1.0);
              }
            `,
            side: THREE.DoubleSide
          });
          mesh.material = shaderMat;
        }
      }
    });

    // Setup animation mixer
    const mixer = new THREE.AnimationMixer(sceneCloneRef.current);
    mixerRef.current = mixer;

    const newActions: THREE.AnimationAction[] = [];
    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      newActions.push(action);
    });
    actionsRef.current = newActions;

    return () => {
      if (mixerRef.current) {
        actionsRef.current.forEach((action) => {
          action.stop();
        });
      }
    };
  }, [animations]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log('🪷 Flower clicked, current state:', state);

    if (state === 'bloomed') {
      setState('closing');
      actionsRef.current.forEach((action) => {
        console.log('🪷 Playing animation reverse (closing)');
        action.paused = false;
        action.timeScale = -1;
        action.time = action.getClip().duration;
        action.play();
      });
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (state === 'bloomed') {
      setIsHovered(true);
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  useFrame((_, delta) => {
    setTime((t) => t + delta);

    // Update shader time uniforms
    if (sceneCloneRef.current) {
      sceneCloneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material && (mesh.material as any).uniforms?.uTime) {
            (mesh.material as any).uniforms.uTime.value = time;
          }
        }
      });
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // Scaling up
    if (state === 'scaling') {
      setCurrentScale((scale) => {
        const newScale = scale + delta * 1.5;
        if (newScale >= 1.0) {
          // Start blooming animation
          actionsRef.current.forEach((action) => {
            action.play();
          });
          setState('blooming');
          console.log(`🪷 Lotus blooming at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
          return 1.0;
        }
        return newScale;
      });
    }

    // Check if bloom animation finished
    if (state === 'blooming' && actionsRef.current.length > 0) {
      const action = actionsRef.current[0];
      if (action.time >= action.getClip().duration - 0.01) {
        setState('bloomed');
        console.log(`✓ Lotus fully bloomed at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
      }
    }

    // Check if closing animation finished - then start shrinking
    if (state === 'closing' && actionsRef.current.length > 0) {
      const action = actionsRef.current[0];
      if (action.time <= 0.01) {
        setState('shrinking');
        console.log(`✓ Lotus closed, now shrinking at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
      }
    }

    // Scaling down (shrinking)
    if (state === 'shrinking') {
      setCurrentScale((scale) => {
        const newScale = scale - delta * 1.5;
        if (newScale <= 0.01) {
          setState('removed');
          console.log(`✓ Lotus fully shrunk at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
          parentLeaf?.restoreMaterial();
          onRemoved();
          return 0.01;
        }
        return newScale;
      });
    }
  });

  if (state === 'removed') return null;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={currentScale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Clone the lotus flower model */}
      <Clone
        object={scene}
        ref={(clone: THREE.Group) => {
          if (clone && !sceneCloneRef.current) {
            sceneCloneRef.current = clone;
          }
        }}
      />

      {/* Hover indicator */}
      {isHovered && state === 'bloomed' && (
        <>
          <pointLight position={[0, 0.5, 0]} intensity={2} distance={2} color="#ff00ff" />
          <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.6, 32]} />
            <meshBasicMaterial color="#ff00ff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
};

// Preload models
useGLTF.preload('./models/lotus_leaf.glb');
useGLTF.preload('./models/lotus_flower_blooming_animation.glb');