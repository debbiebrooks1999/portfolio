"use client";
import React, { useState } from "react";

// Project data structure with weight, plus optional video/images
type Project = {
  id: string;
  title: string;
  year: number;
  thumbnail: string;
  tags: string[];
  description: string;
  techStack: string[];
  client: string;
  complexity: "low" | "medium" | "high";
  featured: boolean;
  link: string;
  weight: 1 | 2 | 3 | 4 | 5;
  video?: string;
  images?: string[];
};

const PROJECTS: Project[] = [
  {
    id: "volvo-vr-experience",
    title: "Volvo VR Showroom",
    year: 2025,
    thumbnail: "/archive/volvo.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description:
      "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "",
    weight: 1,
  },
  {
    id: "dreamwheel-ar-portal",
    title: "New York Dreamwheel AR Tourism",
    year: 2023,
    thumbnail: "/archive/skyline.jpg",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description:
      "AR/VR experiences for Queenstown tourism with QR code portal system for gondola attractions.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline",
    weight: 1,
  },
  {
    id: "national-gallery-sound",
    title: "Sensing The Unseen - National Gallery",
    year: 2024,
    // UPDATED thumbnail from second file
    thumbnail: "/archive/icon1.png",
    tags: ["WebXR", "Virtual Tour", "Audio", "Three.js"],
    description:
      "Immersive virtual tour experience for the National Gallery London with spatial audio.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Cultural Institution",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
    weight: 1,
  },
  {
    id: "broadway",
    title: "Re-launching Broadway post-Covid",
    year: 2020,
    // UPDATED media from second file
    thumbnail: "/archive/broadway.png",
    video: "/archive/broadway.mp4",
    images: ["/archive/broadway-1.png", "/archive/broadway-2.png"],
    tags: ["AR", "8th Wall", "WebAR", "E-commerce"],
    description:
      "AR experience to re-launch Broadway theaters post-pandemic with immersive preview experiences.",
    techStack: ["8th Wall", "Three.js", "WebAR", "React"],
    client: "Entertainment",
    complexity: "high",
    featured: true,
    link: "https://www.8thwall.com/aircards/broadway",
    weight: 2,
  },
  {
    id: "auckland-zoo",
    title: "Auckland Zoo AR Dinosaurs",
    year: 2024,
    // UPDATED thumbnail (mapped from `auckalnd` entry)
    thumbnail: "/archive/aucklandZooLogo.png",
    tags: ["AR", "WebAR", "Educational", "Three.js"],
    description:
      "Dinosaur Discovery Track where visitors use phones to access AR dinosaur experiences at 25 animatronic dinosaurs.",
    techStack: ["Three.js", "WebAR", "8th Wall", "React"],
    client: "Educational/Zoo",
    complexity: "high",
    featured: true,
    link: "https://example.com/liquid",
    weight: 3,
  },
  {
    id: "wash-n-wag",
    title: "Wash N Wag Academy",
    year: 2024,
    // UPDATED thumbnail to .png
    thumbnail: "/archive/washnwag.png",
    tags: ["Web Design", "Framer Motion", "React"],
    description:
      "Comprehensive website for dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag",
    weight: 4,
  },
  {
    id: "publish-library",
    title: "AR Publishers Archive",
    year: 2024,
    thumbnail: "/archive/tiles.jpg",
    tags: ["WebXR", "React Three Fiber", "VR"],
    description: "Interactive tile-based archive system for AR publishing content.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Publishing",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 2,
  },
  {
    id: "google-chromebook",
    title: "Google Chromebook Setup Guide",
    year: 2024,
    // UPDATED thumbnail to .png
    thumbnail: "/archive/chromebook.png",
    tags: ["WebAR", "Interactive", "Tutorial"],
    description: "Interactive AR setup guide for Google Chromebook devices.",
    techStack: ["React", "Three.js", "WebAR", "8th Wall"],
    client: "Google",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 1,
  },
  {
    id: "publishing-portal",
    title: "AR Publishers Portal",
    year: 2023,
    thumbnail: "/archive/portal.jpg",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "Portal-based navigation system for AR publishing experiences.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Publishing",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 3,
  },
  {
    id: "instagram-mac",
    title: "MAC Cosmetics Instagram AR",
    year: 2024,
    // same thumbnail, but now with video
    thumbnail: "/archive/mac.jpg",
    video: "/archive/MacCosmeticsInsta.mp4",
    tags: ["Instagram AR", "Spark AR", "Beauty Tech"],
    description: "Instagram AR filter for MAC Cosmetics product try-on.",
    techStack: ["Spark AR", "Instagram API", "AR Effects"],
    client: "Beauty/Retail",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 1,
  },
  {
    id: "mlso-gift",
    title: "AR Gift Experience",
    year: 2024,
    // UPDATED thumbnail
    thumbnail: "/archive/mlso.png",
    tags: ["WebAR", "Gifting", "Interactive"],
    description: "Interactive AR gift unwrapping experience.",
    techStack: ["React", "Three.js", "WebAR"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 4,
  },
  {
    id: "strainge-beast",
    title: "Strainge Beast Interactive",
    year: 2024,
    // UPDATED thumbnail
    thumbnail: "/archive/strainge_beast.png",
    tags: ["WebGL", "Interactive", "Art"],
    description: "Interactive web experience for Strainge Beast brand.",
    techStack: ["Three.js", "WebGL", "GSAP"],
    client: "Entertainment",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 4,
  },
  {
    id: "takeda",
    title: "Takeda Pharma Experience",
    year: 2024,
    // UPDATED thumbnail (png)
    thumbnail: "/archive/takeda.png",
    tags: ["WebGL", "Medical", "Interactive"],
    description: "Interactive pharmaceutical visualization experience.",
    techStack: ["React", "Three.js", "WebGL"],
    client: "Pharmaceutical",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 4,
  },
  {
    id: "intel",
    title: "Intel Interactive Demo",
    year: 2024,
    // UPDATED thumbnail
    thumbnail: "/archive/PLayCanvas_Intel.png",
    tags: ["WebGL", "Tech Demo", "3D"],
    description: "Interactive 3D demo for Intel technology showcase.",
    techStack: ["React", "Three.js", "WebGL"],
    client: "Technology",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 4,
  },
  {
    id: "helmet",
    title: "3D Helmet Configurator",
    year: 2024,
    // same thumbnail
    thumbnail: "/archive/helmet.jpg",
    tags: ["WebGL", "3D", "E-commerce"],
    description: "3D product configurator for helmet customization.",
    techStack: ["Three.js", "React", "GLTF"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "",
    weight: 5,
  },
  {
    id: "alchemist",
    title: "Alchemist Bar Experience",
    year: 2024,
    thumbnail: "/archive/alchemist.jpg",
    tags: ["Web Design", "Interactive"],
    description: "Interactive web experience for Alchemist cocktail bar.",
    techStack: ["React", "GSAP", "Framer Motion"],
    client: "Hospitality",
    complexity: "low",
    featured: false,
    link: "",
    weight: 5,
  },
  {
    id: "music-visualizer",
    title: "3D Music Visualizer",
    year: 2022,
    thumbnail: "/archive/music.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Real-time 3D audio visualization.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Personal",
    complexity: "medium",
    featured: false,
    link: "https://example.com/music",
    weight: 5,
  },
];

export default function ArchivePortal() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const allTags = Array.from(
    new Set(PROJECTS.flatMap((project) => project.tags))
  ).sort();

  const filteredProjects = PROJECTS.filter((project) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "featured" && project.featured) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(activeFilter.toLowerCase())
      );

    const matchesSearch =
      searchTerm === "" ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-[#020408] text-slate-200 py-12 md:py-16">
      {/* ParticleBackground removed */}

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-sky-300 via-cyan-200 to-slate-200 bg-clip-text text-transparent">
            Project Archive
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            A collection of immersive web experiences, from cutting-edge WebXR
            to classic interactive builds spanning 25 years of creative
            development.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-[#070a11]/80 backdrop-blur-sm border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/30 transition-all"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
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

          <div className="flex flex-wrap gap-2">
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

        <div className="mb-6 text-sm text-slate-500">
          Showing {filteredProjects.length} project
          {filteredProjects.length !== 1 ? "s" : ""}
        </div>

        <MasonryGrid
          projects={filteredProjects}
          onProjectClick={setSelectedProject}
        />
      </div>

      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

function MasonryGrid({
  projects,
  onProjectClick,
}: {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {projects.map((project) => (
        <div key={project.id} className="break-inside-avoid mb-4">
          <ProjectCard
            project={project}
            onClick={() => onProjectClick(project)}
          />
        </div>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const isLarge = project.weight <= 2;
  const isCompact = project.weight >= 4;
  const hasVideo = !!project.video;

  return (
    <button
      onClick={onClick}
      className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded-xl"
    >
      <div className="w-full relative overflow-hidden rounded-xl border border-white/8 bg-[#070910]/90 backdrop-blur-sm transition-all duration-300 group-hover:border-sky-400/60 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_rgba(14,165,233,0.15)]">
        <div
          className={`relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/30 ${
            isLarge ? "aspect-[4/3]" : isCompact ? "aspect-video" : "aspect-[3/2]"
          }`}
        >
          {hasVideo ? (
            <video
              src={project.video}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {project.featured && (
            <div className="absolute top-2 right-2 px-2.5 py-1 bg-sky-500/90 backdrop-blur-sm rounded-full text-[10px] font-medium tracking-wide text-slate-950">
              Featured
            </div>
          )}
        </div>

        <div className={`${isCompact ? "p-3" : "p-4"}`}>
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`font-medium ${
                isLarge ? "text-base" : isCompact ? "text-sm" : "text-sm"
              } line-clamp-2 group-hover:text-sky-200 transition-colors leading-snug`}
            >
              {project.title}
            </h3>
            <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
              {project.year}
            </span>
          </div>

          {!isCompact && (
            <p
              className={`${
                isLarge ? "text-xs" : "text-[11px]"
              } text-slate-400 line-clamp-2 mb-3 leading-relaxed`}
            >
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {project.tags
              .slice(0, isCompact ? 2 : isLarge ? 4 : 3)
              .map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-0.5 bg-[#0b1018] ${
                    isCompact ? "text-[9px]" : "text-[10px]"
                  } text-slate-200 rounded-full border border-white/5`}
                >
                  {tag}
                </span>
              ))}
            {project.tags.length > (isCompact ? 2 : isLarge ? 4 : 3) && (
              <span
                className={`px-2 py-0.5 ${
                  isCompact ? "text-[9px]" : "text-[10px]"
                } text-slate-500`}
              >
                +{project.tags.length - (isCompact ? 2 : isLarge ? 4 : 3)}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

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
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center text-slate-300 text-xl"
          aria-label="Close"
        >
          ×
        </button>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/70 to-slate-900/40 mb-4">
              {/* Show video in detail view as well if present, else image */}
              {project.video ? (
                <video
                  src={project.video}
                  className="w-full h-full object-cover"
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
                  className="w-full h-full object-cover"
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