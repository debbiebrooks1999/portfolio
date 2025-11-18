import React from "react";
import { useGLTF } from "@react-three/drei";

export default function CityModel(props) {
  const { scene } = useGLTF("./models/cyberpunk_city.glb"); // replace with your model path

  return <primitive object={scene} {...props} />;
}

// Optional: preloading improves performance
useGLTF.preload("/models/cyberpunk_city.glb");