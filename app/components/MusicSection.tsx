"use client"

import React, { useMemo, useState } from "react"
import ShaderFrame from "./ShaderFrame"

type VideoLike = {
  title: string
  src?: string
}

export default function MusicSection({
  title,
  subtitle,
  colors,
  bandcampUrl,
  musicTitle,
  musicDescription,
  videos,
}: {
  title: string
  subtitle: string
  colors: [string, string, string, string]
  bandcampUrl: string
  musicTitle: string
  musicDescription: string
  videos: VideoLike[]
}) {
  const [selected, setSelected] = useState<VideoLike | null>(null)
  const safeVideos = useMemo(() => videos ?? [], [videos])

  return (
    <>
      <ShaderFrame title={title} subtitle={subtitle} colors={colors} showText={false}>
        <div className="h-full flex flex-col md:flex-row gap-6 pointer-events-auto">
          <div className="w-full md:w-[350px] flex-shrink-0">
            <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-4">
              <iframe
                src={bandcampUrl}
                style={{ border: 0, width: "100%", height: "470px" }}
                allow="autoplay"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 px-5 py-4">
              <h2 className="text-lg md:text-xl font-semibold mb-1">{musicTitle}</h2>
              <p className="text-xs md:text-sm opacity-80 leading-snug">{musicDescription}</p>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeVideos.map((video, idx) => {
                const hasSrc = !!video.src
                return (
                  <div
                    key={idx}
                    className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60"
                  >
                    {hasSrc ? (
                      <button
                        type="button"
                        onClick={() => setSelected(video)}
                        className="absolute inset-0 w-full h-full group cursor-pointer"
                      >
                        <video
                          src={video.src}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-2">
                          <p className="text-[10px] md:text-xs font-medium text-white/90 tracking-[0.16em] uppercase truncate">
                            {video.title}
                          </p>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/80">
                            Tap to enlarge
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                        <div className="mb-2 text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/40">
                          Video Placeholder
                        </div>
                        <div className="h-10 w-16 rounded-md border border-dashed border-white/20" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </ShaderFrame>

      {selected && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute inset-0 w-full h-full cursor-default"
          />

          <div className="relative w-full max-w-4xl px-4">
            <div className="mb-3 text-center text-xs md:text-sm uppercase tracking-[0.2em] text-white/70">
              {selected.title}
            </div>

            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-4 rounded-full bg-black/80 border border-white/40 w-10 h-10 flex items-center justify-center text-2xl leading-none text-white hover:bg-black"
            >
              ×
            </button>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black">
              <video
                src={selected.src}
                className="absolute inset-0 w-full h-full object-contain"
                autoPlay
                controls
                playsInline
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}