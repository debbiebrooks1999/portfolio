"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Text as TroikaText } from "troika-three-text";

export type VideoTextHandle = {
  setText: (t: string) => void;
  sync: () => void;
  setFont: (url: string) => void;
};

interface VideoTextProps {
  text: string;
  fontUrl: string;
  videoUrl: string;
  fontSize?: number;
  anchorX?: "left" | "center" | "right" | number;
  anchorY?: "top" | "middle" | "bottom" | number;
  letterSpacing?: number;
  lineHeight?: number;
}

const VideoText = React.forwardRef<VideoTextHandle, VideoTextProps>(
  (
    {
      text,
      fontUrl,
      videoUrl,
      fontSize = 0.5,
      anchorX = "center",
      anchorY = "middle",
      letterSpacing = 0.01,
      lineHeight = 0.7,
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const textRef = useRef<TroikaText | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const videoTexRef = useRef<THREE.VideoTexture | null>(null);

    React.useImperativeHandle(ref, () => ({
      setText: (t: string) => {
        if (textRef.current) {
          textRef.current.text = t;
        }
      },
      sync: () => textRef.current?.sync(),
      setFont: (url: string) => {
        if (textRef.current) {
          textRef.current.font = url;
          textRef.current.sync();
        }
      },
    }));

    useEffect(() => {
      if (!groupRef.current) return;

      // Clear any existing text objects
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        groupRef.current.remove(child);
        if ((child as any).dispose) {
          (child as any).dispose();
        }
      }

      // HTMLVideoElement
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      // Best effort autoplay
      video.play().catch(() => {});
      videoRef.current = video;

      // THREE.VideoTexture
      const vTex = new THREE.VideoTexture(video);
      vTex.minFilter = THREE.LinearFilter;
      vTex.magFilter = THREE.LinearFilter;
      vTex.wrapS = THREE.ClampToEdgeWrapping;
      vTex.wrapT = THREE.ClampToEdgeWrapping;
      videoTexRef.current = vTex;

      // Troika Text object
      const t = new TroikaText();
      t.text = text;
      t.font = fontUrl;
      t.fontSize = fontSize;
      t.textAlign = "center";
      t.anchorX = anchorX as any;
      t.anchorY = anchorY as any;
      t.letterSpacing = letterSpacing;
      t.lineHeight = lineHeight;
      t.material = new THREE.MeshBasicMaterial({ map: vTex, side: THREE.DoubleSide });

      groupRef.current.add(t as unknown as THREE.Object3D);
      textRef.current = t;
      t.sync();

      return () => {
        if (groupRef.current) {
          while (groupRef.current.children.length > 0) {
            const child = groupRef.current.children[0];
            groupRef.current.remove(child);
          }
        }
        t.dispose();
        vTex.dispose();
        video.pause();
      };
    }, [text, videoUrl, fontSize, anchorX, anchorY, letterSpacing, lineHeight]);

    return <group ref={groupRef} />;
  }
);

VideoText.displayName = "VideoText";
export default VideoText;