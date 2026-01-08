"use client"

import React, { useState } from 'react'

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


export default function CareerTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
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

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h3 className="text-2xl md:text-3xl font-bold mb-8 text-slate-50">
        Career History
      </h3>

      <div className="relative">
        {/* Timeline line with interactive dots */}
        <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-500 via-purple-500 to-pink-500" />

        {/* Timeline entries */}
        <div className="space-y-8">
          {CAREER_DATA.map((entry, index) => {
            const isExpanded = expandedId === entry.id
            const isRecent = index < 3 // Highlight recent positions

            return (
              <div key={entry.id} className="relative pl-6 md:pl-20">
                {/* Interactive timeline dot - CLICKABLE HOTSPOT */}
                <button
                  onClick={() => toggleExpand(entry.id)}
                  className={`absolute left-[-12px] md:left-[20px] top-2 w-7 h-7 rounded-full border-2 transition-all duration-300 z-10 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050609] ${
                    isRecent 
                      ? 'bg-sky-400 border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.8)] hover:shadow-[0_0_30px_rgba(56,189,248,1)] focus:ring-sky-400' 
                      : 'bg-purple-400 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] hover:shadow-[0_0_25px_rgba(168,85,247,1)] focus:ring-purple-400'
                  } ${
                    isExpanded 
                      ? 'scale-110 ring-2 ring-white/30' 
                      : 'hover:ring-2 hover:ring-white/20'
                  }`}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${entry.period}`}
                >
                  {/* Pulse animation when clickable */}
                  {!isExpanded && (
                    <span className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                      isRecent ? 'bg-sky-400' : 'bg-purple-400'
                    }`} />
                  )}
                  
                  {/* Plus/Minus icon */}
                  <span className="absolute inset-0 flex items-center justify-center text-slate-950 font-bold text-xs">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>

                {/* Content card - also clickable */}
                <div 
                  className={`group cursor-pointer bg-[#070910]/90 backdrop-blur-sm border rounded-xl p-4 md:p-6 transition-all duration-300 ${
                    isExpanded 
                      ? 'border-sky-400/60 shadow-[0_0_30px_rgba(56,189,248,0.2)]' 
                      : 'border-white/10 hover:border-sky-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]'
                  }`}
                  onClick={() => toggleExpand(entry.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs md:text-sm font-mono text-sky-400">
                          {entry.period}
                        </span>
                        {isRecent && (
                          <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-500/30 rounded-full text-[10px] text-sky-300">
                            Current Era
                          </span>
                        )}
                      </div>
                      {entry.role && (
                        <h4 className="text-lg md:text-xl font-semibold text-slate-50 mb-2">
                          {entry.role}
                        </h4>
                      )}
                    </div>
                    
                    {/* Expand/collapse indicator - shows card is clickable too */}
                    <div className={`text-slate-400 transition-transform duration-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Agencies (always visible) */}
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {entry.agencies.map((agency) => (
                        <span
                          key={agency}
                          className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-[11px] text-purple-200"
                        >
                          {agency}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Brief description (always visible) */}
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    {entry.description}
                  </p>

                  {/* Expanded content */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {/* Achievements */}
                    {entry.achievements && entry.achievements.length > 0 && (
                      <div className="mb-4 pt-3 border-t border-white/5">
                        <h5 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Key Achievements
                        </h5>
                        <ul className="space-y-1">
                          {entry.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-sky-300 flex items-start gap-2">
                              <span className="text-sky-400 mt-1">→</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Clients */}
                    {entry.clients.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Clients
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {entry.clients.map((client) => (
                            <span
                              key={client}
                              className="px-2 py-0.5 bg-[#0b1018] border border-white/10 rounded text-[11px] text-slate-300"
                            >
                              {client}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technologies */}
                    <div>
                      <h5 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                        Technologies
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {entry.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[11px] text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hint text */}
                  {!isExpanded && (
                    <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full bg-sky-400/30 border border-sky-400/50" />
                      Click dot or card to see full details
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-[#070910]/50 border border-white/10 rounded-xl">
          <div className="text-3xl font-bold text-sky-400 mb-1">25</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Years Experience</div>
        </div>
        <div className="text-center p-4 bg-[#070910]/50 border border-white/10 rounded-xl">
          <div className="text-3xl font-bold text-purple-400 mb-1">30+</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Agencies</div>
        </div>
        <div className="text-center p-4 bg-[#070910]/50 border border-white/10 rounded-xl">
          <div className="text-3xl font-bold text-pink-400 mb-1">50+</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Major Clients</div>
        </div>
        <div className="text-center p-4 bg-[#070910]/50 border border-white/10 rounded-xl">
          <div className="text-3xl font-bold text-sky-400 mb-1">100+</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Projects Delivered</div>
        </div>
      </div>
    </div>
  )
}