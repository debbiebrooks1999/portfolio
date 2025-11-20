import React, { useEffect, useRef } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function CityModel(props: any) {
  const group = useRef();
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

// Optional: preloading improves performance
useGLTF.preload("/models/city_v2.glb");