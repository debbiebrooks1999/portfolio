// components/PuddleCitySurface.tsx
import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, useGLTF } from "@react-three/drei";
import { EXRLoader } from "three-stdlib";
import { PCDModel } from "PCDModel";

type PuddleCitySurfaceProps = {

  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: [number, number];

  waterNormalUrl?: string;

  asphaltDiffuseUrl?: string;
  asphaltDisplacementUrl?: string;
  asphaltNormalUrl?: string;
  asphaltRoughUrl?: string;

  /** strength of displacement from asphalt_disp.png */
  asphaltDisplacementScale?: number;

  /** 0–1: scale of the puddle plane relative to the asphalt */
  puddleScale?: number;

  /** optional: manhole model url */
  manholeUrl?: string;
};

export default function PuddleCitySurface({

  position = [0, -0.45, 1],
  rotation = [-Math.PI / 2.5, 0, -Math.PI / 2],
  size = [10, 10],

  waterNormalUrl = "/textures/waternormals.jpg",

  asphaltDiffuseUrl = "/textures/asphalt_diff.jpg",
  asphaltDisplacementUrl = "/textures/asphalt_disp.png",
  asphaltNormalUrl = "/textures/asphalt_nor.exr",
  asphaltRoughUrl = "/textures/asphalt_rough.jpg",

  asphaltDisplacementScale = 0.05,
  puddleScale = 0.8,
  manholeUrl = "/models/Manhole.glb", 

}: PuddleCitySurfaceProps) {
  /* ------------- Asphalt textures ------------- */
  const asphaltDiffuse = useOptionalTexture(asphaltDiffuseUrl);
  const asphaltDisplacement = useOptionalTexture(asphaltDisplacementUrl);
  const asphaltNormal = useOptionalTexture(asphaltNormalUrl);
  const asphaltRough = useOptionalTexture(asphaltRoughUrl);

  React.useMemo(() => {
    for (const t of [
      asphaltDiffuse,
      asphaltDisplacement,
      asphaltNormal,
      asphaltRough,
    ]) {
      if (t) {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(4, 4);
      }
    }
  }, [asphaltDiffuse, asphaltDisplacement, asphaltNormal, asphaltRough]);

  /* ------------- Water normal ------------- */
  const waterNormal = useOptionalTexture(waterNormalUrl);

  React.useMemo(() => {
    if (!waterNormal) return;
    waterNormal.wrapS = waterNormal.wrapT = THREE.RepeatWrapping;
    waterNormal.repeat.set(6, 6);
  }, [waterNormal]);

  const puddleWidth = size[0] * puddleScale;
  const puddleHeight = size[1] * puddleScale;

  // Voronoi overlay uniforms
  const voronoiUniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uGrowth: { value: 0 }, // 0–1: how far the growth has spread
      uManholeUv: { value: new THREE.Vector2(0.2, 0.45) }, // left-ish area
      uMaxRadius: { value: 0.6 }, // in UV space
      uColorA: { value: new THREE.Color(0x7fd3a5) }, // soft leafy green
      uColorB: { value: new THREE.Color(0x66c2c8) }, // teal-ish
      uLineThickness: { value: 0.08 }, // voronoi edge thickness
      uScale: { value: 7.0 }, // voronoi scale
      uOpacity: { value: 0.9 },
    }),
    []
  );

  // Animate growth + time (for now auto-grow from 0 → 1)
  React.useEffect(() => {
    voronoiUniforms.uGrowth.value = 0;
  }, [voronoiUniforms]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    voronoiUniforms.uTime.value = t;

    // simple ease-in growth, clamp to 1
    const speed = 0.1; // adjust growth speed
    const g = voronoiUniforms.uGrowth.value;
    if (g < 1) {
      voronoiUniforms.uGrowth.value = Math.min(1, g + delta * speed);
    }
  });

  const voronoiMaterial = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: voronoiUniforms,
        vertexShader: voronoiVertexShader,
        fragmentShader: voronoiFragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [voronoiUniforms]
  );

  return (
    <group position={position}>
      {/* Base asphalt */}
      <mesh rotation={rotation} receiveShadow>
        <planeGeometry args={[size[0], size[1], 128, 128]} />
        <meshStandardMaterial
          color={new THREE.Color("#202225")}
          map={asphaltDiffuse ?? null}
          displacementMap={asphaltDisplacement ?? null}
          displacementScale={
            asphaltDisplacement ? asphaltDisplacementScale : 0
          }
          normalMap={asphaltNormal ?? null}
          roughnessMap={asphaltRough ?? null}
          roughness={0.95}
          metalness={0.0}
          envMapIntensity={0.25}
        />
      </mesh>

      {/* Voronoi "rewilding" overlay, very close above the asphalt */}
      <mesh rotation={rotation} position={[0, 0.005, 0]} renderOrder={1}>
        <planeGeometry args={[size[0], size[1], 1, 1]} />
        <primitive object={voronoiMaterial} attach="material" />
      </mesh>

      {/* Big reflective puddle in the middle */}
      <mesh
        rotation={rotation}
        position={[0, 0.03, 0]} // slightly above asphalt
        renderOrder={2} // draw on top
      >
        <planeGeometry args={[puddleWidth, puddleHeight]} />
        <MeshReflectorMaterial
          mirror={1}
          mixStrength={3}
          mixBlur={0.5}
          blur={[50, 100]}
          resolution={1024}
          roughness={0.05}
          depthScale={0.01}
          minDepthThreshold={0.8}
          maxDepthThreshold={1.0}
          color="#2a3f52"
          normalMap={waterNormal ?? null}
          normalScale={new THREE.Vector2(0.15, 0.15)}
          transparent={false}
        />
      </mesh>

      {/* Manhole cover on the left */}
      <ManholeCover
        url={manholeUrl}
        rotation={rotation}
        planeSize={size}
      />
    </group>
  );
}

/**
 * Manhole GLB loader & placement
 */
function ManholeCover({
  url,
  rotation,
  planeSize,
}: {
  url: string;
  rotation: [number, number, number];
  planeSize: [number, number];
}) {
  const gltf = useGLTF(url) as any;

  // Place it on the left side of the plane
  const xOffset = -planeSize[0] * 0.3;
  const zOffset = 0;

  return (
    <group
      position={[xOffset, 0.03, zOffset]}
      rotation={rotation}
      scale={[0.6, 0.6, 0.6]} // tweak to fit
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

// Preload if you like
useGLTF.preload("/models/Manhole.glb");

/**
 * Loads a texture but tolerates 404/missing by returning undefined.
 * Uses EXRLoader only for .exr (your asphalt normal).
 */
function useOptionalTexture(url?: string) {
  const [tex, setTex] = React.useState<THREE.Texture | undefined>(undefined);

  React.useEffect(() => {
    if (!url) return;
    let alive = true;

    const isExr = url.toLowerCase().endsWith(".exr");
    const loader = isExr ? new EXRLoader() : new THREE.TextureLoader();

    loader.load(
      url,
      (loaded: any) => {
        if (!alive) return;
        const texture = loaded as THREE.Texture;
        setTex((prev) => {
          prev?.dispose?.();
          return texture;
        });
      },
      undefined,
      () => setTex(undefined)
    );

    return () => {
      alive = false;
    };
  }, [url]);

  return tex;
}

/* ──────────────────────────────
   Voronoi "leafy" overlay shader
   ────────────────────────────── */

const voronoiVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const voronoiFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uGrowth;      // 0–1 growth
  uniform vec2  uManholeUv;   // origin of growth in UV
  uniform float uMaxRadius;   // max radius (in UV)
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform float uLineThickness;
  uniform float uScale;
  uniform float uOpacity;

  // Simple hash
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.45);
    return fract(p.x * p.y);
  }

  // Basic 2D Voronoi, returns distance to nearest cell edge
  float voronoiEdge(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    float res = 1.0;

    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = vec2(hash21(n + g), hash21(n + g + 1.23));
        o = 0.5 + 0.5 * sin(uTime * 0.3 + 6.2831 * o);
        vec2 r = g + o - f;
        float d = length(r);
        res = min(res, d);
      }
    }

    // edge = inverted distance
    return res;
  }

  void main() {
    // radial growth from manhole center in UV space
    vec2 toUv = vUv - uManholeUv;
    float dist = length(toUv);

    float radius = uGrowth * uMaxRadius;
    float feather = 0.15;

    // mask where growth is active
    float ring = smoothstep(radius, radius - feather, dist);
    // nothing outside radius
    if (ring <= 0.001) {
      discard;
    }

    // Voronoi pattern, slightly animated
    vec2 p = vUv * uScale + vec2(uTime * 0.05, uTime * -0.03);
    float edgeDist = voronoiEdge(p);

    // Create thin glowing cell borders
    float edge = smoothstep(uLineThickness, 0.0, edgeDist);

    if (edge <= 0.001) {
      discard;
    }

    // Organic color blend
    float t = 0.5 + 0.5 * sin(uTime * 0.3 + dist * 4.0);
    vec3 col = mix(uColorA, uColorB, t);

    // Stronger near the origin, softer near radius
    float radialFalloff = smoothstep(radius, 0.0, dist);
    float alpha = edge * ring * radialFalloff * uOpacity;

    gl_FragColor = vec4(col, alpha);
  }
`;