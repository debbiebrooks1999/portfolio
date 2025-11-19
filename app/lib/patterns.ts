import * as THREE from 'three';

export const sections = [
  {
    name: 'Showreel',
    text: 'This is placeholder content for the Cosmic Sphere section. Replace with your marketing copy, CTAs, or anything you like.',
    videoSrc: '/videos/video.mp4',
    poster: '/',
  },
  {
    name: 'Art',
    text: 'This section could describe the Spiral Nebula. Add unique text or visuals here.',
    videoSrc: '/videos/video.mp4',
    poster: '/',
  },
  {
    name: 'Music',
    text: 'Content for Quantum Helix. Explain features, benefits, or storytelling.',
    videoSrc: '/videos/video.mp4',
    poster: '/',
  },
  {
    name: 'About',
    text: 'Stardust Grid placeholder. Replace with something compelling for your site.',
    videoSrc: '/videos/video.mp4',
    poster: '/',
  },
  {
    name: 'Work',
    text: 'Celestial Torus section content goes here. Each section can have unique text.',
    videoSrc: '/videos/video.mp4',
    poster: '/',
  },
];

export const patternNames = sections.map((s) => s.name);

export const particleCount = 500;

// Scale factor for all patterns - increase this to make patterns bigger
const SCALE = 50; // Changed from 30 to 50 (about 67% larger)

/** Fibonacci sphere */
export function createSphere(i: number, count: number) {
  const t = i / count;
  const phi = Math.acos(2 * t - 1);
  const theta = 2 * Math.PI * (i / count) * Math.sqrt(count);
  return new THREE.Vector3(
    Math.sin(phi) * Math.cos(theta) * SCALE,
    Math.sin(phi) * Math.sin(theta) * SCALE,
    Math.cos(phi) * SCALE
  );
}

export function createSpiral(i: number, count: number) {
  const t = i / count;
  const numArms = 3;
  const armIndex = i % numArms;
  const angleOffset = (2 * Math.PI / numArms) * armIndex;
  const angle = Math.pow(t, 0.7) * 15 + angleOffset;
  const radius = t * (SCALE * 1.33); // 40 scaled proportionally
  const height = Math.sin(t * Math.PI * 2) * (SCALE / 6); // 5 scaled
  return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, height);
}

export function createGrid(i: number, count: number) {
  const sideLength = Math.ceil(Math.cbrt(count));
  const spacing = (SCALE * 2) / sideLength; // 60 scaled
  const halfGrid = ((sideLength - 1) * spacing) / 2;
  const iz = Math.floor(i / (sideLength * sideLength));
  const iy = Math.floor((i % (sideLength * sideLength)) / sideLength);
  const ix = i % sideLength;

  if (
    ix === Math.floor(sideLength / 2) &&
    iy === Math.floor(sideLength / 2) &&
    iz === Math.floor(sideLength / 2) &&
    sideLength % 2 !== 0
  ) {
    return new THREE.Vector3(spacing * 0.1, spacing * 0.1, spacing * 0.1);
  }

  return new THREE.Vector3(
    ix * spacing - halfGrid,
    iy * spacing - halfGrid,
    iz * spacing - halfGrid
  );
}

export function createHelix(i: number, count: number) {
  const numHelices = 2;
  const helixIndex = i % numHelices;
  const t = Math.floor(i / numHelices) / Math.floor(count / numHelices);
  const angle = t * Math.PI * 10;
  const radius = SCALE / 2; // 15 scaled
  const height = (t - 0.5) * (SCALE * 2); // 60 scaled
  const angleOffset = helixIndex * Math.PI;
  return new THREE.Vector3(
    Math.cos(angle + angleOffset) * radius,
    Math.sin(angle + angleOffset) * radius,
    height
  );
}

export function createTorus(i: number, count: number) {
  const R = SCALE * 1.33; // 40 scaled
  const r0 = SCALE / 3; // 10 scaled
  const phi = (1 + Math.sqrt(5)) / 2;

  const angle1 = 2 * Math.PI * ((((i / count) + i * (phi - 1)) % 1 + 1) % 1);
  const angle2 = 2 * Math.PI * ((((i / count) + i * (phi * 0.5)) % 1 + 1) % 1);

  const r = r0 * (0.5 + 0.5 * Math.sin(2 * Math.PI * (i / count)));

  return new THREE.Vector3(
    (R + r * Math.cos(angle2)) * Math.cos(angle1),
    (R + r * Math.cos(angle2)) * Math.sin(angle1),
    r * Math.sin(angle2)
  );
}

export const patterns = [createSphere, createSpiral, createHelix, createGrid, createTorus];

export const colorPalettes = [
  [new THREE.Color(0x000000), new THREE.Color(0x00aaff), new THREE.Color(0x44ccff), new THREE.Color(0x0055cc)],
  [new THREE.Color(0x8800cc), new THREE.Color(0xcc00ff), new THREE.Color(0x660099), new THREE.Color(0xaa33ff)],
  [new THREE.Color(0x00cc66), new THREE.Color(0x33ff99), new THREE.Color(0x99ff66), new THREE.Color(0x008844)],
  [new THREE.Color(0xff9900), new THREE.Color(0xffcc33), new THREE.Color(0xff6600), new THREE.Color(0xffaa55)],
  [new THREE.Color(0xff3399), new THREE.Color(0xff66aa), new THREE.Color(0xff0066), new THREE.Color(0xcc0055)],
];