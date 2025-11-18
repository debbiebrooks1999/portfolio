// components/CanvasBackground_v1.tsx
'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { colorPalettes, particleCount, patterns } from '../lib/patterns';

type Props = { activeIndex: number };

/* ----------------------- Config ----------------------- */
const CAMERA_Z = 80;

// BufferGeometry that stores our currentColors snapshot in userData
type ColorGeometry = THREE.BufferGeometry & {
  userData: { currentColors?: Float32Array };
};

function Particles({ activeIndex }: Props) {
  const geomRef = useRef<THREE.BufferGeometry>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const { size, camera } = useThree();

  // Initial attribute buffers (built once)
  const initialData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const indices = new Float32Array(particleCount);
    const particleTypes = new Float32Array(particleCount);

    const initPattern = patterns[0];
    const palette = colorPalettes[0];

    for (let i = 0; i < particleCount; i++) {
      indices[i] = i;
      particleTypes[i] = Math.floor(Math.random() * 3);

      const p = initPattern(i, particleCount);
      positions[i * 3 + 0] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;

      const base = palette[Math.floor(Math.random() * palette.length)];
      const final = base.clone().multiplyScalar(0.85 + Math.random() * 0.3);
      colors[i * 3 + 0] = final.r;
      colors[i * 3 + 1] = final.g;
      colors[i * 3 + 2] = final.b;

      sizes[i] = 1.0 + Math.random() * 1.5;
    }

    return { positions, colors, sizes, indices, particleTypes };
  }, []);

  // Custom shader (matching working version)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mousePos: { value: new THREE.Vector3(10000, 10000, 0) },
        },
        vertexShader: `
          uniform float time; uniform vec3 mousePos;
          attribute float size; attribute float index; attribute float particleType;
          varying vec3 vColor; varying float vDistanceToMouse; varying float vType; varying float vIndex;
          float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
          void main(){
            vColor = color; vType = particleType; vIndex = index; vec3 pos = position;
            float T = time * 0.5; float idx = index * 0.01;
            float nf1 = sin(idx * 30.0 + T * 15.0) * 0.4 + 0.6;
            vec3 o1 = vec3( cos(T*1.2 + idx*5.0)*nf1, sin(T*0.9 + idx*6.0)*nf1, cos(T*1.1 + idx*7.0)*nf1 ) * 0.4;
            float nf2 = rand(vec2(idx, idx*0.5)) * 0.5 + 0.5; float sf = 0.3;
            vec3 o2 = vec3( sin(T*sf*1.3 + idx*1.1)*nf2, cos(T*sf*1.7 + idx*1.2)*nf2, sin(T*sf*1.1 + idx*1.3)*nf2 ) * 0.8;
            pos += o1 + o2;
            vec3 toMouse = mousePos - pos; float dist = length(toMouse);
            vDistanceToMouse = 0.0; float R = 30.0; float F = 5.0;
            if(dist < R){ float inf = smoothstep(R, F, dist); vec3 repel = normalize(pos - mousePos); pos += repel * inf * 15.0; vDistanceToMouse = inf; }
            vec4 mv = modelViewMatrix * vec4(pos, 1.0); gl_Position = projectionMatrix * mv;
            float pf = 700.0 / -mv.z; gl_PointSize = size * pf * (1.0 + vDistanceToMouse * 0.5);
          }
        `,
        fragmentShader: `
          uniform float time; varying vec3 vColor; varying float vDistanceToMouse; varying float vType; varying float vIndex;
          vec3 rgb2hsl(vec3 c){ vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0); vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g)); vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r)); float d=q.x-min(q.w,q.y); float e=1.0e-10; return vec3(abs(q.z+(q.w-q.y)/(6.0*d+e)), d/(q.x+e), q.x); }
          vec3 hsl2rgb(vec3 c){ vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0); vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www); return c.z * mix(K.xxx, clamp(p-K.xxx,0.0,1.0), c.y); }
          void main(){
            vec2 uv = gl_PointCoord * 2.0 - 1.0; float d = length(uv); if(d>1.0){ discard; }
            float alpha = 0.0; vec3 baseColor = vColor; vec3 hsl = rgb2hsl(baseColor);
            float hueShift = sin(time * 0.05 + vIndex * 0.001) * 0.02; hsl.x = fract(hsl.x + hueShift);
            baseColor = hsl2rgb(hsl); vec3 finalColor = baseColor;
            if(vType < 0.5){ float core=smoothstep(0.2,0.15,d)*0.9; float glow=pow(max(0.0,1.0-d),3.0)*0.5; alpha = core + glow; }
            else if(vType < 1.5){ float w=0.1; float c=0.65; float ring=exp(-pow(d-c,2.0)/(2.0*w*w)); alpha = smoothstep(0.1,0.5,ring)*0.8; alpha += smoothstep(0.3,0.0,d)*0.1; }
            else { float pulse=sin(d*5.0 - time*2.0 + vIndex*0.1)*0.1 + 0.9; alpha = pow(max(0.0,1.0-d),2.5)*pulse*0.9; }
            finalColor = mix(finalColor, finalColor * 1.3 + 0.1, vDistanceToMouse * 1.0); alpha *= 0.9; alpha = clamp(alpha,0.0,1.0);
            gl_FragColor = vec4(finalColor * alpha, alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      }),
    []
  );

  // Mount geometry + attributes once
  useEffect(() => {
    const g = geomRef.current as ColorGeometry;
    const { positions, colors, sizes, indices, particleTypes } = initialData;

    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    g.setAttribute('index', new THREE.BufferAttribute(indices, 1));
    g.setAttribute('particleType', new THREE.BufferAttribute(particleTypes, 1));

    g.userData.currentColors = new Float32Array(colors);
  }, [initialData]);

  // Mouse handling → normalized device coords
  const ndcMouse = useRef(new THREE.Vector2(10000, 10000));
  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      const t = (e as TouchEvent).touches?.[0];
      const clientX = t ? t.clientX : (e as MouseEvent).clientX;
      const clientY = t ? t.clientY : (e as MouseEvent).clientY;
      ndcMouse.current.x = (clientX / size.width) * 2 - 1;
      ndcMouse.current.y = -(clientY / size.height) * 2 + 1;
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, [size.width, size.height]);

  // Transition buffers
  const transitionRef = useRef<{
    fromPos: Float32Array;
    toPos: Float32Array;
    fromCol: Float32Array;
    toCol: Float32Array;
    t: number;
  } | null>(null);

  // When section changes → compute new target positions/colors
  useEffect(() => {
    const g = geomRef.current as ColorGeometry;
    const currentPos = g.getAttribute('position').array as Float32Array;
    const currentCol =
      (g.userData.currentColors as Float32Array | undefined) ??
      (g.getAttribute('color').array as Float32Array);

    const newPos = new Float32Array(currentPos.length);
    const fn = patterns[activeIndex];
    for (let i = 0; i < particleCount; i++) {
      const p = fn(i, particleCount);
      const k = i * 3;
      newPos[k + 0] = p.x;
      newPos[k + 1] = p.y;
      newPos[k + 2] = p.z;
    }

    const newCol = new Float32Array(currentCol.length);
    const palette = colorPalettes[activeIndex];
    for (let i = 0; i < particleCount; i++) {
      const base = palette[Math.floor(Math.random() * palette.length)];
      const final = base.clone().multiplyScalar(0.85 + Math.random() * 0.3);
      const k = i * 3;
      newCol[k + 0] = final.r;
      newCol[k + 1] = final.g;
      newCol[k + 2] = final.b;
    }

    transitionRef.current = {
      fromPos: new Float32Array(currentPos),
      toPos: newPos,
      fromCol: new Float32Array(currentCol),
      toCol: newCol,
      t: 0,
    };
  }, [activeIndex]);

  // Cached helpers for each frame
  const raycasterRef = useRef(new THREE.Raycaster());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const hitRef = useRef(new THREE.Vector3());
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!geomRef.current || !matRef.current) return;

    // advance time
    timeRef.current += delta;
    matRef.current.uniforms.time.value = timeRef.current;

    // mouse → world position on z=0 plane
    const rc = raycasterRef.current;
    const plane = planeRef.current;
    const hit = hitRef.current;
    rc.setFromCamera(ndcMouse.current, camera);
    if (rc.ray.intersectPlane(plane, hit)) {
      matRef.current.uniforms.mousePos.value.lerp(hit, 0.15);
    }

    // handle transitions
    const tr = transitionRef.current;
    if (tr) {
      tr.t = Math.min(1, tr.t + 0.01);
      const ease = tr.t < 0.5 ? 4 * tr.t * tr.t * tr.t : 1 - Math.pow(-2 * tr.t + 2, 3) / 2;

      const g = geomRef.current as ColorGeometry;
      const P = g.getAttribute('position').array as Float32Array;
      const C = g.getAttribute('color').array as Float32Array;

      for (let i = 0; i < P.length / 3; i++) {
        const k = i * 3;
        P[k + 0] = tr.fromPos[k + 0] * (1 - ease) + tr.toPos[k + 0] * ease;
        P[k + 1] = tr.fromPos[k + 1] * (1 - ease) + tr.toPos[k + 1] * ease;
        P[k + 2] = tr.fromPos[k + 2] * (1 - ease) + tr.toPos[k + 2] * ease;

        C[k + 0] = tr.fromCol[k + 0] * (1 - ease) + tr.toCol[k + 0] * ease;
        C[k + 1] = tr.fromCol[k + 1] * (1 - ease) + tr.toCol[k + 1] * ease;
        C[k + 2] = tr.fromCol[k + 2] * (1 - ease) + tr.toCol[k + 2] * ease;
      }
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
      g.userData.currentColors = new Float32Array(C);

      if (tr.t >= 1) transitionRef.current = null;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geomRef} />
      <primitive object={material} ref={matRef} attach="material" />
    </points>
  );
}

export default function CanvasBackground({ activeIndex }: Props) {
  return (
    <div
      className="canvas-bg"
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <Canvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        dpr={[1, 2]}
        camera={{ fov: 65, near: 0.1, far: 600, position: [0, 0, CAMERA_Z] }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        }}
      >
        <Particles activeIndex={activeIndex} />
      </Canvas>
    </div>
  );
}