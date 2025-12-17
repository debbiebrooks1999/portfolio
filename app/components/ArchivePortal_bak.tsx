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
  complexity: Complexity;
  featured: boolean;
  link: string;
  video?: string; // optional video for card
  images?: string[]; // optional extra images for card
}

const PROJECTS: Project[] = [
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
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "dreamwheel-ar-portal",
    title: "New York Dreamwheel AR Tourism",
    year: 2025,
    thumbnail: "/archive/NJLoading.png",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description:
      "AR experience for New Jersey Dreamwheel tourism attraction with QR code surface placeemnt for in-gondola entertainment, allwing exploration of NYC buildingd",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline",
  },
  {
    id: "aquarium-ar-kids",
    title: "Aquarium AR Kids Experience",
    year: 2025,
    thumbnail: "/archive/sealifeShark.PNG",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description:
      "AR experiencess for various aquarium attractions, including SeaLife, with QR code portal system for kids.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline",
  },
  {
    id: "national-gallery-sound",
    title: "Sensing The Unseen - National Gallery",
    year: 2020,
    thumbnail: "/archive/icon1.png",
    tags: ["WebXR", "Virtual Tour", "Audio", "Three.js"],
    description:
      "Immersive virtual tour experience for the National Gallery London with spatial audio.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Cultural Institution",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "broadway",
    title: "Broadway Re-Launch",
    year: 2020,
    thumbnail: "/archive/broadway.png",
    video: "/archive/broadway.mp4",
    images: ["/archive/broadway-1.png", "/archive/broadway-2.png"],
    tags: ["E-commerce", "React", "Node.js"],
    description:
      "Full-stack e-commerce platform with payment integration and inventory management.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "https://www.8thwall.com/aircards/broadway",
  },
  {
    id: "auckland-zoo",
    title: "Auckland Zoo AR Dinosaurs",
    year: 2025,
    thumbnail: "/archive/aucklandZooLogo.png",
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
      "Comprehensive website for local dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag",
  },
  {
    id: "publish-library",
    title: "AR Publishers Archive",
    year: 2024,
    thumbnail: "/archive/tile.png",
    tags: ["WebXR", "React Three Fiber", "VR"],
    description: "Interactive tile-based archive system for AR publishing content.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Publishing",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "google-chromebook",
    title: "Google Chromebook Setup Guide",
    year: 2021,
    thumbnail: "/archive/chromebook.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Interactive AR setup guide for Google Chromebook devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Technology",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "publishing-portal",
    title: "AR Publishers Portal",
    year: 2023,
    thumbnail: "/archive/portal.png",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "Portal-based navigation system for AR publishing experiences.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Publishing",
    complexity: "medium",
    featured: false,
    link: "",
  },
  {
    id: "instagram-mac",
    title: "M-A-C Cosmetics AR Try On",
    year: 2019,
    thumbnail: "/archive/mac.jpg",
    video: "/archive/MacCosmeticsInsta.mp4",
    tags: ["Instagram AR", "Spark AR", "Beauty Tech"],
    description: "First Instagram AR shopping filter for MAC Cosmetics product try-on.",
    techStack: ["Spark AR", "Instagram API", "AR Effects"],
    client: "Beauty/Retail",
    complexity: "high",
    featured: true,
    link: "",
  },
  {
    id: "mlso-gift",
    title: "AR Gift Experience",
    year: 2023,
    thumbnail: "/archive/mlso.png",
    tags: ["WebAR", "Gifting", "Interactive"],
    description: "Interactive AR gift unwrapping experience.",
    techStack: ["React", "Three.js", "WebAR"],
    client: "Retail",
    complexity: "medium",
    featured: true,
    link: "",
  },
  {
    id: "strainge-beast",
    title: "Strainge Beast Interactive",
    year: 2021,
    thumbnail: "/archive/strainge_beast.png",
    tags: ["WebGL", "Interactive", "Art"],
    description: "Interactive AR web experience for Strainge Beast brand, owned by Sierra Nevada.",
    techStack: ["Three.js", "WebGL", "GSAP"],
    client: "Entertainment",
    complexity: "medium",
    featured: true,
    link: "",
  },
  {
    id: "takeda",
    title: "Takeda Pharma Experience",
    year: 2020,
    thumbnail: "/archive/takeda.png",
    tags: ["WebGL", "Medical", "Interactive"],
    description: "Interactive pharmaceutical visualization experience.",
    techStack: ["React", "Three.js", "WebGL"],
    client: "Pharmaceutical",
    complexity: "medium",
    featured: true,
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
    complexity: "medium",
    featured: true,
    link: "",
  },
  {
    id: "helmet",
    title: "3D Helmet Configurator",
    year: 2021,
    thumbnail: "/archive/helmet.jpg",
    video:"/archive/helmet_effect capture 2.mov",
    tags: ["WebGL", "3D", "E-commerce"],
    description: "Knorr ",
    techStack: ["Three.js", "React", "GLTF"],
    client: "Retail",
    complexity: "medium",
    featured: true,
    link: "",
  },

  
   {
    id: "chevrolet",
    title: "Chevrolet",
    year: 2017,
    thumbnail: "/archive/chev.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Real-time 3D audio visualization.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
  {
    id: "BA_T5_yesterday",
    title: "BA_T5_yesterday",
    year: 2008,
    thumbnail: "/archive/BA_T5_yesterday.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Award winning interactive experience for British Airways T5 opening.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
   {
    id: "bicester",
    title: "bicester",
    year: 2015,
    thumbnail: "/archive/bicester.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Bicester Village portal for shooping with 3 dfferent skins and mulitple langauages",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
   {
    id: "canon",
    title: "Canon Touch Screen",
    year: 2010,
    thumbnail: "/archive/canonTouchScreen.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Canon Touch Screen Kiosk experience at Major event in Paris",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
   {
    id: "butlin",
    title: "Butlins Rebrand",
    year: 2010,
    thumbnail: "/archive/butlins.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Complex Re-brand",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
  ,
   {
    id: "Ogilvy",
    title: "Ogilvy Fellowship Wordpress",
    year: 2012,
    thumbnail: "/archive/OgilvyFellowshipWP.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Wordpress site for Ogilvy Fellowship",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
   ,
   {
    id: "mercedes",
    title: "Mercedes Tweet Powered Racetack",
    year: 2013,
    thumbnail: "/archive/mercedes.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Mercedes Tweet animated Powered Racetrack",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
   ,
   {
    id: "apple-nano",
    title: "Apple Nano Launch",
    year: 2011,
    thumbnail: "/archive/nano.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "JLSX Banner engine",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
   ,
   {
    id: "apple-itune",
    title: "Apple iTunes",
    year: 2011,
    thumbnail: "/archive/leona.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Apple iTunes",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
  ,
   {
    id: "harley-davidson",
    title: "Harley Davidson",
    year: 2014,
    thumbnail: "/archive/HD.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Harley Davidson Arabic Website.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
   ,
   {
    id: "sky",
    title: "Sky Go Game",
    year: 2016,
    thumbnail: "/archive/sky.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Sky Go Game",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
   ,
   {
    id: "BA_Fisher",
    title: "BA Fisher",
    year: 2010,
    thumbnail: "/archive/BA_Fisher.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "BA Fisher Audio work",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  }
  ,
   {
    id: "Mercedes-Fleet",
    title: "Mercedes Fleet",
    year: 2013,
    thumbnail: "/archive/mercedes-fleet.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Mercedes Fleet magazine",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
    {
    id: "ITV-Brodband",
    title: "ITV BT Broqdband",
    year: 2009,
    thumbnail: "/archive/BT_Broadband.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "ITV homepage takeover for BT Broadband",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
  {
    id: "BA-Facebook",
    title: "Facebook BA Height Cuisine App",
    year: 2010,
    thumbnail: "/archive/BA_HeightCuisine.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Facebook BA Height Cuisine App",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },

  {
    id: "nike",
    title: "Nike Banner Campaign",
    year: 2010,
    thumbnail: "/archive/nike.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Nike Banner Campaign",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },

  {
    id: "sky-store",
    title: "sky-store",
    year: 2017,
    thumbnail: "/archive/sky_store.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Sky Store card game",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },
  {
    id: "BA-Carribean",
    title: "BA Carribean",
    year: 2012,
    thumbnail: "/archive/BA_carib.png",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "BA Carribean Interactive experience",
    techStack: ["Flash", "Web"],
    client: "Personal",
    complexity: "medium",
    featured: true,
    link: "https://example.com/music",
  },


  
];

  



export default function ArchivePortal() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

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
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "featured" && project.featured) ||
        project.tags.some((tag) =>
          tag.toLowerCase().includes(activeFilter.toLowerCase())
        );

      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        lowerSearch === "" ||
        project.title.toLowerCase().includes(lowerSearch) ||
        project.description.toLowerCase().includes(lowerSearch) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowerSearch));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm]);

  const quickStats = `25 years · ${PROJECTS.length} projects · Liverpool, UK`;

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
            {allTags.slice(0, 8).map((tag) => (
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
        <span className={`ml-1.5 ${active ? "text-slate-950/70" : "text-slate-500"}`}>
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
  if (project.thumbnail) slides.push({ type: "image", src: project.thumbnail });
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
    // IMPORTANT: not a <button> (prevents nested-button hydration errors)
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
              src={slides[slideIndex].src}
              className="w-full h-full object-contain"
              playsInline
              muted
              loop
              autoPlay
            />
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

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
            <span className="text-[11px] text-slate-500 ml-2">
              {project.year}
            </span>
          </div>

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

// Detail modal with centered hero media
function ProjectDetail({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full backdrop-blur-2xl bg-[#05070c]/95 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-slate-300 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Left: hero media + tags */}
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/70 to-slate-900/40 mb-4 flex items-center justify-center">
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
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#0b1018] border border-white/10 rounded-full text-xs text-slate-100"
                >
                  {tag}
                </span>
              ))}
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs md:text-sm font-semibold tracking-tight transition-colors"
              >
                View project<span aria-hidden>↗</span>
              </a>
            )}
          </div>

          {/* Right: text details */}
          <div>
            <div className="flex items-start justify-between mb-4 gap-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1 text-slate-50">
                  {project.title}
                </h2>
                <p className="text-sm text-slate-400">
                  {project.year} · {project.client}
                </p>
              </div>
              {project.featured && (
                <span className="px-3 py-1 bg-sky-500/90 text-slate-950 rounded-full text-xs font-semibold h-fit">
                  Featured
                </span>
              )}
            </div>

            <p className="text-sm md:text-[15px] text-slate-200 mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-[0.16em]">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-[#070a11] border border-white/10 rounded-full text-xs text-slate-100"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-[11px] text-slate-500 mb-1">
                  Complexity
                </div>
                <div className="text-sm font-medium capitalize text-slate-100">
                  {project.complexity}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500 mb-1">Industry</div>
                <div className="text-sm font-medium text-slate-100">
                  {project.client}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}