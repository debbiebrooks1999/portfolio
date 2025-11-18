import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

// 1560 × 888
export default function ImageWall({ url, scale = 6, ...props }) {
  const texture = useLoader(TextureLoader, url);

  const aspect = 1560 / 888; // width / height
  const height = 1;          // choose any base height
  const width = aspect * height;

  return (
    <mesh {...props} scale={[scale, scale, scale]}>
      {/* Vertical plane */}
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}