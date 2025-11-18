"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import VideoText, { VideoTextHandle } from "./VideoText";

export type ScrambleHandle = {
  scramble: () => void;
  setFont: (url: string) => void;
};


interface ScrambleTextProps {
  text: string;
  fontUrl: string;
  videoUrl: string;
  fontSize?: number;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

const ScrambleText = React.forwardRef<ScrambleHandle, ScrambleTextProps>(
  ({ text, fontUrl, videoUrl, fontSize = 0.5 }, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    const videoTextRef = useRef<VideoTextHandle>(null);
    const [isScrambling, setIsScrambling] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    const scramble = async () => {
      if (isScrambling || !videoTextRef.current) return;
      setIsScrambling(true);
      setIsRotating(true);

      const targetText = text;
      const scrambleSpeed = 50;
      const maxScrambles = 5;
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      const totalLetters = targetText.replace(/\n/g, "").length;

      const setAndSync = (t: string) => {
        videoTextRef.current?.setText(t);
        videoTextRef.current?.sync();
      };

      const scrambleLetter = async (position: number) => {
        for (let i = 0; i < maxScrambles; i++) {
          let displayText = "";
          let charIndex = 0;
          for (let j = 0; j < targetText.length; j++) {
            const ch = targetText[j];
            if (ch === "\n") {
              displayText += "\n";
              continue;
            }
            if (charIndex < position) displayText += ch;
            else if (charIndex === position)
              displayText += CHARS[Math.floor(Math.random() * CHARS.length)];
            else displayText += " ";
            charIndex++;
          }
          setAndSync(displayText);
          await wait(scrambleSpeed);
        }

        // Reveal correct up to current position
        let displayText = "";
        let charIndex = 0;
        for (let j = 0; j < targetText.length; j++) {
          const ch = targetText[j];
          if (ch === "\n") {
            displayText += "\n";
            continue;
          }
          displayText += charIndex <= position ? ch : " ";
          charIndex++;
        }
        setAndSync(displayText);
        await wait(100);
      };

      for (let i = 0; i < totalLetters; i++) {
        await scrambleLetter(i);
      }

      setIsScrambling(false);
      setIsRotating(false);
    };

    React.useImperativeHandle(ref, () => ({ 
      scramble,
      setFont: (url: string) => {
        if (videoTextRef.current) {
          videoTextRef.current.setFont(url);
        }
      }
    }));

    useFrame(() => {
     // if (groupRef.current && isRotating) groupRef.current.rotation.y += 0.02;
    });

    // Keep VideoText's initial content in sync with provided `text`
    useEffect(() => {
      if (videoTextRef.current) {
        videoTextRef.current.setText(text);
        videoTextRef.current.sync();
      }
    }, [text]);

    useEffect(() => {
      const root = groupRef.current
      if (!root) return
      root.traverse((obj: any) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m: THREE.Material & { transparent?: boolean; depthWrite?: boolean }) => {
            m.transparent = true
            m.depthWrite = false               
          })
          obj.renderOrder = 1                 
        }
      })
    }, [])

    return (
      <group ref={groupRef}>
        <VideoText ref={videoTextRef} text={text} fontUrl={fontUrl} videoUrl={videoUrl} fontSize={fontSize} />
      </group>
    );
  }
);

ScrambleText.displayName = "ScrambleText";
export default ScrambleText;