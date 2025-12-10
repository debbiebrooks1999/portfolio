import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

type ModelLoaderProps = {
  /** Path/URL to your .glb file, e.g. "/models/city_v2.glb" */
  modelPath: string;

  /** Transform props (can be arrays or THREE.* objects) */
  position?: THREE.Vector3 | [number, number, number];
  rotation?: THREE.Euler | [number, number, number];
  scale?: THREE.Vector3 | [number, number, number] | number;

  /** Any other primitive props (onClick, castShadow, etc.) */
  [key: string]: any;
};

export default function GenericModelLoader({
  modelPath,
  position,
  rotation,
  scale,
  ...rest
}: ModelLoaderProps) {
  const group = useRef<THREE.Group>(null);

  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;

    const keys = Object.keys(actions);
    if (keys.length === 0) return;

    const firstAction = actions[keys[0]];
    if (!firstAction) return;

    firstAction.reset().play();
    firstAction.setLoop(2201, Infinity); // LoopRepeat, infinite
  }, [actions]);

  return (
    <primitive
      ref={group}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      {...rest}
    />
  );
}

// Optional: preload – you can call this somewhere central in your app:
useGLTF.preload("/models/Manhole.glb");