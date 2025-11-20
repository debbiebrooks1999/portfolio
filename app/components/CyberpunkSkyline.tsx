// CyberpunkSkyline.tsx
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Group, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { BillboardSkyscraper } from "./BillboardSkyscraper";

interface CyberpunkSkylineProps {
  /** Put the whole skyline behind your wall */
  position?: [number, number, number];
  girlTextureUrl: string; // spritesheet you already have
}

/* ──────────────────────────────────────────────
   Light beam shader
────────────────────────────────────────────── */

const beamVertexShader = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const beamFragmentShader = `
  precision highp float;
  varying vec3 vPos;
  uniform vec3 uColor;
  uniform float uTime;

  void main() {
    // Radius from center (x,z)
    float r = length(vPos.xz);

    // Soft radial falloff
    float radial = smoothstep(0.3, 0.0, r);

    // Vertical fade (top softer than bottom)
    float h = (vPos.y + 1.0) * 0.5;
    float vertical = smoothstep(0.0, 1.0, h);

    // Slight time flicker
    float flicker = 0.8 + 0.2 * sin(uTime * 5.0 + vPos.y * 4.0);

    float alpha = radial * vertical * flicker;

    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface LightBeamProps {
  position: [number, number, number];
  height?: number;
  radius?: number;
  color?: THREE.ColorRepresentation;
}

const LightBeam: React.FC<LightBeamProps> = ({
  position,
  height = 6,
  radius = 0.6,
  color = 0x00ffff,
}) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    }),
    [color]
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: beamVertexShader,
        fragmentShader: beamFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [uniforms]
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <mesh position={position} material={material}>
      {/* Cone standing on origin (we move the whole mesh) */}
      <cylinderGeometry args={[0, radius, height, 16, 1, true]} />
    </mesh>
  );
};

/* ──────────────────────────────────────────────
   Floating neon sign (simple plane + Text)
────────────────────────────────────────────── */

interface FloatingSignProps {
  position: [number, number, number];
  text: string;
}

const FloatingSign: React.FC<FloatingSignProps> = ({ position, text }) => {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.25;
    groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <planeGeometry args={[1.8, 0.5]} />
        <meshBasicMaterial
          color={new THREE.Color(0x111122)}
          transparent
          opacity={0.7}
        />
      </mesh>
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.22}
        color="#00ffff"
        outlineWidth={0.02}
        outlineColor="#ff00ff"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </group>
  );
};

/* ──────────────────────────────────────────────
   Circular “DIGITAL LOVE” top sign
────────────────────────────────────────────── */

interface RingSignProps {
  radius: number;
  height: number;
  text?: string;
}

const RingSign: React.FC<RingSignProps> = ({
  radius,
  height,
  text = "DIGITAL LOVE",
}) => {
  const groupRef = useRef<Group>(null);

  // Precompute positions/orientations of text instances
  const segments = 12;
  const textPositions = useMemo(
    () =>
      new Array(segments).fill(0).map((_, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return { angle, position: new Vector3(x, height, z) };
      }),
    [radius, height]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    // Rotate whole ring over time
    groupRef.current.rotation.y = t * 0.6;
  });

  return (
    <group ref={groupRef}>
      {/* optional glowing disc */}
      <mesh position={[0, height - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 1.1, radius * 1.1, 0.05, 32]} />
        <meshBasicMaterial
          color={new THREE.Color(0x220022)}
          transparent
          opacity={0.7}
        />
      </mesh>

      {textPositions.map(({ angle, position }, idx) => (
        <Text
          key={idx}
          position={position}
          fontSize={0.4}
          color="#ff00ff"
          outlineWidth={0.05}
          outlineColor="#00ffff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, angle + Math.PI, 0]} // face outward
        >
          {text}
        </Text>
      ))}
    </group>
  );
};

/* ──────────────────────────────────────────────
   Main skyline component
────────────────────────────────────────────── */

export const CyberpunkSkyline: React.FC<CyberpunkSkylineProps> = ({
  position = [0, 0, -25],
  girlTextureUrl,
}) => {
  const groupRef = useRef<Group>(null);

  // Slight idle parallax sway for whole skyline
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!groupRef.current) return;
    groupRef.current.position.x = position[0] + Math.sin(t * 0.05) * 0.5;
  });

  return (
    <>
      {/* Background + fog color (optional) */}
      <color attach="background" args={["#050510"]} />
      {/* Exponential fog gives nice depth */}
      <fogExp2 attach="fog" args={["#050510", 0.035]} />

      <group ref={groupRef} position={position}>
        {/* Centerpiece building with billboard & ring sign */}
        <group>
          <BillboardSkyscraper
            position={[0, 0, 0]}
            buildingSize={[0.8, 12, 0.8]}
            billboardSize={[2.2, 2.2 / (832 / 478)]}
            girlTextureUrl={girlTextureUrl}
            tilesX={5}
            tilesY={16}
            fps={15}
          />
          <RingSign radius={1.4} height={7.0} text="DIGITAL LOVE" />
          <LightBeam position={[0, 0.5, 0]} height={10} radius={1.0} />
        </group>

        {/* Additional skyscrapers with varying heights/positions */}
        <BillboardSkyscraper
          position={[-4, -0.5, -2]}
          buildingSize={[0.7, 10, 0.7]}
          billboardSize={[1.8, 1.8 / (832 / 478)]}
          girlTextureUrl={girlTextureUrl}
          tilesX={5}
          tilesY={16}
          fps={12}
        />
        <BillboardSkyscraper
          position={[3.5, -0.3, 1]}
          buildingSize={[0.6, 14, 0.6]}
          billboardSize={[2.0, 2.0 / (832 / 478)]}
          girlTextureUrl={girlTextureUrl}
          tilesX={5}
          tilesY={16}
          fps={18}
        />

        {/* Plain buildings without billboards */}
        <mesh position={[-7, 3.5, -3]}>
          <boxGeometry args={[1.2, 7, 1.2]} />
          <meshStandardMaterial color="#050515" emissive="#050510" />
        </mesh>
        <mesh position={[6.5, 5, -4]}>
          <boxGeometry args={[1.0, 9, 1.0]} />
          <meshStandardMaterial color="#040414" emissive="#050510" />
        </mesh>

        {/* Light beams around */}
        <LightBeam position={[-4, 0, -2]} height={8} radius={0.7} color={0x00ffff} />
        <LightBeam position={[3.5, 0, 1]} height={9} radius={0.6} color={0xff00ff} />

        {/* Floating neon signs */}
        <FloatingSign position={[-3, 5.5, 1]} text="NEON DREAMS" />
        <FloatingSign position={[4.5, 6.0, -1]} text="OPEN 24/7" />
        <FloatingSign position={[1.5, 4.5, -3]} text="SYNTH WAVE" />
      </group>
    </>
  );
};