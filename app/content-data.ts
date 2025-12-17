// content-data.ts
// All content, configuration, and data for the portfolio

/* ---------- Types ---------- */

export type MusicVideo = {
  src: string
  title: string
}

export type ArtSlide = {
  id: number
  headline: string
  subline: string
  layout: "triple" | "facebook"
  image1Src?: string
  image1Alt?: string
  image2Src?: string
  image2Alt?: string
  videoSrc?: string
  heroSrc?: string
  heroAlt?: string
  facebookSrc?: string
  title: string
  body: string
}

/* ---------- Configuration Constants ---------- */

export const INTRO_SECONDS = 300

export const CAMERA_CONFIG = {
  INTRO_SCENE_DELAY: 1000, // 1 second delay
  INTRO_DURATION: 10.0, // 10 seconds
  INTRO_START_Z: -50, // Start 50 units back
  INTRO_TARGET_Z: 3, // End at camera position
  INTRO_START_Y: 35, // Start 35 units up
  INTRO_TARGET_Y: 0, // End at camera position
  ROTATION_AMOUNT: 0.05, // ±15 degrees rotation range
  LERP_FACTOR: 0.05, // Camera smoothing factor
}

/* ---------- Color Palettes ---------- */

export const ACCENTS = [
  { a: "#78E8FF", b: "#7C5FF", c: "#FF6BD6" },
  { a: "#00aaff", b: "#44ccff", c: "#0055cc" },
  { a: "#8800cc", b: "#cc00ff", c: "#660099" },
  { a: "#00cc66", b: "#33ff99", c: "#99ff66" },
  { a: "#ff9900", b: "#ffcc33", c: "#ff6600" },
  { a: "#ff3399", b: "#ff66aa", c: "#ff0066" },
]

/* ---------- Music Videos ---------- */

export const musicVideos: MusicVideo[] = [
  {
    src: "/videos/music1.mp4",
    title: "Neon Drift",
  },
  {
    src: "/videos/music2.mp4",
    title: "Rain City Loops",
  },
  {
    src: "/videos/music3.mp4",
    title: "Glitch Bloom",
  },
  {
    src: "/videos/music4.mp4",
    title: "Analog Ghosts",
  },
  {
    src: "/videos/music5.mp4",
    title: "Chromatic Pulse",
  },
  {
    src: "/videos/music6.mp4",
    title: "Midnight Debug",
  },
]

/* ---------- Art Slides ---------- */

export const artSlides: ArtSlide[] = [
  {
    id: 0,
    headline: "National Gallery - Sensing The Unseen",
    subline: "Exploring the intersection of technology and creativity",
    layout: "triple",
    image1Src: "/guardian.png",
    image1Alt: "Graffiti wall – AR demo",
    image2Src: "/city-alt.png",
    image2Alt: "Urban environment concept",
    videoSrc: "/archive/art-process.mp4",
    title: "National Gallery - Sensing The Unseen",
    body: "An immersive AR experience bringing art to life through interactive technology and creative exploration.",
  },
  {
    id: 1,
    headline: "Crypitc ",
    subline: "Behind the scenes of digital creation",
    layout: "facebook",
    heroSrc: "/city-alt.png",
    heroAlt: "Concept sketches and stills",
    facebookSrc:
      "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fdebbie.brooks.3367%2Fvideos%2F10157338752441791%2F&show_text=false&width=267&t=0",
    title: "Process & Concept Sketches",
    body: "Behind-the-scenes look at motion studies, concept art, and shader explorations that informed the final work.",
  },
]

/* ---------- Bio Text ---------- */

export const BIO_TEXT = `> I learned to code BASIC when I was 8 years old. That green phosphor glow and blinking cursor? That's where it all started.

25 years later, I'm still building things that push beyond the ordinary - just with better graphics.

I'm Debbie, a creative technologist based in Liverpool. I specialize in WebGL, Three.js, React, and shader programming to create interactive 3D environments, augmented reality, and virtual reality applications.

My background spans advertising, entertainment, and creative technology. I've delivered for major brands through agencies like The Mill, TBWA, and AKQA. I understand how to balance innovation with usability - bringing both the code skills and creative thinking to make challenging concepts work in the real world.

For larger projects, I work with talented specialists including 3D modelers and developers, allowing me to scale up for comprehensive AR/VR services.

If you're looking for someone who can transform ambitious ideas into polished, innovative web experiences, let's talk.

READY.`

/* ---------- Music Section Content ---------- */

export const MUSIC_CONTENT = {
  title: "debx0x",
  description:
    "debx0x is my personal music project where I handle everything – production, composition, and all visual content including music videos.",
  bandcampUrl:
    "https://bandcamp.com/EmbeddedPlayer/album=3691821394/size=large/bgcol=333333/linkcol=9a64ff/tracklist=false/transparent=true/",
}

/* ---------- Helper Functions ---------- */

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export const generateColorPalettes = (
  sections: string[]
): [string, string, string, string][] => {
  return sections.map((_, idx) => {
    const acc = ACCENTS[idx] ?? ACCENTS[ACCENTS.length - 1]
    const { a, b, c } = acc
    return [a, b, c, b]
  })
}