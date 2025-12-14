import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ============================================================================
// LOTUS LEAF SUBTLE SHADER MATERIAL
// ============================================================================

interface LotusLeafMaterialProps {
  time: number;
}

export const LotusLeafSubtleMaterial: React.FC<LotusLeafMaterialProps> = ({ time }) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color(0x00ff88) },
      uScanlineColor: { value: new THREE.Color(0x00ffff) }
    }),
    []
  );

  useFrame(() => {
    uniforms.uTime.value = time;
  });

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uScanlineColor;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vec3 baseColor = uColor;
          
          // Subtle scanline effect
          float scanline = sin(vPosition.y * 15.0 + uTime * 1.5) * 0.5 + 0.5;
          scanline = smoothstep(0.45, 0.55, scanline);
          
          // Subtle grid pattern
          float grid = step(0.98, fract(vUv.x * 8.0)) + step(0.98, fract(vUv.y * 8.0));
          grid = clamp(grid, 0.0, 1.0);
          
          // Subtle pulse
          float pulse = sin(uTime * 1.0 + vPosition.x * 1.0) * 0.1 + 0.95;
          
          // Combine effects
          vec3 scanlineColor = mix(baseColor, uScanlineColor, scanline * 0.08);
          vec3 finalColor = mix(scanlineColor, uScanlineColor * 1.2, grid * 0.15);
          finalColor *= pulse;
          
          // Basic lighting
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(normal, lightDir), 0.0) * 0.5 + 0.5;
          finalColor *= diff;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
      side={THREE.DoubleSide}
    />
  );
};

// ============================================================================
// LOTUS FLOWER CYBERPUNK SHADER MATERIAL
// ============================================================================

interface LotusCyberpunkMaterialProps {
  time: number;
}

export const LotusCyberpunkMaterial: React.FC<LotusCyberpunkMaterialProps> = ({ time }) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uColor: { value: new THREE.Color(0xff00ff) },
      uScanlineColor: { value: new THREE.Color(0x00ffff) },
      uWireframeColor: { value: new THREE.Color(0xff00ff) }
    }),
    []
  );

  useFrame(() => {
    uniforms.uTime.value = time;
  });

  return (
    <shaderMaterial
      uniforms={uniforms}
      vertexShader={`
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uScanlineColor;
        uniform vec3 uWireframeColor;
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vec3 baseColor = uColor;
          
          // Scanline effect
          float scanline = sin(vPosition.y * 20.0 + uTime * 3.0) * 0.5 + 0.5;
          scanline = smoothstep(0.4, 0.6, scanline);
          
          // Wireframe edges
          float wireframe = 0.0;
          float edgeWidth = 0.05;
          if (vUv.x < edgeWidth || vUv.x > 1.0 - edgeWidth || 
              vUv.y < edgeWidth || vUv.y > 1.0 - edgeWidth) {
            wireframe = 1.0;
          }
          
          // Grid pattern
          float grid = step(0.95, fract(vUv.x * 10.0)) + step(0.95, fract(vUv.y * 10.0));
          grid = clamp(grid, 0.0, 1.0);
          
          // Pulse effect
          float pulse = sin(uTime * 2.0 + vPosition.x * 2.0) * 0.3 + 0.7;
          
          // Combine effects
          vec3 scanlineColor = mix(baseColor, uScanlineColor, scanline * 0.3);
          vec3 finalColor = mix(scanlineColor, uWireframeColor, wireframe * 0.5);
          finalColor = mix(finalColor, uWireframeColor * 1.5, grid * 0.4);
          finalColor *= pulse;
          
          // Basic lighting
          vec3 normal = normalize(vNormal);
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(normal, lightDir), 0.0) * 0.5 + 0.5;
          finalColor *= diff;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `}
      side={THREE.DoubleSide}
    />
  );
};
