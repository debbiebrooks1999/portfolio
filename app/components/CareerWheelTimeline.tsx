"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

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

export default function CareerWheelTimeline({ data }: { data: TimelineEntry[] }) {
  const items = useMemo(() => data, [data])
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Keep some padding so first/last can sit in the center "selection window"
  const ITEM_H = 64
  const VISIBLE = 7 // odd number looks most "picker-like"
  const pad = Math.floor(VISIBLE / 2) * ITEM_H

  const scrollToIndex = (i: number) => {
    const scroller = scrollerRef.current
    const el = itemRefs.current[i]
    if (!scroller || !el) return
    const top = el.offsetTop - (scroller.clientHeight / 2 - ITEM_H / 2)
    scroller.scrollTo({ top, behavior: "smooth" })
  }

  useEffect(() => {
    // Center the first item on mount
    requestAnimationFrame(() => scrollToIndex(0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const centerY = scroller.scrollTop + scroller.clientHeight / 2
        let best = 0
        let bestDist = Infinity

        for (let i = 0; i < items.length; i++) {
          const el = itemRefs.current[i]
          if (!el) continue
          const mid = el.offsetTop + el.offsetHeight / 2
          const d = Math.abs(mid - centerY)
          if (d < bestDist) {
            bestDist = d
            best = i
          }
        }
        setActiveIndex(best)
      })
    }

    scroller.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      scroller.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [items.length])

  const active = items[activeIndex]

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-slate-50">
        Career History
      </h3>

      <div className="grid md:grid-cols-[360px_1fr] gap-6">
        {/* Wheel */}
        <div className="relative">
          {/* Selection window */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[64px] rounded-xl border border-sky-400/40 bg-sky-500/10 shadow-[0_0_30px_rgba(56,189,248,0.12)]" />
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-10 bg-gradient-to-b from-[#050609] to-transparent z-10" />
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-10 bg-gradient-to-t from-[#050609] to-transparent z-10" />

          <div
            ref={scrollerRef}
            className="h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-[#070910]/70 backdrop-blur-sm"
            style={{
              scrollSnapType: "y mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* padding so ends can center */}
            <div style={{ height: pad }} />

            {items.map((e, i) => {
              const dist = Math.abs(i - activeIndex)
              // simple "wheel illusion"
              const scale = Math.max(0.82, 1 - dist * 0.06)
              const opacity = Math.max(0.35, 1 - dist * 0.18)

              return (
                <div
                  key={e.id}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className="px-4"
                >
                  <div
                    onClick={() => scrollToIndex(i)}
                    className="h-[64px] flex items-center gap-3 cursor-pointer rounded-xl"
                    style={{
                      scrollSnapAlign: "center",
                      transform: `scale(${scale})`,
                      opacity,
                      transition: "transform 120ms ease, opacity 120ms ease",
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        i === activeIndex ? "bg-sky-400" : "bg-purple-400/70"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-mono text-sky-300">
                        {e.period}
                      </div>
                      <div className="text-sm text-slate-100 truncate">
                        {e.role ?? "Role"}
                        <span className="text-slate-400"> · </span>
                        <span className="text-slate-300 truncate">
                          {e.agencies[0]}
                          {e.agencies.length > 1 ? ` +${e.agencies.length - 1}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div style={{ height: pad }} />
          </div>
        </div>

        {/* Details panel - now with overflow-y-auto and matching height */}
        <div className="h-[420px] bg-[#070910]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-5 md:p-7 overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-sky-400 mb-1">
                {active.period}
              </div>
              <div className="text-xl md:text-2xl font-semibold text-slate-50">
                {active.role}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {activeIndex + 1} / {items.length}
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {active.description}
          </p>

          {/* Achievements */}
          {active.achievements?.length ? (
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Key Achievements
              </div>
              <ul className="space-y-1">
                {active.achievements.map((a, idx) => (
                  <li key={idx} className="text-sm text-sky-300 flex gap-2">
                    <span className="text-sky-400">→</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Clients */}
          {active.clients?.length ? (
            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Clients
              </div>
              <div className="flex flex-wrap gap-2">
                {active.clients.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 bg-[#0b1018] border border-white/10 rounded text-[11px] text-slate-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Tech */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Technologies
            </div>
            <div className="flex flex-wrap gap-2">
              {active.technologies.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-slate-800/50 border border-slate-700 rounded text-[11px] text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Agencies */}
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Agencies / Studios
            </div>
            <div className="flex flex-wrap gap-2">
              {active.agencies.map((a) => (
                <span
                  key={a}
                  className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-[11px] text-purple-200"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Optional controls */}
          <div className="mt-6 flex gap-2">
            <button
              className="px-3 py-2 rounded-xl border border-white/10 bg-[#0b1018] text-sm text-slate-200 hover:border-sky-400/40 transition-colors"
              onClick={() => scrollToIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
            >
              ↑ Previous
            </button>
            <button
              className="px-3 py-2 rounded-xl border border-white/10 bg-[#0b1018] text-sm text-slate-200 hover:border-sky-400/40 transition-colors"
              onClick={() => scrollToIndex(Math.min(items.length - 1, activeIndex + 1))}
              disabled={activeIndex === items.length - 1}
            >
              ↓ Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}