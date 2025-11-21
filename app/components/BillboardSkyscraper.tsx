// BillboardSkyscraper.tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useLoader } from "@react-three/fiber";

interface BillboardSkyscraperProps {
  position?: [number, number, number];
  buildingSize?: [number, number, number]; // width, height, depth
  girlTextureUrl: string;                  // SPRITESHEET
  billboardSize?: [number, number];        // width, height
  tilesX?: number;
  tilesY?: number;
  fps?: number;
}

// ───────────────────────────────────────────────
// Building Shader (unchanged)
// ───────────────────────────────────────────────

const buildingVertexShader = `
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const buildingFragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uWindowColorA;
  uniform vec3 uWindowColorB;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec3 base = uBaseColor;
    
    // Windows
    float windowGrid = 20.0;
    vec2 windowUv = vUv * vec2(windowGrid * 0.25, windowGrid);
    vec2 windowPos = floor(windowUv);
    
    float windowNoise = hash(windowPos);
    
    float isWindow = step(0.1, fract(windowUv.x * 0.5)) * step(0.1, fract(windowUv.y));
    
    if (isWindow > 0.5 && windowNoise > 0.3) {
      float windowFlicker = hash(windowPos + floor(uTime * 5.0));
      vec3 windowColor = mix(uWindowColorA, uWindowColorB, hash(windowPos + vec2(0.1, 0.2)));
      base = mix(base, windowColor, windowFlicker * 0.8);
    }

    gl_FragColor = vec4(base, 1.0);
  }
`;

const billboardFragmentShader = `
  precision highp float;

  uniform sampler2D uGirlTex;
  uniform float uTime;
  uniform vec3 uTintA;
  uniform vec3 uTintB;
  uniform float uGlow;

  uniform vec2 uGrid;   // tilesX, tilesY
  uniform float uFps;   // frames per second

  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    // --- SPRITESHEET FRAME SELECTION ---
    float totalFrames = uGrid.x * uGrid.y;
    float frame = mod(floor(uTime * uFps), totalFrames);

    float fx = mod(frame, uGrid.x);
    float fy = floor(frame / uGrid.x);

    vec2 cellSize   = 1.0 / uGrid;
    vec2 cellOrigin = vec2(fx, fy) * cellSize;

    // Local UV inside the frame (0–1), with a tiny margin to avoid edges
    float margin = 0.002; // 0.2% of frame
    vec2 localUv = margin + vUv * (1.0 - 2.0 * margin);

    // Map into the correct cell
    vec2 uv = cellOrigin + localUv * cellSize;

    // Sample once – no UV shifting, so no bleeding between frames
    vec4 tex = texture2D(uGirlTex, uv);
    float alpha = tex.a;
    if (alpha < 0.02) discard;

    vec3 base = tex.rgb;

    // Scanlines (color only)
    float scan = sin((uv.y + uTime * 0.2) * 500.0) * 0.5 + 0.5;
    float scanStrength = mix(0.6, 1.4, scan);

    // Column flicker (color only)
    float colNoise = hash(vec2(floor(vWorldPos.x * 2.0), floor(uTime * 6.0)));
    float flicker = mix(0.7, 1.3, colNoise);

    // Neon tint
    float tintMix = 0.5 + 0.5 * sin(uTime + uv.y * 5.0);
    vec3 tint = mix(uTintA, uTintB, tintMix);

    vec3 color = base * tint * scanStrength * flicker * uGlow;

    // Edge glow
    float edge = smoothstep(0.0, 0.25, alpha) - smoothstep(0.25, 0.7, alpha);
    vec3 edgeColor = mix(uTintA, uTintB, 0.5);
    color += edgeColor * edge * 1.5;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ───────────────────────────────────────────────
// Billboard Shader (spritesheet animation added)
// ───────────────────────────────────────────────

const billboardVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;


// ───────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────

export const BillboardSkyscraper: React.FC<BillboardSkyscraperProps> = ({
    position = [0, 0, -12],
    buildingSize = [2, 10, 2],
    girlTextureUrl,
    // we'll compute a nice default below if not provided
    billboardSize,
    tilesX = 5,
    tilesY = 16,
    fps = 5, // tweak this to taste
}) => {
      // NOTE: this should now be a spritesheet image, not the raw GIF
    const girlTex = useLoader(THREE.TextureLoader, girlTextureUrl);
    girlTex.colorSpace = THREE.SRGBColorSpace;
    girlTex.wrapS = girlTex.wrapT = THREE.ClampToEdgeWrapping;
    girlTex.minFilter = THREE.NearestFilter;
    girlTex.magFilter = THREE.NearestFilter;

    const frameAspect = 832 / 478;
    const computedBillboardSize: [number, number] =
      billboardSize ?? [4, 4 / frameAspect];


  // BUILDING MATERIAL
  const buildingUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(0x050510) },
      uWindowColorA: { value: new THREE.Color(0x00ffff) },
      uWindowColorB: { value: new THREE.Color(0xff00ff) },
    }),
    []
  );

  const buildingMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: buildingUniforms,
        vertexShader: buildingVertexShader,
        fragmentShader: buildingFragmentShader,
      }) as THREE.ShaderMaterial,
    [buildingUniforms]
  );

  // BILLBOARD MATERIAL
  const billboardUniforms = useMemo(
    () => ({
      uGirlTex: { value: girlTex },
      uTime: { value: 0 },
      uTintA: { value: new THREE.Color(0x00ffff) },
      uTintB: { value: new THREE.Color(0xff00ff) },
      uGlow: { value: 1.8 },
      uGrid: { value: new THREE.Vector2(tilesX, tilesY) },
      uFps: { value: fps },
    }),
    [girlTex, tilesX, tilesY, fps]
  );

  const billboardMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: billboardUniforms,
        vertexShader: billboardVertexShader,
        fragmentShader: billboardFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }) as THREE.ShaderMaterial,
    [billboardUniforms]
  );

  // Update time
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    buildingUniforms.uTime.value = t;
    billboardUniforms.uTime.value = t;
  });

  const [bw, bh] = computedBillboardSize;
  const [_, __, bz] = buildingSize;

  return (
    <group position={position}>
      {/* Building */}
      <mesh material={buildingMaterial}>
        <boxGeometry args={buildingSize} />
      </mesh>

      {/* Billboard (front face) */}
      <mesh
        material={billboardMaterial}
        position={[0, bh * 0.5, bz / 2 + 0.01]}
      >
        <planeGeometry args={[bw, bh]} />
      </mesh>
    </group>
  );
};
