"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Complexity = "low" | "medium" | "high";

interface Project {
  id: string;
  title: string;
  year: number;
  thumbnail: string;
  tags: string[];
  description: string;
  techStack: string[];
  client: string;
  agency?: string;
  era?: "current" | "recent" | "legacy";
  complexity: Complexity;
  featured: boolean;
  link: string;
  video?: string;
  images?: string[];
  qrCode?: string;
}

const PROJECTS: Project[] = [
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
    video: "./archive/dreamwheel.mp4",
    qrCode: "./qr/NJ_Dream_Wheel-QR_Code.png",
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
    qrCode: "./qr/dreamwheel-qr.png",
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
    video: "./archive//NG_Sensing the unseen_cropped.mp4",
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
];

interface ArchivePortalProps {
  activeSection?: number;
}

export default function ArchivePortal({ activeSection }: ArchivePortalProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Close modal when navigating away from this section
  useEffect(() => {
    if (activeSection !== undefined && selectedProject) {
      // Close the modal when the section changes
      setSelectedProject(null);
    }
  }, [activeSection]); // Only depend on activeSection, not selectedProject

  // Prevent background scroll when modal open
  useEffect(() => {
    if (!selectedProject) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selectedProject]);

  // Helps when parent sections/page have wheel/touch handlers that hijack scrolling.
  const onWheelCapture: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

    // If we can scroll in this direction inside the grid, keep the event here.
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.stopPropagation();
    }
  };

  const onTouchMoveCapture: React.TouchEventHandler<HTMLDivElement> = (e) => {
    // Stop parent swipe/scroll systems hijacking touch scrolling.
    e.stopPropagation();
  };

  const allTags = useMemo(
    () => Array.from(new Set(PROJECTS.flatMap((p) => p.tags))).sort(),
    []
  );

  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((project) => {
      // Era-based filtering
      if (activeFilter === "current") {
        const matchesEra = project.era === "current" || project.year >= 2023;
        if (!matchesEra) return false;
      } else if (activeFilter === "recent") {
        const matchesEra =
          project.era === "recent" ||
          (project.year >= 2019 && project.year <= 2022);
        if (!matchesEra) return false;
      } else if (activeFilter === "legacy") {
        const matchesEra = project.era === "legacy" || project.year <= 2018;
        if (!matchesEra) return false;
      } else {
        // Regular filter logic
        const matchesFilter =
          activeFilter === "all" ||
          (activeFilter === "featured" && project.featured) ||
          project.tags.some((tag) =>
            tag.toLowerCase().includes(activeFilter.toLowerCase())
          );
        if (!matchesFilter) return false;
      }

      // Search term filtering
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        lowerSearch === "" ||
        project.title.toLowerCase().includes(lowerSearch) ||
        project.description.toLowerCase().includes(lowerSearch) ||
        project.client.toLowerCase().includes(lowerSearch) ||
        (project.agency &&
          project.agency.toLowerCase().includes(lowerSearch)) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowerSearch));

      return matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const quickStats = `25 years · ${PROJECTS.length} projects · Liverpool, UK`;

  // Navigation handlers for the modal
  const handleNextProject = () => {
    if (!selectedProject) return;
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    const nextIndex = (currentIndex + 1) % filteredProjects.length;
    setSelectedProject(filteredProjects[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject) return;
    const currentIndex = filteredProjects.findIndex(
      (p) => p.id === selectedProject.id
    );
    const prevIndex =
      (currentIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setSelectedProject(filteredProjects[prevIndex]);
  };

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-[#050609] text-slate-100 font-sans">
      {/* Content container */}
      <div className="relative z-10 w-full max-w-[90rem] mx-auto h-full min-h-0 px-3 md:px-6 py-2 flex flex-col gap-2">
        {/* Header */}
        <div className="shrink-0 backdrop-blur-xl bg-[#060810]/80 border border-white/5 rounded-2xl md:rounded-3xl px-4 md:px-5 py-2.5 md:py-3 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <div className="mb-2.5">
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-0.5 text-slate-50">
              Project Archive
            </h2>
            <p className="text-xs text-slate-400">{quickStats}</p>
          </div>

          {/* Search */}
          <div className="relative mb-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full px-4 py-2.5 bg-[#070910] border border-white/10 rounded-xl focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 placeholder:text-slate-500 text-sm"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            <FilterPill
              label="All Projects"
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
              count={PROJECTS.length}
            />
            <FilterPill
              label="Featured"
              active={activeFilter === "featured"}
              onClick={() => setActiveFilter("featured")}
              count={PROJECTS.filter((p) => p.featured).length}
            />
            {/* Era filters */}
            <FilterPill
              label="Current (2023+)"
              active={activeFilter === "current"}
              onClick={() => setActiveFilter("current")}
              count={
                PROJECTS.filter(
                  (p) => p.era === "current" || p.year >= 2023
                ).length
              }
            />
            <FilterPill
              label="Recent (2019-2022)"
              active={activeFilter === "recent"}
              onClick={() => setActiveFilter("recent")}
              count={
                PROJECTS.filter(
                  (p) =>
                    p.era === "recent" ||
                    (p.year >= 2019 && p.year <= 2022)
                ).length
              }
            />
            <FilterPill
              label="Legacy (2008-2018)"
              active={activeFilter === "legacy"}
              onClick={() => setActiveFilter("legacy")}
              count={
                PROJECTS.filter(
                  (p) => p.era === "legacy" || p.year <= 2018
                ).length
              }
            />
            {/* Top tech tags */}
            {allTags.slice(0, 5).map((tag) => (
              <FilterPill
                key={tag}
                label={tag}
                active={activeFilter === tag}
                onClick={() => setActiveFilter(tag)}
              />
            ))}
          </div>
        </div>

        {/* Scrollable grid */}
        <div
          ref={scrollRef}
          onWheelCapture={onWheelCapture}
          onTouchMoveCapture={onTouchMoveCapture}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y backdrop-blur-xl bg-[#060810]/70 border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-4 shadow-[0_18px_45px_rgba(0,0,0,0.75)]"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="text-xs text-slate-400 mb-2.5 flex justify-between items-center">
            <span>
              Showing {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 md:gap-4 pb-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <p className="text-base md:text-lg mb-1">
                No projects match that query.
              </p>
              <p className="text-xs md:text-sm">
                Try a different phrase, technology, or year.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 backdrop-blur-xl bg-[#05070c]/80 border border-white/5 rounded-2xl md:rounded-3xl px-5 py-3 text-center text-[11px] md:text-xs text-slate-500">
          AI-ready filtering · Interactive, WebXR and creative technology work
        </div>
      </div>

      {/* Project detail modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onNext={handleNextProject}
          onPrev={handlePrevProject}
          currentIndex={filteredProjects.findIndex(
            (p) => p.id === selectedProject.id
          )}
          totalProjects={filteredProjects.length}
        />
      )}
    </div>
  );
}

// --- UI bits ---

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          : "bg-[#0b1018] text-slate-300 border border-white/10 hover:border-white/25"
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`ml-1.5 ${
            active ? "text-slate-950/70" : "text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Card with centered hero media + optional video & slide images
function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  type MediaItem = { type: "image" | "video"; src: string };

  const [slideIndex, setSlideIndex] = useState(0);

  const slides: MediaItem[] = [];
  if (project.video) slides.push({ type: "video", src: project.video });
  if (project.thumbnail)
    slides.push({ type: "image", src: project.thumbnail });
  project.images?.forEach((src) => slides.push({ type: "image", src }));

  const hasMultiple = slides.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const goTo = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setSlideIndex(index);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="group relative text-left cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded-xl"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#070910]/90 backdrop-blur-sm transition-all duration-300 group-hover:border-sky-400/60 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_35px_rgba(0,0,0,0.65)]">
        {/* Hero media area */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800/60 to-slate-900/30 flex items-center justify-center overflow-hidden">
          {slides[slideIndex]?.type === "image" ? (
            <img
              src={slides[slideIndex].src}
              alt={project.title}
              className="w-full h-full object-contain"
              draggable={false}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <video
              src={slides[slideIndex]?.src}
              className="w-full h-full object-contain"
              playsInline
              muted
              loop
              autoPlay
            />
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* QR Code badge */}
          {project.qrCode && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-wide text-slate-950 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm-2 8h8v8H3v-8zm2 2v4h4v-4H5zm8-12v8h8V3h-8zm2 2h4v4h-4V5zm4 8h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-4-4h2v2h-2v-2zm0-4h2v2h-2v-2zm-6 10h2v2H7v-2z" />
              </svg>
              QR
            </div>
          )}

          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-sky-500/90 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-wide text-slate-950">
              Featured
            </div>
          )}

          {/* Slider controls */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-xs text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous media"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 border border-white/30 flex items-center justify-center text-xs text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next media"
              >
                ›
              </button>

              <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => goTo(e, i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slideIndex
                        ? "w-4 bg-sky-400"
                        : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to media ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Card text content */}
        <div className="p-3.5 md:p-4">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="font-medium text-sm md:text-[15px] line-clamp-1 group-hover:text-sky-200 transition-colors">
              {project.title}
            </h3>
            <span className="text-[11px] text-slate-500 ml-2 flex-shrink-0">
              {project.year}
            </span>
          </div>

          {/* Agency badge if present */}
          {project.agency && (
            <div className="mb-2">
              <span className="inline-block px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-200 rounded-full">
                CLIENT: {project.agency}
              </span>
            </div>
          )}

          <p className="text-[11px] md:text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[#0b1018] text-[10px] text-slate-200 rounded-full border border-white/5"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] text-slate-500">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail modal with prev/next navigation and fixed scrolling
function ProjectDetail({
  project,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalProjects,
}: {
  project: Project;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalProjects: number;
}) {
  const hasAccess = Boolean(project.qrCode) || Boolean(project.link);
  const contentRef = useRef<HTMLDivElement>(null);

  const copyLink = async () => {
    if (!project.link) return;
    try {
      await navigator.clipboard.writeText(project.link);
    } catch {
      // ignore
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        onPrev();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-6xl h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#05070c]/95 shadow-[0_28px_80px_rgba(0,0,0,0.85)] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button and counter */}
        <div className="shrink-0 relative border-b border-white/10 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-12">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg md:text-2xl font-semibold tracking-tight text-slate-50 leading-tight">
                  {project.title}
                </h2>

                {project.featured && (
                  <span className="hidden md:inline-flex px-3 py-1.5 bg-sky-500/90 text-slate-950 rounded-full text-[11px] font-semibold whitespace-nowrap">
                    Featured
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm text-slate-400">
                <span>{project.year}</span>
                <span className="text-slate-600">•</span>
                <span>{project.client}</span>
                {project.agency && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-purple-300">{project.agency}</span>
                  </>
                )}
                {project.featured && (
                  <span className="md:hidden ml-1 px-2 py-0.5 bg-sky-500/90 text-slate-950 rounded-full text-[10px] font-semibold">
                    Featured
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.slice(0, 10).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-[#0b1018] border border-white/10 rounded-full text-[10px] text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
                {project.tags.length > 10 && (
                  <span className="px-2 py-0.5 text-[10px] text-slate-500">
                    +{project.tags.length - 10}
                  </span>
                )}
              </div>
            </div>

            {/* Close and counter */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {currentIndex + 1} / {totalProjects}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-slate-300 text-xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4"
        >
          <div className="grid md:grid-cols-[340px,1fr] lg:grid-cols-[400px,1fr] gap-4 md:gap-6">
            {/* LEFT COLUMN: Media */}
            <div className="space-y-3">
              {/* Reduced video height */}
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/70 to-slate-900/40 border border-white/10 flex items-center justify-center h-[240px] sm:h-[280px] md:h-[320px]">
                {project.video ? (
                  <video
                    src={project.video}
                    className="w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  />
                ) : (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                )}
              </div>

              {/* QR Code section */}
              {project.qrCode && (
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3 flex items-center gap-3">
                  <div className="bg-white rounded-xl p-2">
                    <img
                      src={project.qrCode}
                      alt="QR Code"
                      className="w-14 h-14"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-emerald-300">
                      Scan to launch
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Mobile camera → open experience
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Info */}
            <div className="space-y-3">
              {/* Description */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-[10px] font-semibold text-slate-500 mb-1 uppercase tracking-[0.16em]">
                  Description
                </h3>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Access (link) */}
              {(project.link || hasAccess) && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.16em]">
                    Link
                  </h3>

                  {project.link ? (
                    <div className="space-y-2">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Open Live Project
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>

                      <div className="flex gap-2">
                        <div className="flex-1 px-2.5 py-2 rounded-xl border border-white/10 bg-[#070a11] text-[10px] text-slate-300 truncate">
                          {project.link}
                        </div>
                        <button
                          type="button"
                          onClick={copyLink}
                          className="px-2.5 py-2 rounded-xl border border-white/10 bg-[#0b1018] hover:border-white/25 text-[10px] text-slate-200 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-500">
                      No live link provided.
                    </div>
                  )}
                </div>
              )}

              {/* Tech */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.16em]">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {project.techStack.slice(0, 12).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-[#070a11] border border-white/10 rounded-lg text-[10px] text-slate-100 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 12 && (
                    <span className="px-2 py-1 text-[10px] text-slate-500">
                      +{project.techStack.length - 12}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-[0.16em]">
                  Info
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                      Complexity
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          project.complexity === "high"
                            ? "bg-red-400"
                            : project.complexity === "medium"
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        }`}
                      />
                      <span className="text-xs font-medium capitalize text-slate-100">
                        {project.complexity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                      Era
                    </div>
                    <div className="text-xs font-medium text-slate-100">
                      {project.era
                        ? project.era === "current"
                          ? "Current"
                          : project.era === "recent"
                          ? "Recent"
                          : "Legacy"
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {!hasAccess && (
                <div className="text-[10px] text-slate-500 px-1">
                  No live link or QR available for this project.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons - positioned on sides */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 border border-white/20 hover:border-white/40 hover:bg-black/90 flex items-center justify-center text-slate-100 text-2xl transition-all shadow-lg z-10"
          aria-label="Previous project"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/80 border border-white/20 hover:border-white/40 hover:bg-black/90 flex items-center justify-center text-slate-100 text-2xl transition-all shadow-lg z-10"
          aria-label="Next project"
        >
          ›
        </button>
      </div>
    </div>
  );
}