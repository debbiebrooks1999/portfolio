"use client"

import React, { useRef } from "react"

export default function EnhancedAbout() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const onWheelCapture: React.WheelEventHandler<HTMLDivElement> = (e) => {
    const el = scrollRef.current
    if (!el) return

    const { scrollTop, scrollHeight, clientHeight } = el
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1

    if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) {
      e.stopPropagation()
    }
  }

  const onTouchMoveCapture: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
  }

  return (
   <div className="relative w-full h-full min-h-0 overflow-hidden">
      <div className="relative max-w-7xl mx-auto h-full px-0 md:px-6 md:py-4 flex flex-col">
        <div
          ref={scrollRef}
          onWheelCapture={onWheelCapture}
          onTouchMoveCapture={onTouchMoveCapture}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-[calc(env(safe-area-inset-bottom)+96px)]">
            {/* LEFT COLUMN */}
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-3 text-slate-50">About Me</h2>
                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p>
                    I'm a creative technologist with 25 years of experience building immersive digital
                    experiences across WebGL, Three.js, React, AR, and VR.
                  </p>
                  <p>
                    I specialize in solving complex technical challenges for ambitious interactive
                    projects — from shaders and particle systems to full WebXR environments.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-50">How I Work</h2>
                <div className="space-y-4">
                  <div className="bg-[#070910]/50 border border-sky-400/20 rounded-xl p-4">
                    <h3 className="text-base font-semibold text-sky-400 mb-2">Technical + Creative</h3>
                    <p className="text-sm text-slate-300">
                      I bridge creative and technical teams, translating complex ideas into performant,
                      maintainable systems without losing visual intent.
                    </p>
                  </div>

                  <div className="bg-[#070910]/50 border border-purple-400/20 rounded-xl p-4">
                    <h3 className="text-base font-semibold text-purple-400 mb-2">Solo to Team Scale</h3>
                    <p className="text-sm text-slate-300">
                      From solo builds to multi-disciplinary teams, I adapt workflows using Git, clear
                      communication, and modular architecture.
                    </p>
                  </div>

                  <div className="bg-[#070910]/50 border border-purple-400/20 rounded-xl p-4">
                    <h3 className="text-base font-semibold text-purple-400 mb-2">Solo to Team Scale</h3>
                    <p className="text-sm text-slate-300">
                      From solo builds to multi-disciplinary teams, I adapt workflows using Git, clear
                      communication, and modular architecture.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">

              <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-50">Technical Expertise</h2>

                {/* Core Skills */}
                <div className="flex flex-wrap gap-1">
                    {[
                      "WebXR",
                      "Three.js",
                      "R3F",
                      "WebGL/GLSL",
                      "AR/VR",
                      "Shaders",
                      "Blender",
                      "React",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className="px-1.5 py-0.5 text-[10px] leading-tight
                                  rounded bg-slate-800/60 border border-slate-700
                                  text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                {/* PERMANENT FULL STACK UI (always expanded) */}
                <div className="bg-[#070910]/40 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-200">Full Tech Stack</h3>
                    <span className="text-[11px] text-slate-400">Always visible</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 3D & Animation */}
                    <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                        3D & Animation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "React Three Fiber",
                          "GSAP",
                          "Blender",
                          "Python",
                          "GLSL/TSL",
                          "PIXI.js",
                          "SVG Animation",
                          "Video Processing",
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700 rounded text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Platforms & Frameworks */}
                    <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wider">
                        Platforms & Frameworks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["8th Wall", "Zappar", "PlayCanvas", "A-Frame", "Meta Quest SDK", "WebXR"].map(
                          (tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700 rounded text-slate-300"
                            >
                              {tech}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Development Tooling */}
                    <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-pink-400 mb-2 uppercase tracking-wider">
                        Development & Tooling
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Next.js", "Vite", "Webpack", "Rollup", "Vercel", "Node.js", "TypeScript", "Git"].map(
                          (tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700 rounded text-slate-300"
                            >
                              {tech}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Styling & UI */}
                    <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                        Styling & UI Frameworks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["Tailwind", "SASS", "Material UI", "Bulma", "CSS Animations", "Framer Motion"].map(
                          (tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700 rounded text-slate-300"
                            >
                              {tech}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    {/* Emerging Technologies */}
                    <div className="bg-[#070910]/50 border border-white/10 rounded-xl p-4 md:col-span-2">
                      <h4 className="text-xs font-semibold text-sky-400 mb-2 uppercase tracking-wider">
                        Emerging & Experimental
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Unity (basics)",
                          "Unreal (basics)",
                          "MCP AI Workflows (ChatGPT, Claude)",
                          "LLMs",
                          "Adobe Firefly",
                          "3D Printing",
                          "VPS Geo-targeting",
                        ].map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 text-[11px] bg-slate-800/50 border border-slate-700 rounded text-slate-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}