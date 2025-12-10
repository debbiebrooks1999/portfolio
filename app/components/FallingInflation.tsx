// FallingInflation.tsx
import React, { useRef, useState, useEffect } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { InflationModel } from "./InflationModel";
import * as THREE from "three";

export interface FallingInflationProps {
  onAnimationComplete?: () => void;
  /** Seconds to fall from startY to endY */
  fallDuration?: number;
  /** Starting Y (off-screen top) */
  startY?: number;
  /** Landing Y */
  endY?: number;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;

export const FallingInflation: React.FC<FallingInflationProps> = ({
  onAnimationComplete,
  fallDuration = 3,
  startY = 10,
  endY = 0.7,
}) => {
  const group = useRef<Group>(null!);

  const startX = 0;
  const startZ = 0;

  const [playAnimation, setPlayAnimation] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasLanded) {
      // Start the GLTF's internal animation once we've landed (and rotated)
      setPlayAnimation(true);
    }
  }, [hasLanded]);

  useFrame((state) => {
    if (hasLanded) return;

    const t = state.clock.getElapsedTime();

    if (startTimeRef.current === null) {
      startTimeRef.current = t;
    }

    const elapsed = t - startTimeRef.current;

    // Falling
    const progress = Math.min(elapsed / fallDuration, 1);
    const y = startY + (endY - startY) * progress;

    if (group.current) {
      group.current.position.set(startX, y, startZ);
    }

    if (progress >= 1) {
      // if (group.current) {
      //   group.current.rotation.x = degToRad(40);
      // }
      setHasLanded(true);
    }


  });

  return (
    <group ref={group} scale={0.2}>
      <InflationModel
        playAnimation={playAnimation}
        onAnimationComplete={onAnimationComplete}
      />
    </group>
  );
};