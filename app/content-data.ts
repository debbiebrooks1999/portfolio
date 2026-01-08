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

/* ---------- Archive / Portfolio Projects ---------- */

export type Complexity = "low" | "medium" | "high"

export type Project = {
  id: string
  title: string
  year: number
  thumbnail?: string
  tags?: string[]
  description?: string
  techStack?: string[]
  client?: string
  agency?: string
  era?: "current" | "recent" | "legacy"
  complexity?: Complexity
  featured?: boolean
  link?: string
  video?: string
  images?: string[]
  qrCode?: string
}

/**
 * IMPORTANT:
 * - Keep paths consistent (prefer "/archive/..." & "/qr/..." instead of "./archive/...")
 * - Empty string counts as "no data". Use "" only if you really want the UI to hide it.
 */
export const PROJECTS: Project[] = [
  // === CURRENT ERA (2023-2025) ===
  {
    id: "volvo-vr-experience",
    title: "Volvo VR Showroom",
    year: 2025,
    thumbnail: "/archive/volvo.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description:
      "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    agency: "NDA",
    era: "current",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "dreamwheel-ar-portal",
    title: "New York Dreamwheel AR Tourism",
    year: 2025,
    thumbnail: "/archive/NJLoading.png",
    video: "/archive/dreamwheel.mp4",
    qrCode: "/qr/NJ_Dream_Wheel-QR_Code.png",
    images:["/archive/NJLoading.png", "/archive/dreamwheel-ar1.png", "/archive/dreamwheel-ar2.png"],
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description:
      "AR/VR experiences for Queenstown tourism with QR code portal system for gondola attractions.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    agency: "Magic Memories",
    era: "current",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "aquarium-ar-kids",
    title: "Aquarium AR Kids Experience",
    year: 2025,
    thumbnail: "/archive/sealifeShark.PNG",
    qrCode: "/qr/dreamwheel-qr.png",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description:
      "AR experiences for various aquarium attractions, animated models, particles and facts overlays with QR code portal system for kids.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    agency: "Magic Memories",
    era: "current",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "national-gallery-sound",
    title: "Sensing The Unseen - National Gallery",
    year: 2020,
    thumbnail: "/archive/icon1.png",
    tags: ["WebXR", "Virtual Tour", "Audio", "Three.js"],
    video: "/archive/NG_Sensing the unseen_cropped.mp4",
    description:
      "Immersive virtual tour experience for the National Gallery London with spatial audio.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Cultural Institution",
    agency: "National Gallery",
    era: "current",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  
  {
    id: "auckland-zoo",
    title: "Auckland Zoo AR Dinosaurs",
    year: 2025,
    thumbnail: "/archive/aucklandZooLogo.png",
    qrCode: "./qr/AZ_Quetzalcoatlus-QR_Code.png",
    video: "./archive/auckland_quetz.mp4",
    tags: [
      "WebAR",
      "Audio",
      "Three.js",
      "Zappar",
      "Mattercraft",
      "Wildlife & Conservation",
    ],
    description:
      "Dinosaur Discovery Track where visitors use phones to access AR dinosaur experiences at 25 animatronic dinosaurs.",
    techStack: ["React", "Three.js", "WebAR", "Zappar"],
    client: "Educational/Zoo",
    agency: "Magic Memories",
    era: "current",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "wash-n-wag",
    title: "Wash N Wag Academy",
    year: 2024,
    thumbnail: "/archive/washnwag.png",
    tags: ["Web Design", "Framer Motion", "React"],
    description:
      "Comprehensive website for dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "google-chromebook",
    title: "Google Chromebook Setup Guide",
    year: 2020,
    thumbnail: "/archive/chromebook.png",
    video: "./archive/chromebook_short.mp4",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Interactive AR setup guide for Google Chromebook devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Technology",
    agency: "Cassette Group",
    era: "current",
    complexity: "high",
    featured: true,
    link: "http://www.web-ar.co.uk/g/index.html",
  },
  {
    id: "publishing-portal",
    title: "AR Publishers Portal",
    year: 2023,
    thumbnail: "/archive/portal.png",
    qrCode: "./qr/AR_Portal_v2-QR_Code.png",
    video: "./archive/portal.mp4",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "Portal-based navigation system for AR publishing experiences.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Publishing",
    agency: "Yondr",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "instagram-mac",
    title: "M·A·C Cosmetics AR Try On",
    year: 2019,
    thumbnail: "/archive/mac.jpg",
    video: "/archive/MacCosmeticsInsta.mp4",
    tags: ["Instagram AR", "Spark AR", "Beauty Tech"],
    description:
      "First Instagram AR direct shopping filter for MAC Cosmetics product try-on.",
    techStack: ["Spark AR", "Instagram API", "AR Effects"],
    client: "Beauty/Retail",
    agency: "The Mill - London",
    era: "current",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "mlso-gift",
    title: "AR Gift Experience",
    year: 2023,
    thumbnail: "/archive/mlso.png",
    qrCode: "./qr/archive-qr.png",
    tags: ["WebAR", "Gifting", "Interactive"],
    description: "Visual Audio synced model AR gift unwrapping experience.",
    techStack: ["Zappar", "Three.js", "WebAR"],
    client: "Retail",
    agency: "Yondr",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "strainge-beast",
    title: "Strainge Beast Interactive",
    year: 2020,
    thumbnail: "/archive/strainge_beast.png",
    video: "./archive/StraingeBeast-SHORT.mp4",
    tags: ["WebGL", "Interactive", "Art"],
    description: "Interactive web experience for Strainge Beast brand.",
    techStack: ["Three.js", "WebGL", "AFrame"],
    client: "Sierra Nevada",
    agency: "Blippar",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "takeda",
    title: "Takeda Pharma Experience",
    year: 2021,
    thumbnail: "/archive/takeda.png",
    video: "./videos/takeda.mp4",
    tags: ["WebGL", "Medical", "PlayCanvas"],
    description: "Interactive pharmaceutical visualization experience.",
    techStack: ["React", "Three.js", "WebGL"],
    client: "Pharmaceutical",
    agency: "Cassette Group",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "intel",
    title: "Intel Interactive Demo",
    year: 2022,
    thumbnail: "/archive/PLayCanvas_Intel.png",
    tags: ["WebGL", "Tech Demo", "3D"],
    description: "Interactive 3D demo for Intel technology showcase.",
    techStack: ["React", "Three.js", "WebGL"],
    client: "Technology",
    agency: "Eyekandy",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "helmet",
    title: "3D Helmet Configurator",
    year: 2024,
    thumbnail: "/archive/helmet.jpg",
    video: "/archive/helmet_effect capture 2.mov",
    tags: ["WebGL", "3D", "E-commerce"],
    description: "3D product configurator for helmet customization.",
    techStack: ["Three.js", "React", "GLTF"],
    client: "Retail",
    agency: "Blippar",
    era: "current",
    complexity: "medium",
    featured: false,
    link: "",
  },

  // === RECENT ERA (2019-2022) ===
  {
    id: "broadway",
    title: "Broadway Re-Launch",
    year: 2020,
    thumbnail: "/archive/broadway.png",
    video: "/archive/broadway.mp4",
    images: ["/archive/broadway-1.png", "/archive/broadway-2.png"],
    tags: ["WebAR", "8th Wall", "Entertainment"],
    description:
      "AR experience for Broadway show re-launch using 8th Wall technology.",
    techStack: ["8th Wall", "Three.js", "WebAR"],
    client: "Retail",
    agency: "Aircards",
    era: "recent",
    complexity: "medium",
    featured: false,
    link: "https://www.8thwall.com/aircards/broadway",
  },

  // === LEGACY ERA (2008-2018) - Major Brand Work ===
  {
    id: "chevrolet",
    title: "Chevrolet Homepage Experience",
    year: 2017,
    thumbnail: "/archive/chev.jpg",
    tags: ["Flash", "ActionScript", "High-Traffic", "Automotive"],
    description:
      "Lead developer for Chevrolet's flagship homepage, handling millions of monthly visitors with rich interactive Flash experiences.",
    techStack: ["Flash", "ActionScript 3", "XML", "JavaScript"],
    client: "Chevrolet (General Motors)",
    agency: "The Mill - Chicago",
    era: "legacy",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "bicester",
    title: "Bicester Village Shopping Portal",
    year: 2017,
    thumbnail: "/archive/bicester.jpg",
    tags: ["Flash", "Multi-language", "E-commerce", "Luxury"],
    description:
      "Multi-skin, multi-language shopping portal for Bicester Village luxury outlet, featuring three distinct visual themes and comprehensive localization.",
    techStack: ["Flash", "ActionScript 3", "XML", "Multi-language Framework"],
    client: "Bicester Village",
    agency: "Iris",
    era: "legacy",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "BA_T5_yesterday",
    title: "British Airways T5 'Yesterday' - Award Winner",
    year: 2008,
    thumbnail: "/archive/BA_T5_yesterday.png",
    tags: ["Flash", "Award-Winning", "Campaign", "Travel"],
    description:
      "Award-winning interactive experience for British Airways Terminal 5 opening, celebrating the history of flight with 'Yesterday' by The Beatles.",
    techStack: ["Flash", "ActionScript 3", "Audio Synchronization"],
    client: "British Airways",
    agency: "Agency.com",
    era: "legacy",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "canon",
    title: "Canon Interactive Kiosk - Paris Event",
    year: 2010,
    thumbnail: "/archive/canonTouchScreen.png",
    tags: ["Flash", "Touch Screen", "Kiosk", "Event"],
    description:
      "Large-scale touch screen kiosk experience for Canon at major Paris Canon Expo event",
    techStack: [
      "Flash",
      "ActionScript 3",
      "Touch Interface",
      "Kiosk Framework",
    ],
    client: "Canon",
    agency: "Tequila",
    era: "legacy",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "butlin",
    title: "Butlins Complete Rebrand",
    year: 2010,
    thumbnail: "/archive/butlins.jpg",
    tags: ["Flash", "Rebrand", "Entertainment", "Family"],
    description:
      "Comprehensive digital rebrand for Butlins holiday resorts, modernizing the family entertainment brand for the digital age.",
    techStack: ["Jade", "Javascript", "Modular"],
    client: "Butlins",
    agency: "Grand Union",
    era: "legacy",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "ogilvy",
    title: "Ogilvy Fellowship WordPress Portal",
    year: 2010,
    thumbnail: "/archive/OgilvyFellowshipWP.png",
    tags: ["WordPress", "PHP", "Custom Theme"],
    description:
      "Custom WordPress portal for Ogilvy Fellowship program, managing applications and showcasing fellow work.",
    techStack: ["WordPress", "PHP", "MySQL", "Custom Theme Development"],
    client: "Ogilvy & Mather",
    agency: "Ogilvy & Mather",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "mercedes",
    title: "Mercedes-Benz 'Tweet Race'",
    year: 2011,
    thumbnail: "/archive/mercedes.png",
    tags: ["Flash", "Social Media", "Real-time", "Automotive"],
    description:
      "Innovative social media campaign where Twitter interactions powered animated Mercedes vehicles on a virtual racetrack in real-time.",
    techStack: ["Javascript", "Twitter API", "Real-time Animation"],
    client: "Mercedes-Benz",
    agency: "Razorfish",
    era: "legacy",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "mercedes-fleet",
    title: "Mercedes Fleet Digital Magazine",
    year: 2013,
    thumbnail: "/archive/mercedes-fleet.jpg",
    tags: ["Flash", "Publishing", "Interactive Magazine"],
    description:
      "Interactive digital magazine for Mercedes fleet services, featuring rich media content and engaging page-flip animations.",
    techStack: ["Flash", "ActionScript 3", "Page Flip Engine"],
    client: "Mercedes-Benz",
    agency: "MRM-Meteorite",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "BA-caribbean",
    title: "British Airways Caribbean Campaign",
    year: 2012,
    thumbnail: "/archive/BA_carib.png",
    tags: ["Flash", "Campaign", "Travel", "Interactive"],
    description:
      "Rich interactive campaign for British Airways Caribbean routes, featuring destination exploration and booking integration.",
    techStack: ["Flash", "ActionScript 3", "Video Integration"],
    client: "British Airways",
    agency: "Agency.com & TBWA/ London",
    era: "legacy",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "apple-itune",
    title: "Apple iTunes - Leona Lewis Campaign",
    year: 2011,
    thumbnail: "/archive/leona.png",
    tags: ["Flash", "Music", "Campaign", "High-Profile"],
    description:
      "iTunes promotional campaign for Leona Lewis album launch, featuring interactive music visualization.",
    techStack: ["Flash", "ActionScript 3", "Audio Visualization"],
    client: "Apple",
    agency: "TBWA\\ Media Arts Lab",
    era: "legacy",
    complexity: "medium",
    featured: true,
    link: "",
  },
  {
    id: "apple-nano",
    title: "Apple iPod Nano Launch Campaign",
    year: 2011,
    thumbnail: "/archive/nano.png",
    tags: ["Flash", "Banner", "Product Launch", "High-Traffic"],
    description:
      "High-impact banner campaign for iPod Nano launch using custom JLSX banner engine for dynamic creative.",
    techStack: ["Flash", "ActionScript 3", "JLSX Banner Engine"],
    client: "Apple",
    agency: "TBWA\\ Media Arts Lab",
    era: "legacy",
    complexity: "medium",
    featured: true,
    link: "",
  },
  {
    id: "harley-davidson",
    title: "Harley Davidson Arabic Website",
    year: 2014,
    thumbnail: "/archive/HD.jpg",
    tags: ["Flash", "RTL", "Localization", "Automotive"],
    description:
      "Complete Arabic website for Harley Davidson, featuring right-to-left layout and culturally adapted content for Middle Eastern markets.",
    techStack: ["Flash", "ActionScript 3", "RTL Layout", "Arabic Typography"],
    client: "Harley-Davidson",
    agency: "Sapient Nitro",
    era: "legacy",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "sky",
    title: "Sky Go Interactive Experience",
    year: 2016,
    thumbnail: "/archive/sky.jpg",
    tags: ["Flash", "ActionScript", "Streaming", "Interactive"],
    description:
      "Interactive promotional experience for Sky Go streaming service, showcasing on-demand content capabilities.",
    techStack: ["Flash", "ActionScript 3", "Video Streaming"],
    client: "Sky",
    agency: "Brothers & Sisters Creative Ltd",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "BA-fisher",
    title: "British Airways Audio Experience",
    year: 2010,
    thumbnail: "/archive/BA_Fisher.png",
    tags: ["Flash", "Audio", "Interactive"],
    description:
      "Audio-driven interactive experience for British Airways, featuring dynamic soundscapes and musical elements.",
    techStack: ["Flash", "ActionScript 3", "Audio API"],
    client: "British Airways",
    agency: "Agency.com & TBWA/ London",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "nike",
    title: "Nike Banner Campaign",
    year: 2010,
    thumbnail: "/archive/nike.png",
    tags: ["Flash", "Banner", "Sports", "High-Impact"],
    description:
      "High-impact display banner campaign for Nike, featuring dynamic animations and product showcases.",
    techStack: ["Flash", "ActionScript 3", "Banner Framework"],
    client: "Nike",
    agency: "Agency.com & TBWA/ London",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "ITV-broadband",
    title: "ITV Homepage Takeover - BT Broadband",
    year: 2009,
    thumbnail: "/archive/BT_Broadband.png",
    tags: ["Flash", "Homepage Takeover", "High-Traffic", "Telecoms"],
    description:
      "Major homepage takeover for ITV.com promoting BT Broadband, handling massive concurrent traffic with rich interactive elements.",
    techStack: ["Flash", "ActionScript 3", "High-Performance"],
    client: "BT / ITV",
    agency: "Agency.com & TBWA/ London",
    era: "legacy",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "BA-facebook",
    title: "British Airways Height Cuisine Facebook App",
    year: 2010,
    thumbnail: "/archive/BA_HeightCuisine.png",
    tags: ["Flash", "Facebook", "Social Media", "Food"],
    description:
      "Facebook application for British Airways 'Height Cuisine' campaign, engaging users with in-flight dining experiences.",
    techStack: ["Flash", "ActionScript 3", "Facebook API"],
    client: "British Airways",
    agency: "Agency.com & TBWA/ London",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "sky-store",
    title: "Sky Store Interactive Card Game",
    year: 2017,
    thumbnail: "/archive/sky_store.jpg",
    tags: ["JavaScript", "Interactive", "Entertainment", "Gaming"],
    description:
      "Interactive card game experience for Sky Store, driving user engagement with Sky's digital entertainment platform.",
    techStack: ["JavaScript", "Canvas API", "CSS3"],
    client: "Sky",
    agency: "Brothers & Sisters Creative Ltd",
    era: "legacy",
    complexity: "medium",
    featured: false,
    link: "",
  },

]

/* ---------- Configuration Constants ---------- */

export const INTRO_SECONDS = 15

export const CAMERA_CONFIG = {
  INTRO_SCENE_DELAY: 1000,
  INTRO_DURATION: 10.0,
  INTRO_START_Z: -50,
  INTRO_TARGET_Z: 3,
  INTRO_TARGET_Z_MOBILE: 4,
  INTRO_START_Y: 35,
  INTRO_TARGET_Y: 0,
  ROTATION_AMOUNT: 0.05,
  LERP_FACTOR: 0.05,
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
  { src: "/videos/music1.mp4", title: "remedies to overcrowding" },
  { src: "/videos/music2.mp4", title: "happiness with william" },
  { src: "/videos/music3.mp4", title: "rabid" },
  { src: "/videos/music4.mp4", title: "rickie loves ditches"},
  { src: "/videos/music5.mp4", title: "remedies to overcrowding" },
  { src: "/videos/music6.mp4", title: "esu as an agent of hermeneutics" },
]

/* ---------- Art Slides ---------- */

// export const artSlides: ArtSlide[] = [
//   {
//     id: 0,
//     headline: "National Gallery - Sensing The Unseen",
//     subline: "Exploring the intersection of technology and creativity",
//     layout: "triple",
//     image1Src: "/guardian.png",
//     image1Alt: "Graffiti wall – AR demo",
//     image2Src: "/city-alt.png",
//     image2Alt: "Urban environment concept",
//     videoSrc: "/archive/art-process.mp4",
//     title: "National Gallery - Sensing The Unseen",
//     body: "An immersive AR experience bringing art to life through interactive technology and creative exploration.",
//   },
//   {
//     id: 1,
//     headline: "Crypic Nights",
//     subline: "Behind the scenes of digital creation",
//     layout: "facebook",
//     heroSrc: "/city-alt.png",
//     heroAlt: "Concept sketches and stills",
//     facebookSrc:
//       "https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Fdebbie.brooks.3367%2Fvideos%2F10157338752441791%2F&show_text=false&width=267&t=0",
//     title: "Process & Concept Sketches",
//     body: "Behind-the-scenes look at motion studies, concept art, and shader explorations that informed the final work.",
//   },
// ]

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