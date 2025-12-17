"use client"

import React, { useState } from "react"

type Slide = {
  title?: string
  subtitle?: string
  imageSrc?: string
  videoSrc?: string
  qrSrc?: string
}

type SimpleFrameProps = {
  title?: string
  subtitle?: string
  className?: string
  slides?: Slide[]
  showText?: boolean
  children?: React.ReactNode
  borderColor?: string
  borderWidth?: string
}

export default function SimpleFrame({
  title = "Liquid Meta",
  subtitle = "Variation",
  className = "",
  slides,
  showText = true,
  children,
  borderColor = "rgba(255, 255, 255, 0.2)",
  borderWidth = "2px",
}: SimpleFrameProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const hasSlides = (slides?.length ?? 0) > 0
  const hasMultipleSlides = (slides?.length ?? 0) > 1 && !children
  const currentSlide = hasSlides ? slides![slideIndex] : undefined

  const nextSlide = () => {
    if (!slides || slides.length <= 1) return
    setSlideIndex((i) => (i + 1) % slides.length)
  }

  const prevSlide = () => {
    if (!slides || slides.length <= 1) return
    setSlideIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  const resolvedTitle = currentSlide?.title ?? title
  const resolvedSubtitle = currentSlide?.subtitle ?? subtitle
  const resolvedImageSrc = currentSlide?.imageSrc ?? "/city.png"
  const resolvedVideoSrc = currentSlide?.videoSrc ?? "/videos/video.mp4"
  const resolvedQrSrc = currentSlide?.qrSrc ?? "/qr/Xcited_Timeline-QR_Code.png"

  return (
    <div
      className={`relative w-full h-[80vh] ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      {/* Simple border outline */}
      <div
        className="absolute inset-0 rounded-[30px]"
        style={{
          border: `${borderWidth} solid ${borderColor}`,
        }}
      >
        {/* Content container */}
        <div className="h-full flex items-center justify-center p-6">
          <div className="w-full h-full max-w-7xl max-h-[85vh] flex flex-col p-8">
            {children ? (
              <div className="h-full w-full">{children}</div>
            ) : (
              <div className="flex flex-col md:flex-row h-full gap-6">
                {/* Left: Image */}
                <div className="w-full md:w-1/4 flex-shrink-0 h-full">
                  <div className="h-full rounded-2xl overflow-hidden">
                    <img
                      src={resolvedImageSrc}
                      alt="Project preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Middle: Video / QR */}
                <div className="flex-1 h-full">
                  <div className="h-full rounded-2xl overflow-hidden">
                    {resolvedVideoSrc ? (
                      <video
                        src={resolvedVideoSrc}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : resolvedQrSrc ? (
                      <div className="w-full h-full flex items-center justify-center p-12">
                        <div className="bg-white p-6 rounded-2xl aspect-square max-w-md w-full">
                          <img
                            src={resolvedQrSrc}
                            alt="QR Code"
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Right: Text */}
                {showText && (
                  <div className="w-full md:w-1/5 flex-shrink-0 flex flex-col justify-center text-left">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">
                      {resolvedTitle}
                    </h2>
                    <p className="opacity-80 text-xs md:text-sm lg:text-base leading-snug">
                      {resolvedSubtitle}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide navigation */}
      {hasMultipleSlides && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs md:text-sm hover:bg-black/80 transition"
          >
            Prev
          </button>
          <div className="flex items-center gap-2">
            {slides!.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-2.5 w-2.5 rounded-full border border-white/40 transition ${
                  i === slideIndex ? "bg-white" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="px-3 py-1 rounded-xl bg-black/60 border border-white/20 text-xs md:text-sm hover:bg-black/80 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}