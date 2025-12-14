import React, { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

// Types
export type LotusFlowerState = 'bloomed' | 'closing' | 'removed';

export interface LotusLeafProps {
  position: [number, number, number];
  onFlowerSpawn: (position: [number, number, number], leafRef: any) => void;
}

export interface LotusFlowerProps {
  position: [number, number, number];
  parentLeaf: any;
  onRemoved: () => void;
}

// Lotus Leaf Component
export const LotusLeaf: React.FC<LotusLeafProps> = ({ position, onFlowerSpawn }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('./models/lotus_leaf.glb');
  const [hasFlower, setHasFlower] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    if (!hasFlower) {
      onFlowerSpawn(position, { 
        restoreMaterial: () => {
          setHasFlower(false);
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
      <Clone object={scene} />
      
      {/* Visual feedback for hover state */}
      {isHovered && !hasFlower && (
        <>
          <pointLight
            position={[0, 0.5, 0]}
            intensity={1.5}
            distance={2.5}
            color="#00ff88"
          />
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.8, 32]} />
            <meshBasicMaterial 
              color="#00ff88" 
              transparent 
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};

// Lotus Flower Component
export const LotusFlower: React.FC<LotusFlowerProps> = ({ position, parentLeaf, onRemoved }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('./models/lotus_flower_blooming_animation.glb');
  const [state, setState] = useState<LotusFlowerState>('bloomed');
  const [isHovered, setIsHovered] = useState(false);
  
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<THREE.AnimationAction[]>([]);
  const sceneCloneRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!sceneCloneRef.current) return;
    
    console.log('LotusFlower setting up animation');
    
    // Create mixer from the cloned scene
    const mixer = new THREE.AnimationMixer(sceneCloneRef.current);
    mixerRef.current = mixer;
    
    const newActions: THREE.AnimationAction[] = [];
    animations.forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      
      // Set to END of animation immediately (bloomed state)
      action.time = clip.duration;
      mixer.update(0); // Force update to apply the time change
      
      newActions.push(action);
    });
    actionsRef.current = newActions;
    
    console.log('Animation set to bloomed state (end frame)');
    
    return () => {
      if (mixerRef.current) {
        actionsRef.current.forEach(action => {
          action.stop();
        });
      }
    };
  }, [animations]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    console.log('Flower clicked, current state:', state);
    
    if (state === 'bloomed') {
      setState('closing');
      actionsRef.current.forEach(action => {
        console.log('Playing animation reverse (closing)');
        action.paused = false;
        action.timeScale = -1;
        action.time = action.getClip().duration;
        action.play();
      });
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

  useFrame((frameState, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    if (state === 'closing' && actionsRef.current.length > 0) {
      const action = actionsRef.current[0];
      if (action.time <= 0.01) {
        console.log('Closing complete, removing flower');
        setState('removed');
        parentLeaf?.restoreMaterial();
        onRemoved();
      }
    }
  });

  if (state === 'removed') return null;

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
          if (clone && !sceneCloneRef.current) {
            sceneCloneRef.current = clone;
          }
        }}
      />
      
      {isHovered && (
        <>
          <pointLight
            position={[0, 0.5, 0]}
            intensity={2}
            distance={2}
            color="#ff00ff"
          />
          <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.6, 32]} />
            <meshBasicMaterial 
              color="#ff00ff" 
              transparent 
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
    </group>
  );
};