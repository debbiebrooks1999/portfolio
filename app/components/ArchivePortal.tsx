"use client";
import React, { useState, useEffect } from "react";

// Mock project data structure - replace with your real projects
const PROJECTS = [
  {
    id: "volvo-vr-experience",
    title: "Volvo VR Showroom",
    year: 2024,
    thumbnail: "/archive/volvo.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://example.com/volvo"
  },
  {
    id: "skyline-ar-portal",
    title: "Skyline AR Tourism",
    year: 2023,
    thumbnail: "/archive/skyline.jpg",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "AR/VR experiences for Queenstown tourism with QR code portal system for gondola attractions.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline"
  },
  {
    id: "wash-n-wag",
    title: "Wash N Wag Academy",
    year: 2024,
    thumbnail: "/archive/washnwag.jpg",
    tags: ["Web Design", "Framer Motion", "React"],
    description: "Comprehensive website for dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag"
  },
  {
    id: "liquid-metal-shader",
    title: "Liquid Metal Frames",
    year: 2024,
    thumbnail: "/archive/liquid.jpg",
    tags: ["WebGL", "Shaders", "Three.js", "GLSL"],
    description: "Custom shader effects creating liquid metal animations with beveled corners and particle systems.",
    techStack: ["Three.js", "GLSL", "WebGL", "React"],
    client: "Personal",
    complexity: "high",
    featured: true,
    link: "https://example.com/liquid"
  },
  {
    id: "ecommerce-2020",
    title: "Fashion E-commerce Platform",
    year: 2020,
    thumbnail: "/archive/fashion.jpg",
    tags: ["E-commerce", "React", "Node.js"],
    description: "Full-stack e-commerce platform with payment integration and inventory management.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "https://example.com/fashion"
  },
  {
    id: "music-visualizer",
    title: "3D Music Visualizer",
    year: 2022,
    thumbnail: "/archive/music.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Real-time 3D music visualization using Web Audio API and custom shaders.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Entertainment",
    complexity: "high",
    featured: true,
    link: "https://example.com/music"
  },
  {
    id: "volvo-vr-experience",
    title: "Volvo VR Showroom",
    year: 2024,
    thumbnail: "/archive/volvo.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://example.com/volvo"
  },
  {
    id: "skyline-ar-portal",
    title: "Skyline AR Tourism",
    year: 2023,
    thumbnail: "/archive/skyline.jpg",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "AR/VR experiences for Queenstown tourism with QR code portal system for gondola attractions.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline"
  },
  {
    id: "wash-n-wag",
    title: "Wash N Wag Academy",
    year: 2024,
    thumbnail: "/archive/washnwag.jpg",
    tags: ["Web Design", "Framer Motion", "React"],
    description: "Comprehensive website for dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag"
  },
  {
    id: "liquid-metal-shader",
    title: "Liquid Metal Frames",
    year: 2024,
    thumbnail: "/archive/liquid.jpg",
    tags: ["WebGL", "Shaders", "Three.js", "GLSL"],
    description: "Custom shader effects creating liquid metal animations with beveled corners and particle systems.",
    techStack: ["Three.js", "GLSL", "WebGL", "React"],
    client: "Personal",
    complexity: "high",
    featured: true,
    link: "https://example.com/liquid"
  },
  {
    id: "ecommerce-2020",
    title: "Fashion E-commerce Platform",
    year: 2020,
    thumbnail: "/archive/fashion.jpg",
    tags: ["E-commerce", "React", "Node.js"],
    description: "Full-stack e-commerce platform with payment integration and inventory management.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "https://example.com/fashion"
  },
  {
    id: "music-visualizer",
    title: "3D Music Visualizer",
    year: 2022,
    thumbnail: "/archive/music.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Real-time 3D music visualization using Web Audio API and custom shaders.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Entertainment",
    complexity: "high",
    featured: true,
    link: "https://example.com/music"
  },
  {
    id: "volvo-vr-experience",
    title: "Volvo VR Showroom",
    year: 2024,
    thumbnail: "/archive/volvo.jpg",
    tags: ["WebXR", "React Three Fiber", "VR", "Meta Quest"],
    description: "Immersive 360° VR experience with hotspot navigation and video spheres for Meta Quest devices.",
    techStack: ["React", "Three.js", "WebXR", "@react-three/fiber"],
    client: "Automotive",
    complexity: "high",
    featured: true,
    link: "https://example.com/volvo"
  },
  {
    id: "skyline-ar-portal",
    title: "Skyline AR Tourism",
    year: 2023,
    thumbnail: "/archive/skyline.jpg",
    tags: ["AR", "WebXR", "QR Portals", "Three.js"],
    description: "AR/VR experiences for Queenstown tourism with QR code portal system for gondola attractions.",
    techStack: ["Three.js", "WebXR", "AR.js", "React"],
    client: "Tourism",
    complexity: "high",
    featured: true,
    link: "https://example.com/skyline"
  },
  {
    id: "wash-n-wag",
    title: "Wash N Wag Academy",
    year: 2024,
    thumbnail: "/archive/washnwag.jpg",
    tags: ["Web Design", "Framer Motion", "React"],
    description: "Comprehensive website for dog grooming academy with complex animations and responsive design.",
    techStack: ["React", "Framer Motion", "Tailwind", "Next.js"],
    client: "Education",
    complexity: "medium",
    featured: false,
    link: "https://example.com/washnwag"
  },
  {
    id: "liquid-metal-shader",
    title: "Liquid Metal Frames",
    year: 2024,
    thumbnail: "/archive/liquid.jpg",
    tags: ["WebGL", "Shaders", "Three.js", "GLSL"],
    description: "Custom shader effects creating liquid metal animations with beveled corners and particle systems.",
    techStack: ["Three.js", "GLSL", "WebGL", "React"],
    client: "Personal",
    complexity: "high",
    featured: true,
    link: "https://example.com/liquid"
  },
  {
    id: "ecommerce-2020",
    title: "Fashion E-commerce Platform",
    year: 2020,
    thumbnail: "/archive/fashion.jpg",
    tags: ["E-commerce", "React", "Node.js"],
    description: "Full-stack e-commerce platform with payment integration and inventory management.",
    techStack: ["React", "Node.js", "MongoDB", "Stripe"],
    client: "Retail",
    complexity: "medium",
    featured: false,
    link: "https://example.com/fashion"
  },
  {
    id: "music-visualizer",
    title: "3D Music Visualizer",
    year: 2022,
    thumbnail: "/archive/music.jpg",
    tags: ["Three.js", "Audio", "WebGL"],
    description: "Real-time 3D music visualization using Web Audio API and custom shaders.",
    techStack: ["Three.js", "Web Audio API", "GLSL"],
    client: "Entertainment",
    complexity: "high",
    featured: true,
    link: "https://example.com/music"
  },
  // Add more projects here to reach 50...
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
}

export default function ArchivePortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(PROJECTS);
  const [aiReasoning, setAiReasoning] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Simple fuzzy search fallback
  const fuzzySearch = (query: string) => {
    if (!query.trim()) return PROJECTS;
    
    const lowerQuery = query.toLowerCase();
    return PROJECTS.filter(project => {
      const searchText = `${project.title} ${project.description} ${project.tags.join(" ")} ${project.techStack.join(" ")} ${project.year}`.toLowerCase();
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
      // First show instant fuzzy search results
      const fuzzyResults = fuzzySearch(query);
      setFilteredProjects(fuzzyResults);

      // Then enhance with AI
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      let responseText = data.content[0].text;
      
      // Clean up response
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const aiResult = JSON.parse(responseText);
      
      // Filter projects based on AI results
      const aiFilteredProjects = PROJECTS.filter(p => 
        aiResult.projectIds.includes(p.id)
      );
      
      // Sort by AI's order
      aiFilteredProjects.sort((a, b) => {
        return aiResult.projectIds.indexOf(a.id) - aiResult.projectIds.indexOf(b.id);
      });

      setFilteredProjects(aiFilteredProjects.length > 0 ? aiFilteredProjects : fuzzyResults);
      setAiReasoning(aiResult.reasoning);
    } catch (error) {
      console.error("AI search error:", error);
      // Fallback to fuzzy search
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

  // Quick filter buttons
  const quickFilters = [
    { label: "All", query: "" },
    { label: "WebXR/VR", query: "WebXR VR AR immersive" },
    { label: "Recent", query: "projects from 2023 to 2024" },
    { label: "Three.js", query: "Three.js WebGL 3D" },
    { label: "Complex", query: "most technically complex projects" },
  ];

  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* Particle Background */}
      <div className="absolute inset-0">
        <ParticleBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full max-w-[95vw] max-h-[95vh] mx-auto my-4 flex flex-col">
        {/* Header */}
        <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-t-3xl p-6 shadow-[0_0_60px_rgba(168,85,247,0.3)]">
          <div className="mb-4">
            <h2 className="text-3xl font-bold mb-1">Project Archive</h2>
            <p className="text-white/60 text-sm">25 Years · {PROJECTS.length} Projects · Liverpool, UK</p>
          </div>

          {/* AI Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="💬 Ask me about my work... (e.g., 'Show me VR projects from 2023')"
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 placeholder:text-white/40 text-lg"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSearchQuery(filter.query)}
                className="px-4 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* AI Reasoning */}
          {aiReasoning && (
            <div className="mt-3 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-sm text-purple-200">
              <span className="font-semibold">AI:</span> {aiReasoning}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div className="flex-1 overflow-y-auto backdrop-blur-2xl bg-black/20 border-x border-white/10 p-6">
          <div className="text-white/60 text-sm mb-4">
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-20 text-white/40">
              <p className="text-xl mb-2">No projects found</p>
              <p className="text-sm">Try a different search query</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="backdrop-blur-2xl bg-black/40 border border-white/10 rounded-b-3xl p-4 text-center text-white/40 text-sm">
          Powered by AI · Claude Sonnet 4 · Semantic Search & Natural Language Processing
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

// Project Card Component
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center relative overflow-hidden">
          <img 
            src={project.thumbnail} 
            alt={project.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/80 backdrop-blur-sm rounded text-xs font-semibold">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-purple-300 transition-colors">
              {project.title}
            </h3>
            <span className="text-xs text-white/40 ml-2">{project.year}</span>
          </div>
          
          <p className="text-xs text-white/60 line-clamp-2 mb-3">
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-white/40">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Project Detail Modal
function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full backdrop-blur-2xl bg-black/60 border border-white/20 rounded-3xl p-8 shadow-[0_0_80px_rgba(168,85,247,0.4)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center"
        >
          <span className="text-2xl">×</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image */}
          <div>
            <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 mb-4">
              <img 
                src={project.thumbnail} 
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* {project.link && (
              
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors font-semibold"
              >
                View Project →
              </a>
            )} */}
          </div>

          {/* Right: Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{project.title}</h2>
                <p className="text-white/60">{project.year} · {project.client}</p>
              </div>
              {project.featured && (
                <span className="px-3 py-1 bg-purple-500/80 backdrop-blur-sm rounded-lg text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>

            <p className="text-white/80 mb-6 leading-relaxed">
              {project.description}
            </p>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/60 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-white/40 mb-1">Complexity</div>
                <div className="text-sm font-semibold capitalize">{project.complexity}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 mb-1">Industry</div>
                <div className="text-sm font-semibold">{project.client}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple CSS particle background
function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-200vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}