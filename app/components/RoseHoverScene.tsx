import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { EXRLoader } from 'three-stdlib';

// Constants
const VAT_FIRST_FRAME = 0;
const VAT_LAST_FRAME = 339;
const R1_START = 1, R1_END = 110;
const R2_START = 115, R2_END = 220;
const R3_START = 229, R3_END = 338;
const HOVER_DELAY = 0.05;
const RECEDE_DELAY = 2.0;

// Types
interface RoseData {
  mesh: THREE.Mesh;
  currentFrame: number;
  startFrame: number;
  endFrame: number;
  delay: number;
  delayTimer: number;
  isAnimating: boolean;
  direction: number;
  speed: number;
}

interface RoseZone {
  position: THREE.Vector3;
  roses: RoseData[];
  isActive: boolean;
  timeSinceActive: number;
}

// Shader Material Helper
const createRoseMaterial = (vatTexture: THREE.Texture | null) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uGreen1: { value: new THREE.Color(0x00ff88) },
      uGreen2: { value: new THREE.Color(0x00ffcc) },
      uRedLight: { value: new THREE.Color(0xff00ff) },
      uRedMid: { value: new THREE.Color(0xff0088) },
      uDeepRedLight: { value: new THREE.Color(0x8800ff) },
      uDeepRedDark: { value: new THREE.Color(0x0088ff) },
      uFrame: { value: 0.0 },
      uVatPosTex: { value: vatTexture },
      uFrameCount: { value: VAT_LAST_FRAME + 1.0 },
      uUseVAT: { value: vatTexture ? 1.0 : 0.0 },
      uRoseType: { value: 1.0 },
      uTime: { value: 0.0 }
    },
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform float uFrame;
      uniform sampler2D uVatPosTex;
      uniform float uFrameCount;
      uniform float uUseVAT;
      attribute vec2 uv2;

      void main() {
        vUv = uv;
        vec3 pos = position;
        if (uUseVAT > 0.5) {
          float u = clamp(uFrame, 0.0, uFrameCount - 1.0) / uFrameCount;
          float v = uv2.y;
          pos = texture2D(uVatPosTex, vec2(u, v)).rgb;
        }
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform vec3 uGreen1, uGreen2, uRedLight, uRedMid, uDeepRedLight, uDeepRedDark;
      uniform float uRoseType;
      void main() {
        vec3 color;
        if (uRoseType < 1.5) color = mix(uGreen1, uGreen2, vUv.y);
        else if (uRoseType < 2.5) color = mix(uRedMid, uRedLight, vUv.y);
        else color = mix(uDeepRedDark, uDeepRedLight, vUv.y);
        
        vec3 normal = normalize(vNormal);
        float diff = max(dot(normal, vec3(0.7, 1.0, 0.3)), 0.3);
        gl_FragColor = vec4(color * diff, 1.0);
      }
    `
  });
};

export const RoseHoverScene: React.FC = () => {
  const { scene, camera, raycaster } = useThree();
  const [vatTexture, setVatTexture] = useState<THREE.Texture | null>(null);
  const [roseGeom, setRoseGeom] = useState<THREE.BufferGeometry | null>(null);

  // Refs for high-performance tracking
  const groundRef = useRef<THREE.Mesh>(null!);
  const cursorRef = useRef<THREE.Mesh>(null!);
  const activeZonesRef = useRef<RoseZone[]>([]);
  const hoverTimerRef = useRef(0);
  const mousePosRef = useRef(new THREE.Vector3());
  const isOverGroundRef = useRef(false);

  // Load Assets
  const { nodes } = useGLTF('/models/Rose.glb');

  useEffect(() => {
    new EXRLoader().load('/textures/Rose_pos.exr', (tex) => {
      tex.minFilter = tex.magFilter = THREE.NearestFilter;
      setVatTexture(tex);
    });

    // Extract and setup Geometry
    Object.values(nodes).forEach((node: any) => {
      if (node.isMesh && !roseGeom) {
        const geom = node.geometry.clone();
        const vCount = geom.attributes.position.count;
        const uv2 = new Float32Array(vCount * 2);
        for (let i = 0; i < vCount; i++) {
          uv2[i * 2] = 0;
          uv2[i * 2 + 1] = i / (vCount - 1); // Dynamic normalization
        }
        geom.setAttribute('uv2', new THREE.BufferAttribute(uv2, 2));
        setRoseGeom(geom);
      }
    });
  }, [nodes]);

  const spawnZone = (pos: THREE.Vector3) => {
    if (!roseGeom || !vatTexture) return;
    
    const roses: RoseData[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.8;
      
      for (let j = 0; j < 3; j++) {
        const mat = createRoseMaterial(vatTexture);
        mat.uniforms.uRoseType.value = j + 1;
        
        const mesh = new THREE.Mesh(roseGeom, mat);
        const scale = 20 + Math.random() * 20;
        mesh.scale.set(scale, scale, scale);
        mesh.position.set(pos.x + Math.cos(angle) * radius, 0, pos.z + Math.sin(angle) * radius);
        
        scene.add(mesh);
        
        roses.push({
          mesh,
          currentFrame: [R1_START, R2_START, R3_START][j],
          startFrame: [R1_START, R2_START, R3_START][j],
          endFrame: [R1_END, R2_END, R3_END][j],
          delay: i * 0.15,
          delayTimer: 0,
          isAnimating: false,
          direction: 1,
          speed: 0.8 + Math.random() * 1.2
        });
      }
    }
    activeZonesRef.current.push({ position: pos.clone(), roses, isActive: true, timeSinceActive: 0 });
  };

  useFrame((state, delta) => {
    // 1. Raycasting
    raycaster.setFromCamera(state.mouse, camera);
    const intersects = raycaster.intersectObject(groundRef.current);
    
    if (intersects.length > 0) {
      isOverGroundRef.current = true;
      mousePosRef.current.copy(intersects[0].point);
      cursorRef.current.position.set(mousePosRef.current.x, 0.05, mousePosRef.current.z);
      cursorRef.current.visible = true;

      // Check for nearby zones to reactivate
      let found = false;
      activeZonesRef.current.forEach(z => {
        if (z.position.distanceTo(mousePosRef.current) < 1.5) {
          z.isActive = true;
          z.timeSinceActive = 0;
          found = true;
        } else {
          z.isActive = false;
        }
      });

      // 2. Hover Spawning Logic
      if (!found) {
        hoverTimerRef.current += delta;
        if (hoverTimerRef.current > HOVER_DELAY) {
          spawnZone(mousePosRef.current);
          hoverTimerRef.current = 0;
        }
      }
    } else {
      cursorRef.current.visible = false;
      isOverGroundRef.current = false;
      activeZonesRef.current.forEach(z => z.isActive = false);
    }

    // 3. Animation Update Loop
    activeZonesRef.current.forEach((zone, zoneIdx) => {
      if (!zone.isActive) zone.timeSinceActive += delta;

      zone.roses.forEach(rose => {
        // State Logic
        if (zone.isActive) rose.direction = 1;
        else if (zone.timeSinceActive > RECEDE_DELAY) rose.direction = -1;
        else rose.direction = 0;

        // Delay Logic
        if (!rose.isAnimating) {
          rose.delayTimer += delta;
          if (rose.delayTimer >= rose.delay) rose.isAnimating = true;
        }

        // Frame update
        if (rose.isAnimating && rose.direction !== 0) {
          rose.currentFrame += rose.speed * rose.direction;
          
          if (rose.direction === 1 && rose.currentFrame >= rose.endFrame) {
            rose.currentFrame = rose.endFrame;
            rose.isAnimating = false;
          } else if (rose.direction === -1 && rose.currentFrame <= rose.startFrame) {
            rose.currentFrame = rose.startFrame;
            rose.isAnimating = false;
          }
          
          (rose.mesh.material as THREE.ShaderMaterial).uniforms.uFrame.value = rose.currentFrame;
        }
      });
    });

    // 4. Cleanup
    for (let i = activeZonesRef.current.length - 1; i >= 0; i--) {
      const zone = activeZonesRef.current[i];
      if (!zone.isActive && zone.roses.every(r => r.currentFrame <= r.startFrame)) {
        zone.roses.forEach(r => scene.remove(r.mesh));
        activeZonesRef.current.splice(i, 1);
      }
    }
  });

  return (
    <>
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0a0520" emissive="#110033" />
      </mesh>

      <mesh ref={cursorRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <circleGeometry args={[1.5, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
      </mesh>
    </>
  );
};