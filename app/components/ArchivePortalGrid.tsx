"use client";

import React, { useState, useEffect } from "react";
import * as THREE from "three"; // if elsewhere, remove if unused here

/*

categories :

demo, hero, 

creative, 
MacCosmeticsInsta.mp4
*/
const PROJECTS: Project[] = [
  {
    id: "broadway",
    title: "Broadway Re-Launch",
    year: 2020,
    thumbnail: "/archive/broadway.png",
    video: "/archive/broadway.mp4",
    // optional extra images for the card slider
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
    id: "auckalnd",
    title: "Auckland Zoo 2 x AR and 25 x audio experience",
    year: 2024,
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
      "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: false,
    link: "",
  },
  {
    id: "aquariums",
    title: "Aquarium 6 AR and 2 Facetrackers",
    year: 2024,
    thumbnail: "/archive/shark.png",
    tags: [
      "WebAR",
      "Audio",
      "Three.js",
      "Zappar",
      "Mattercraft",
      "Wildlife & Conservation",
    ],
    description:
      "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: false,
    link: "",
  },
    {
    id: "instagram-mac",
    title: "M-A-C Cosmetics AR Try On",
    year: 2024,
    thumbnail: "/archive/mac.jpg",
    video: "/archive/MacCosmeticsInsta.mp4",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "MAC-Cosmetics",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
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
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag",
  },

  {
    id: "music-visualizer",
    title: "3D Music Visualizer",
    year: 2022,
    thumbnail: "/archive/music.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "3D Music Visualizer",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Entertainment",
    complexity: "high",
    featured: true,
    link: "https://example.com/music",
  },
  {
    id: "national-gallery-sound",
    title: "Sensing The Unseen",
    year: 2024,
    thumbnail: "/archive/icon1.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Sensing The Unseen",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "google-chromebook",
    title: "Google Chromebook set-up guide",
    year: 2024,
    thumbnail: "/archive/chromebook.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Google Chromebook set-up guide",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },

  {
    id: "mlso-gift",
    title: "AR Gift",
    year: 2024,
    thumbnail: "/archive/mlso.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "AR Gift",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "strainge-beast",
    title: "strainge beast",
    year: 2024,
    thumbnail: "/archive/strainge_beast.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "strainge beast",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "takeda",
    title: "takeda",
    year: 2024,
    thumbnail: "/archive/takeda.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "takeda",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "intel",
    title: "intel",
    year: 2024,
    thumbnail: "/archive/PLayCanvas_Intel.png",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "intel",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "helmet",
    title: "helmet",
    year: 2024,
    thumbnail: "/archive/helmet.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "intel",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "alchemist",
    title: "alchemist",
    year: 2024,
    thumbnail: "/archive/alchemist.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "alchemist",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "bigbrother",
    title: "helbigbrothermet",
    year: 2024,
    thumbnail: "/archive/bigbrother.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "intel",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "chanel",
    title: "chanel",
    year: 2024,
    thumbnail: "/archive/chanel.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "chanel",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
  {
    id: "takeda-2",
    title: "takeda",
    year: 2024,
    thumbnail: "/archive/takeda.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "takeda",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://www.nationalgallery.org.uk/visiting/virtual-tours/sensing-the-unseen-at-home",
  },
];

interface Project {
  id: string;
  title: string;
  year: number;
  thumbnail: string;
  tags: string[];
  description: string;
  techStack: string[];
  client: string;
  complexity: string;
  featured: boolean;
  link?: string;
  video?: string; // optional video for card slide
  images?: string[]; // optional additional images for card slide
}

export default function ArchivePortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(PROJECTS);
  const [aiReasoning, setAiReasoning] = useState("");
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  // Simple fuzzy search fallback
  const fuzzySearch = (query: string) => {
    if (!query.trim()) return PROJECTS;

    const lowerQuery = query.toLowerCase();
    return PROJECTS.filter((project) => {
      const searchText = `${project.title} ${project.description} ${project.tags.join(
        " "
      )} ${project.techStack.join(" ")} ${project.year}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  };

  // AI-powered search using Claude
  const aiSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredProjects(PROJECTS);
      setAiReasoning("");
      return;
    }

    setIsSearching(true);

    try {
      const fuzzyResults = fuzzySearch(query);
      setFilteredProjects(fuzzyResults);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // NOTE: you'll need to add your Anthropic API key header in a real app
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            {
              role: "user",
              content: `You are helping search through a web developer's portfolio of 25 years of work.

                User Query: "${query}"

                Available Projects:
                ${JSON.stringify(PROJECTS, null, 2)}

                Analyze the user's query and return a JSON response with:
                1. "projectIds": array of relevant project IDs (ordered by relevance)
                2. "reasoning": brief explanation of why these projects match

                Consider:
                - Natural language (e.g., "immersive" matches VR/AR)
                - Date ranges (e.g., "recent work" means 2023-2024)
                - Technology keywords
                - Project complexity
                - Client type

                Respond ONLY with valid JSON in this exact format:
                {
                "projectIds": ["id1", "id2", "id3"],
                "reasoning": "Found X projects matching..."
                }

                DO NOT include any text outside the JSON object. DO NOT use markdown code blocks.`,
            },
          ],
        }),
      });

      const data = await response.json();
      let responseText = data.content?.[0]?.text ?? "";

      responseText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const aiResult = JSON.parse(responseText);

      const aiFilteredProjects = PROJECTS.filter((p) =>
        aiResult.projectIds.includes(p.id)
      );

      aiFilteredProjects.sort((a, b) => {
        return (
          aiResult.projectIds.indexOf(a.id) -
          aiResult.projectIds.indexOf(b.id)
        );
      });

      setFilteredProjects(
        aiFilteredProjects.length > 0 ? aiFilteredProjects : fuzzyResults
      );
      setAiReasoning(aiResult.reasoning);
    } catch (error) {
      console.error("AI search error:", error);
      const fuzzyResults = fuzzySearch(query);
      setFilteredProjects(fuzzyResults);
      setAiReasoning("");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        aiSearch(searchQuery);
      } else {
        setFilteredProjects(PROJECTS);
        setAiReasoning("");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const quickFilters = [
    { label: "All", query: "" },
    { label: "WebXR / VR", query: "WebXR VR AR immersive" },
    { label: "Recent", query: "projects from 2023 to 2024" },
    { label: "Three.js", query: "Three.js WebGL 3D" },
    { label: "Complex", query: "most technically complex projects" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#050609] text-slate-100 font-sans">
      {/* Subtle particle background */}
      <div className="absolute inset-0">
        <ParticleBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto py-8 px-3 md:px-0 flex flex-col gap-3">
        {/* Header */}
        <div className="backdrop-blur-xl bg-[#060810]/80 border border-white/5 rounded-2xl md:rounded-3xl px-5 md:px-7 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1 text-slate-50">
              Project Archive
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              25 years · {PROJECTS.length} projects · Liverpool, UK
            </p>
          </div>

          {/* AI Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search or ask: "VR work from 2023"'
              className="w-full px-4 md:px-5 py-3 md:py-3.5 bg-[#070910] border border-white/10 rounded-xl focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20 placeholder:text-slate-500 text-sm md:text-base"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSearchQuery(filter.query)}
                className="px-3 py-1.5 text-xs md:text-sm bg-[#080a11] border border-white/10 rounded-full hover:border-sky-400/60 hover:bg-sky-400/5 transition-all"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* AI Reasoning */}
          {aiReasoning && (
            <div className="mt-3 px-4 py-2 bg-[#0a101a] border border-sky-400/30 rounded-lg text-xs md:text-sm text-slate-200">
              <span className="font-medium text-sky-300">AI insight:</span>{" "}
              {aiReasoning}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto backdrop-blur-xl bg-[#060810]/70 border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-[0_18px_45px_rgba(0,0,0,0.75)]">
          <div className="text-xs md:text-sm text-slate-400 mb-3 flex justify-between items-center">
            <span>
              Showing {filteredProjects.length} project
              {filteredProjects.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
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
        <div className="backdrop-blur-xl bg-[#05070c]/80 border border-white/5 rounded-2xl md:rounded-3xl px-5 py-3 text-center text-[11px] md:text-xs text-slate-500">
          AI-assisted search · Semantic filtering over interactive, WebXR and
          creative technology work
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

// Project Card Component (with media slider)
function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  type MediaItem = { type: "image" | "video"; src: string };

  const [slideIndex, setSlideIndex] = useState(0);

  // Build slide list: video (if present), thumbnail, then any extra images
  const slides: MediaItem[] = [];

  if (project.video) {
    slides.push({ type: "video", src: project.video });
  }

  if (project.thumbnail) {
    slides.push({ type: "image", src: project.thumbnail });
  }

  if (project.images && project.images.length > 0) {
    project.images.forEach((src) => slides.push({ type: "image", src }));
  }

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

  return (
    <button
      onClick={onClick}
      className="group relative text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 rounded-xl"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#070910]/90 backdrop-blur-sm transition-all duration-300 group-hover:border-sky-400/60 group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_35px_rgba(0,0,0,0.65)]">
        {/* Media slider: supports multiple images and/or a video (portrait or landscape) */}
        <div className="relative aspect-video bg-gradient-to-br from-slate-800/60 to-slate-900/30 flex items-center justify-center overflow-hidden">
          {slides[slideIndex]?.type === "image" ? (
            <img
              src={slides[slideIndex].src}
              alt={project.title}
              className="w-full h-full object-contain"
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

          {/* Slider controls (only if more than one slide) */}
          {hasMultiple && (
            <>
              {/* Prev / Next arrows */}
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

              {/* Dots */}
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

        {/* Content */}
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

          {/* Tags */}
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
    </button>
  );
}

// Project Detail Modal
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
          {/* Left: Image & tags */}
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/70 to-slate-900/40 mb-4 flex items-center justify-center">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
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

          {/* Right: Details */}
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
                <div className="text-[11px] text-slate-500 mb-1">
                  Industry
                </div>
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

// Subtle CSS particle background
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute w-[2px] h-[2px] bg-slate-100/18 rounded-full animate-float-soft"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${18 + Math.random() * 16}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float-soft {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 0.25;
          }
          50% {
            transform: translateY(-40vh);
            opacity: 0.25;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-80vh);
            opacity: 0;
          }
        }
        .animate-float-soft {
          animation: float-soft linear infinite;
        }
      `}</style>
    </div>
  );
}