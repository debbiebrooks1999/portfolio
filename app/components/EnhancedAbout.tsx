"use client"

import React, { useState, useRef } from 'react'
import CareerTimeline from './CareerTimeline'
import CareerWheelTimeline from './CareerWheelTimeline'


type TimelineEntry = {
  id: string
  period: string
  role?: string
  agencies: string[]
  clients: string[]
  achievements?: string[]
  technologies: string[]
  description: string
}

const CAREER_DATA: TimelineEntry[] = [
  {
    id: "2023-present",
    period: "2023 - Present",
    role: "Creative Technologist",
    agencies: ["Magic Memories", "Yondr", "Poseidon", "Make Associates", "Circus 360"],
    clients: ["SeaLife", "NJ DreamWheel", "Auckland Zoo", "Poseidon", "Bombay Sapphire"],
    technologies: ["Three.js", "React", "WebGL", "Zappar", "8th Wall", "AR"],
    description: "Motion graphics, 3D modelling, and AR promotional materials using Three.js, React, and WebGL on Zappar & 8th Wall platforms.",
  },
  {
    id: "2020-2022",
    period: "2020 - 2022",
    role: "Creative Technologist",
    agencies: ["National Gallery", "Blippar", "Cassette", "EyeKandy", "TRO", "Aircards"],
    clients: ["National Gallery London", "Google", "Takeda", "Intel"],
    technologies: ["A-Frame", "WebGL", "Three.js", "PlayCanvas", "GSAP", "JavaScript ES6"],
    description: "Creating animations, interactive sound experiences, 360 video interactive experiences, and augmented reality for mobile browser and WebXR platforms.",
  },
  {
    id: "2019-2020",
    period: "2019 - 2020",
    role: "Senior Developer",
    agencies: ["The Mill"],
    clients: ["MAC Cosmetics", "Chanel", "Mercedes", "Microsoft", "Samsung", "Mango"],
    achievements: ["Delivered Instagram's first AR shopping filter for MAC Cosmetics"],
    technologies: ["Spark AR", "JavaScript", "WebGL", "HTML5", "CSS3", "Webpack"],
    description: "Pioneered Instagram's first AR shopping filter alongside Facebook team. Delivered Samsung Olympics microsite and various high-profile interactive experiences.",
  },
  {
    id: "2017-2019",
    period: "2017 - 2019",
    role: "Lead Developer",
    agencies: ["Rapport Design"],
    clients: ["Berner"],
    technologies: ["WordPress", "PHP", "JavaScript", "SOAP", "E-commerce"],
    description: "Built bespoke storefront system with PHP/JavaScript/SOAP e-commerce for 5000 product lines with real-time pricing per customer.",
  },
  {
    id: "2017-iris",
    period: "Aug - Sep 2017",
    role: "Frontend Developer",
    agencies: ["Iris"],
    clients: ["Value Retail / Bicester Village"],
    technologies: ["React", "JavaScript", ".NET", "Umbraco", "SASS", "Grunt/Gulp"],
    description: "Worked with backend .NET & QA team to deliver multi-locale site (Europe, Asia, Middle East) on tight deadline with 2 concurrent design templates.",
  },
  {
    id: "2016-2017",
    period: "2016 - 2017",
    role: "Tech Lead",
    agencies: ["The Mill"],
    clients: ["Chevrolet"],
    achievements: ["Tech lead on groundbreaking 360° HD video experience"],
    technologies: ["JavaScript", "CSS3/SASS", "HTML5", "360 Video"],
    description: "Tech lead on groundbreaking interactive 360-degree HD video web experience for Chevrolet homepage.",
  },
  {
    id: "2011-2016",
    period: "2011 - 2016",
    role: "Freelance Frontend Developer",
    agencies: [
      "Brothers & Sisters",
      "Karmarama",
      "Blue Hive",
      "Liquid Healthcare",
      "Grand Union",
      "MRM-Meteorite",
      "Publicis Chemistry",
      "VCCP",
      "Kindred",
      "Sapient Nitro"
    ],
    clients: ["Sky", "Ford", "Porsche", "Range Rover", "BT", "Bourne Leisure", "EE", "Mercedes", "Nike", "O2", "Harley Davidson", "St Mungos"],
    technologies: ["JavaScript", "HTML5", "CSS3", "SVG", "SASS", "Git", "Responsive Design"],
    description: "Adaptive/responsive apps across mobile, tablet, and desktop. Produced wireframes, strategy documents, and technical specifications.",
  },
  {
    id: "2008-2011",
    period: "2008 - 2011",
    role: "Lead Developer",
    agencies: ["Agency.com", "TBWA/London"],
    clients: ["British Airways", "Apple", "Nike", "Zanussi", "IKEA", "Pringles", "Carbon Trust", "Canon"],
    achievements: ["Developed JSFL banner production engine"],
    technologies: ["jQuery", "JavaScript", "JSON", "REST", "Social Media APIs", "Flash"],
    description: "Lead developer on high-profile campaigns. Implemented social media strategies on Facebook and Twitter. Worked on jQuery projects and webservices.",
  },
  {
    id: "2006-2008",
    period: "2006 - 2008",
    role: "Lead Developer",
    agencies: ["sixandco / FullSix"],
    clients: ["Reckitt Benckiser", "Alfa Romeo", "P&G", "Acuvue", "Orange"],
    technologies: ["HTML", "CSS", "ActionScript 2.0", "XML", "Flash"],
    description: "Lead developer delivering interactive campaigns for major consumer brands across Europe.",
  },
  {
    id: "2003-2008",
    period: "2003 - 2008",
    role: "Developer",
    agencies: ["Spe Ltd"],
    clients: ["Nuffield"],
    technologies: ["ActionScript", "Video Editing", "Flash"],
    description: "ActionScript development and video editing for educational film production company.",
  },
  {
    id: "2000-2003",
    period: "2000 - 2003",
    role: "Graduate Developer",
    agencies: ["Victoria Real"],
    clients: ["Channel 4", "Camelot", "Pizza Hut", "Endemol", "William Hill", "Norwich Union"],
    achievements: ["Worked on original Big Brother 2000 site"],
    technologies: ["Flash", "ActionScript", "HTML", "JavaScript"],
    description: "Started career working on the original Big Brother 2000 website and various high-profile builds for major UK brands.",
  },
]


export default function EnhancedAbout() {
  const [showFullStack, setShowFullStack] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Prevent parent scroll hijacking - same as ArchivePortal
  const onWheelCapture: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1

    // If we can scroll in this direction inside, keep the event here
    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.stopPropagation()
    }
  }

  const onTouchMoveCapture: React.TouchEventHandler<HTMLDivElement> = (e) => {
    // Stop parent swipe/scroll systems hijacking touch scrolling
    e.stopPropagation()
  }

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-transparent">
      <div className="relative w-full max-w-6xl mx-auto h-full min-h-0 px-4 md:px-6 py-4 flex flex-col">
        <div 
          ref={scrollRef}
          onWheelCapture={onWheelCapture}
          onTouchMoveCapture={onTouchMoveCapture}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y space-y-12 pb-8" 
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
      
      {/* Personal Introduction */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-50">
          About Me
        </h2>
        <div className="space-y-4 text-base md:text-lg text-slate-300 leading-relaxed">
          <p>
            I'm a creative technologist with 25 years of experience building immersive digital experiences 
            that push beyond the ordinary. Based in Liverpool and working across the UK, I specialize in 
            WebGL, Three.js, React, and shader programming to create interactive 3D environments, augmented 
            reality, and virtual reality applications.
          </p>
          <p>
            My work combines technical depth with creative vision. I've developed VR tourism experiences, 
            built WebXR applications for Meta Quest, and crafted everything from particle systems to liquid 
            metal shaders. I don't just execute ideas—I solve the complex technical challenges that ambitious 
            projects demand while maintaining aesthetic integrity and performance.
          </p>
          <p>
            Beyond client work, I produce music under the <span className="text-sky-400">debx0x</span> brand, 
            handling all aspects of production and visual content creation. I'm also a 3D printing enthusiast 
            and enjoy exploring emerging AI tools for creative workflows.
          </p>
        </div>
      </section>

    

      {/* Technical Expertise */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-50">
          Technical Expertise
        </h2>

        {/* Core Hero Skills */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
            Core Specializations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "WebXR",
              "React Three Fiber",
              "Three.js",
              "WebGL/GLSL",
              "AR/VR",
              "Shaders",
              "Blender",
              "React"
            ].map(skill => (
              <div 
                key={skill}
                className="bg-gradient-to-br from-sky-500/10 to-purple-500/10 border border-sky-400/30 rounded-xl p-4 text-center hover:border-sky-400/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300"
              >
                <div className="text-lg md:text-xl font-bold text-sky-300">
                  {skill}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expandable Full Tech Stack */}
        <div>
          <button
            onClick={() => setShowFullStack(!showFullStack)}
            className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors mb-4"
          >
            <span className={`transition-transform duration-300 ${showFullStack ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <span className="font-semibold">
              {showFullStack ? 'Hide' : 'Show'} Full Tech Stack
            </span>
          </button>

          <div className={`overflow-hidden transition-all duration-500 ${
            showFullStack ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* 3D & Animation */}
              <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">
                  3D & Animation
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["React Three Fiber", "GSAP", "Blender", "Python", "GLSL/TSL", "PIXI.js", "SVG Animation", "Video Processing"].map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platforms & Frameworks */}
              <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-sky-400 mb-3 uppercase tracking-wider">
                  Platforms & Frameworks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["8th Wall", "Zappar", "PlayCanvas", "A-Frame", "Spark AR", "Meta Quest", "WebXR"].map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Development Tooling */}
              <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-pink-400 mb-3 uppercase tracking-wider">
                  Development & Tooling
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Next.js", "Vite", "Webpack", "Rollup", "Vercel", "Node.js", "TypeScript", "Git"].map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Styling & UI */}
              <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">
                  Styling & UI Frameworks
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Tailwind", "SASS", "Material UI", "Bulma", "CSS Animations", "Framer Motion"].map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emerging Technologies */}
              <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-5 md:col-span-2">
                <h4 className="text-sm font-semibold text-sky-400 mb-3 uppercase tracking-wider">
                  Emerging & Experimental
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Unity (basics)", "Unreal (basics)", "AI Workflows (ChatGPT, Claude)", "Midjourney", "Adobe Firefly", "3D Printing", "VPS Geo-targeting"].map(tech => (
                    <span key={tech} className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Philosophy */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-50">
          How I Work
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#070910]/50 border border-sky-400/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-sky-400 mb-3">
              Technical + Creative
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              I bridge technical and creative teams, translating complex concepts for non-technical 
              stakeholders while keeping development on track through Agile workflows. My background 
              in music production and visual arts informs how I approach code—every project is both 
              an engineering challenge and a creative opportunity.
            </p>
          </div>

          <div className="bg-[#070910]/50 border border-purple-400/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-purple-400 mb-3">
              Solo to Team Scale
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              From solo builds to coordinating with 3D modelers and specialists, I adapt to project 
              scale. For larger projects, I work with a talented support team including 3D artists and 
              domain specialists, allowing comprehensive AR/VR services and complex builds. Git-based 
              workflows and clear communication keep teams aligned.
            </p>
          </div>
        </div>
      </section>


      {/* Contact */}
      <section>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-50">
          Get in Touch
        </h2>
        <div className="bg-gradient-to-br from-sky-500/10 to-purple-500/10 border border-sky-400/30 rounded-xl p-8 text-center">
          <p className="text-lg text-slate-300 mb-6">
            Based in Liverpool, UK • Available for projects and collaborations
          </p>
          
          {!showContact ? (
            <button
              onClick={() => setShowContact(true)}
              className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl font-semibold text-lg transition-colors shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)]"
            >
              📧 Show Contact Details
            </button>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex flex-col gap-3 text-left bg-[#070910]/80 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider w-20">
                    Email
                  </span>
                  <a 
                    href="mailto:debbie.brooks@gmail.com" 
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    debbie.brooks@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider w-20">
                    Mobile
                  </span>
                  <a 
                    href="tel:+447799268897" 
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    07799 268897
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider w-20">
                    Location
                  </span>
                  <span className="text-slate-300">
                    Brighton-le-Sands, Liverpool, UK
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <a
                  href="/cv/Debbie-Brooks-CV.pdf"
                  download
                  className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 rounded-xl font-semibold transition-colors"
                >
                  📄 Download Full CV
                </a>
                <a
                  href="https://www.linkedin.com/in/debbie-brooks-8bb5664/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/40 text-sky-300 rounded-xl font-semibold transition-colors"
                >
                  💼 LinkedIn
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
        {/* Career Timeline */}
        <section>
         
            <CareerWheelTimeline data={CAREER_DATA} />
        </section>

        </div>
      </div>
    </div>
  )
}