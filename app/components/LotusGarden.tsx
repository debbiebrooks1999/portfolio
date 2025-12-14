import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Clone, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// SHADER MATERIALS
// ============================================================================

const LotusLeafSubtleMaterial = ({ time }: { time: number }) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color(0x00ff88) },
      uScanlineColor: { value: new THREE.Color(0x00ffff) }
    }),
    []
  );

  useFrame(() => {
    uniforms.uTime.value = time;
  });

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
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
      `}
      side={THREE.DoubleSide}
    />
  );
};

const LotusCyberpunkMaterial = ({ time }: { time: number }) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color(0xff00ff) },
      uScanlineColor: { value: new THREE.Color(0x00ffff) },
      uWireframeColor: { value: new THREE.Color(0xff00ff) }
    }),
    []
  );

  useFrame(() => {
    uniforms.uTime.value = time;
  });

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
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
      `}
      side={THREE.DoubleSide}
    />
  );
};

// ============================================================================
// YARD GRASS COMPONENT
// ============================================================================

interface YardGrassProps {
  position: [number, number, number];
}

const YardGrass: React.FC<YardGrassProps> = ({ position }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('./models/yard_grass.glb');
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const mixer = new THREE.AnimationMixer(groupRef.current);
    mixerRef.current = mixer;

    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.timeScale = 0.3;
      action.play();
    });

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [animations]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[0.2, 0.2, 0.2]}>
      <Clone object={scene} />
    </group>
  );
};

// ============================================================================
// LOTUS LEAF COMPONENT
// ============================================================================

export interface LotusLeafProps {
  position: [number, number, number];
  onFlowerSpawn: (position: [number, number, number], leafRef: any) => void;
}

export const LotusLeaf: React.FC<LotusLeafProps> = ({ position, onFlowerSpawn }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/lotus_leaf.glb');
  const [hasFlower, setHasFlower] = useState(false);
  const [shaderApplied, setShaderApplied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(0);
  
  const originalMaterialsRef = useRef<THREE.Material[]>([]);
  const clonedSceneRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (clonedSceneRef.current) {
      // Store original materials
      const materials: THREE.Material[] = [];
      clonedSceneRef.current.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            materials.push(
              Array.isArray(mesh.material)
                ? mesh.material.map((m) => m.clone())
                : (mesh.material as THREE.Material).clone()
            );
          }
        }
      });
      originalMaterialsRef.current = materials;
    }
  }, []);

  useFrame((_, delta) => {
    if (shaderApplied) {
      setTime((t) => t + delta);
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
      <Clone
        object={scene}
        ref={(clone: THREE.Group) => {
          if (clone && !clonedSceneRef.current) {
            clonedSceneRef.current = clone;
          }
        }}
      >
        {shaderApplied && <LotusLeafSubtleMaterial time={time} />}
      </Clone>

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

export type LotusFlowerState = 'scaling' | 'blooming' | 'bloomed' | 'closing' | 'shrinking' | 'removed';

export interface LotusFlowerProps {
  position: [number, number, number];
  parentLeaf: any;
  onRemoved: () => void;
}

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

  useEffect(() => {
    if (!sceneCloneRef.current) return;

    console.log('🪷 LotusFlower setting up animation');

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
      <Clone
        object={scene}
        ref={(clone: THREE.Group) => {
          if (clone && !sceneCloneRef.current) {
            sceneCloneRef.current = clone;
          }
        }}
      >
        <LotusCyberpunkMaterial time={time} />
      </Clone>

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

// ============================================================================
// SCENE COMPONENT
// ============================================================================

const Scene: React.FC = () => {
  const [flowers, setFlowers] = useState<Array<{ id: number; position: [number, number, number]; parentLeaf: any }>>([]);
  const flowerIdCounter = useRef(0);

  const handleFlowerSpawn = (position: [number, number, number], parentLeaf: any) => {
    const newFlower = {
      id: flowerIdCounter.current++,
      position,
      parentLeaf
    };
    setFlowers((prev) => [...prev, newFlower]);
    console.log(`🪷 Spawning lotus flower at (${position[0].toFixed(1)}, ${position[2].toFixed(1)})`);
  };

  const handleFlowerRemoved = (id: number) => {
    setFlowers((prev) => prev.filter((f) => f.id !== id));
    console.log('✓ Removed lotus flower');
  };

  // Yard grass positions
  const yardGrassPositions: [number, number, number][] = [
    [-8, 0, 2],
    [0, 0, -5],
    [8, 0, 3]
  ];

  // Lotus leaf positions
  const lotusLeafPositions: [number, number, number][] = [
    [-6, 0, -3],
    [4, 0, 2],
    [-2, 0, 5],
    [6, 0, -5]
  ];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color={0x330066} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} color={0x00ffff} />
      <directionalLight position={[-3, 2, -5]} intensity={0.5} color={0xff00ff} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={0x0a0520}
          roughness={0.7}
          metalness={0.3}
          emissive={0x110033}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Yard Grass */}
      {yardGrassPositions.map((pos, index) => (
        <YardGrass key={`grass-${index}`} position={pos} />
      ))}

      {/* Lotus Leaves */}
      {lotusLeafPositions.map((pos, index) => (
        <LotusLeaf key={`leaf-${index}`} position={pos} onFlowerSpawn={handleFlowerSpawn} />
      ))}

      {/* Lotus Flowers */}
      {flowers.map((flower) => (
        <LotusFlower
          key={`flower-${flower.id}`}
          position={flower.position}
          parentLeaf={flower.parentLeaf}
          onRemoved={() => handleFlowerRemoved(flower.id)}
        />
      ))}

      {/* Camera Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} target={[0, 0, 0]} />
    </>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const LotusGarden: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, overflow: 'hidden' }}>
      {/* Info Panel */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '10px',
          maxWidth: '320px',
          border: '1px solid #00ffff',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          zIndex: 100,
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <h2
          style={{
            margin: '0 0 10px 0',
            fontSize: '18px',
            color: '#ff00ff',
            textShadow: '0 0 10px #ff00ff'
          }}
        >
          🌹🪷 Cyberpunk Garden
        </h2>
        <div
          style={{
            fontSize: '14px',
            margin: '5px 0',
            padding: '8px',
            background: 'rgba(255, 0, 255, 0.1)',
            borderRadius: '5px'
          }}
        >
          <span style={{ color: '#00ffff', fontWeight: 'bold', textShadow: '0 0 5px #00ffff' }}>Click lotus leaves</span> to
          bloom flowers!
        </div>
        <div
          style={{
            fontSize: '14px',
            margin: '5px 0',
            padding: '8px',
            background: 'rgba(255, 0, 255, 0.1)',
            borderRadius: '5px'
          }}
        >
          <span style={{ color: '#00ffff', fontWeight: 'bold', textShadow: '0 0 5px #00ffff' }}>Click flowers</span> to fully
          reverse (close, shrink, restore leaf)
        </div>
      </div>

      {/* Canvas */}
      <Canvas
        camera={{ position: [0, 10, 18], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{
          background: 'linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #2d0066 100%)'
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default LotusGarden;
