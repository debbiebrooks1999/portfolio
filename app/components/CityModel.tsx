import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export default function ModelLoader(props: any) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("./models/city_v2.glb");
  const { actions } = useAnimations(animations, group);
  const { object, ...rest } = props;

  useEffect(() => {
    // Play the first (and only) animation
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = actions[Object.keys(actions)[0]];
      if (firstAction) {
        firstAction.reset().play();
        firstAction.setLoop(2201, Infinity); // LoopRepeat, infinite
      }
    }
  }, [actions]);

  return <primitive ref={group} object={scene} {...rest} />;
}

//preloading improves performance
useGLTF.preload("/models/city_v2.glb");