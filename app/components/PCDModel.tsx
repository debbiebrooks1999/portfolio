"use client";

import React, { useEffect } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { PCDLoader } from "three/examples/jsm/loaders/PCDLoader.js";

interface PCDModelProps {
  /** Path to the .pcd file, e.g. "/pcd/girl.pcd" */
  url: string;
  /** Size of each point in world units */
  pointSize?: number;
  /** Override color if the PCD has no colors */
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const PCDModel: React.FC<PCDModelProps> = ({
  url,
  pointSize = 0.01,
  color = "#ccd5ff",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const points = useLoader(
    PCDLoader,
    url
  ) as THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

  useEffect(() => {
  if (!points) return;

  const mat = points.material as THREE.PointsMaterial;
  mat.size = pointSize;
  mat.sizeAttenuation = true;
  mat.transparent = true;
  mat.depthWrite = false;
  if (color) {
    mat.color = new THREE.Color(color);
  }

  // ✅ Center the GEOMETRY, not the object position
  points.geometry.computeBoundingBox();
  const box = points.geometry.boundingBox;
  if (box) {
    const center = new THREE.Vector3();
    box.getCenter(center);
    points.geometry.translate(-center.x, -center.y, -center.z);
  }

  // Make sure the object itself sits at local (0,0,0)
  points.position.set(0, 0, 0);
}, [points, pointSize, color]);

  return (
    <primitive
      object={points}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
};