import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SteamToCylinderProps {
  particleCount?: number;
  transitionDuration?: number;
  cylinderRadius?: number;
  cylinderHeight?: number;
  steamSpread?: number;
}

const SteamToCylinder: React.FC<SteamToCylinderProps> = ({
  particleCount = 2000,
  transitionDuration = 4,
  cylinderRadius = 1,
  cylinderHeight = 4,
  steamSpread = 0.8,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Create particle data
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const targetPositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Initial steam positions (bottom, spread out)
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * steamSpread;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.random() * 0.5; // Start low
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Steam velocities (upward with turbulence)
      velocities[i3] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 1] = 0.5 + Math.random() * 1.5; // Upward
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

      // Phase offset for variation
      phases[i] = Math.random() * Math.PI * 2;

      // Target cylinder positions
      const cylAngle = (i / particleCount) * Math.PI * 2 * 5; // Multiple rings
      const cylRadius = cylinderRadius + (Math.random() - 0.5) * 0.1;
      const cylHeight = (i / particleCount) * cylinderHeight;

      targetPositions[i3] = Math.cos(cylAngle) * cylRadius;
      targetPositions[i3 + 1] = cylHeight;
      targetPositions[i3 + 2] = Math.sin(cylAngle) * cylRadius;
    }

    return { positions, velocities, phases, targetPositions };
  }, [particleCount, steamSpread, cylinderRadius, cylinderHeight]);

  // Create geometry and material
  const { geometry, material } = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xaaddff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    return { geometry: geom, material: mat };
  }, [particles.positions]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    timeRef.current += delta;
    const progress = Math.min(timeRef.current / transitionDuration, 1);
    
    // Easing function for smooth transition
    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      if (progress < 1) {
        // Steam phase - turbulent upward motion
        const steamInfluence = 1 - easeProgress;
        const turbulence = Math.sin(state.clock.elapsedTime * 2 + particles.phases[i]) * 0.3;

        // Apply velocity with turbulence
        positions[i3] += particles.velocities[i3] * delta * steamInfluence + turbulence * delta;
        positions[i3 + 1] += particles.velocities[i3 + 1] * delta * steamInfluence;
        positions[i3 + 2] += particles.velocities[i3 + 2] * delta * steamInfluence + turbulence * delta * 0.5;

        // Add swirling motion
        const swirlAngle = state.clock.elapsedTime * 0.5 + particles.phases[i];
        const swirlRadius = 0.2 * steamInfluence;
        positions[i3] += Math.cos(swirlAngle) * swirlRadius * delta;
        positions[i3 + 2] += Math.sin(swirlAngle) * swirlRadius * delta;

        // Blend towards cylinder position
        const targetX = particles.targetPositions[i3];
        const targetY = particles.targetPositions[i3 + 1];
        const targetZ = particles.targetPositions[i3 + 2];

        positions[i3] = positions[i3] * (1 - easeProgress * 0.1) + targetX * easeProgress * 0.1;
        positions[i3 + 1] = positions[i3 + 1] * (1 - easeProgress * 0.1) + targetY * easeProgress * 0.1;
        positions[i3 + 2] = positions[i3 + 2] * (1 - easeProgress * 0.1) + targetZ * easeProgress * 0.1;

        // Reset particles that go too high during steam phase
        if (positions[i3 + 1] > cylinderHeight * 1.2 && steamInfluence > 0.3) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * steamSpread;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = 0;
          positions[i3 + 2] = Math.sin(angle) * radius;
        }
      } else {
        // Cylinder phase - particles in formation with subtle rotation
        const angle = state.clock.elapsedTime * 0.2;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const targetX = particles.targetPositions[i3];
        const targetZ = particles.targetPositions[i3 + 2];

        // Rotate the cylinder
        positions[i3] = targetX * cos - targetZ * sin;
        positions[i3 + 1] = particles.targetPositions[i3 + 1] + Math.sin(state.clock.elapsedTime * 2 + particles.phases[i]) * 0.05;
        positions[i3 + 2] = targetX * sin + targetZ * cos;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade opacity during transition
    if (material instanceof THREE.PointsMaterial) {
      material.opacity = 0.4 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

export default SteamToCylinder;