// InflationModel.tsx
import React, { useEffect, useRef } from "react";
import { Group } from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

type InflationModelProps = ThreeElements["group"] & {
  /**
   * When true, plays all builtin animation clips.
   */
  playAnimation?: boolean;
  /**
   * Callback fired when the animation finishes.
   */
  onAnimationComplete?: () => void;
};

// If you want extra-strong typing:
//
// import type { GLTF } from "three-stdlib";
// type InflationGLTF = GLTF & { /* nodes/materials if you need them */ };

export const InflationModel: React.FC<InflationModelProps> = ({
  playAnimation = false,
  onAnimationComplete,
  ...props
}) => {
  const group = useRef<Group>(null!);
  const { scene, animations } = useGLTF("/models/inflation.glb");
  const { actions, mixer } = useAnimations(animations, group);

  // useEffect(() => {
  //   if (group.current) {
  //     group.current.rotation.x = THREE.MathUtils.degToRad(40);
  //   }
  // }, []);

  useEffect(() => {
    if (!actions) return;

    const handleAnimationFinish = (event: any) => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    mixer.addEventListener("finished", handleAnimationFinish);

    if (playAnimation) {
      Object.values(actions).forEach((action) => {
        if (!action) return;
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
      });
    } else {
      Object.values(actions).forEach((action) => {
        if (!action) return;
        action.stop();
      });
    }

    return () => {
      mixer.removeEventListener("finished", handleAnimationFinish);
    };
  }, [playAnimation, actions, mixer, onAnimationComplete]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} />
    </group>
  );
};

useGLTF.preload("/models/inflation.glb");
