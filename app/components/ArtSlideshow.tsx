// ArtSlideshow.tsx
import { useState } from "react"
import ShaderFrame from "./ShaderFrame" 

type ArtSlide = {
  id: number
  headline: string
  subline: string
  layout: "triple" | "facebook"
} & (
  | {
      layout: "triple"
      image1Src: string
      image1Alt: string
      image2Src: string
      image2Alt: string
      videoSrc: string
      title: string
      body: string
    }
  | {
      layout: "facebook"
      heroSrc: string
      heroAlt: string
      facebookSrc: string
      title: string
      body: string
    }
)

interface ArtSlideshowProps {
  sectionName: string
  sectionText: string
  colors: string[]
  slides: ArtSlide[]
}

export function ArtSlideshow({
  sectionName,
  sectionText,
  colors,
  slides,
}: ArtSlideshowProps) {
  const [slideIndex, setSlideIndex] = useState(0)

  const currentSlide = slides[slideIndex]
  const totalSlides = slides.length

  const goPrev = () =>
    setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides)

  const goNext = () => setSlideIndex((prev) => (prev + 1) % totalSlides)

  return (
    <ShaderFrame
      title={sectionName}
      subtitle={sectionText}
      showText={false}
    >
      {/* Headline & Subline */}
      <div className="text-center mb-6 pointer-events-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">
          {currentSlide.headline}
        </h2>
        <p className="text-base md:text-lg text-white/70">
          {currentSlide.subline}
        </p>
      </div>

      {/* Main layout with navigation */}
      <div className="flex items-center gap-6 h-full pointer-events-auto">
        {/* Desktop Left Arrow */}
        <button
          onClick={goPrev}
          className="
            hidden md:flex
            items-center justify-center
            rounded-full border border-white/40 bg-black/60
            hover:bg-black/80 hover:scale-105
            transition-transform transition-colors
            w-14 h-14 text-3xl
            shrink-0
          "
          aria-label="Previous slide"
        >
          ‹
        </button>

        {/* Mobile Left Arrow */}
        <button
          onClick={goPrev}
          className="
            md:hidden
            absolute left-4 top-4 z-10
            rounded-full bg-black/70 px-3 py-2 text-lg
          "
          aria-label="Previous slide"
        >
          ‹
        </button>

        {/* Slide Content */}
        <div className="flex-1 h-full">
          {currentSlide.layout === "triple" ? (
            <TripleLayout slide={currentSlide} />
          ) : (
            <FacebookLayout slide={currentSlide} />
          )}
        </div>

        {/* Desktop Right Arrow */}
        <button
          onClick={goNext}
          className="
            hidden md:flex
            items-center justify-center
            rounded-full border border-white/40 bg-black/60
            hover:bg-black/80 hover:scale-105
            transition-transform transition-colors
            w-14 h-14 text-3xl
            shrink-0
          "
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Mobile Right Arrow */}
        <button
          onClick={goNext}
          className="
            md:hidden
            absolute right-4 top-4 z-10
            rounded-full bg-black/70 px-3 py-2 text-lg
          "
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      {/* Slide Indicator */}
      <div className="w-full text-center mt-6 text-sm tracking-[0.2em] uppercase text-white/60">
        Slide {currentSlide.id + 1} / {totalSlides}
      </div>
    </ShaderFrame>
  )
}

// Triple Layout: 2 images top, video + text bottom
function TripleLayout({
  slide,
}: {
  slide: Extract<ArtSlide, { layout: "triple" }>
}) {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top row: 2 images */}
      <div className="flex gap-4 h-1/2">
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          <img
            src={slide.image1Src}
            alt={slide.image1Alt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          <img
            src={slide.image2Src}
            alt={slide.image2Alt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom row: video + text */}
      <div className="flex flex-col md:flex-row gap-4 h-1/2">
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          <video
            src={slide.videoSrc}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <div className="w-full md:w-1/3 rounded-2xl border border-white/10 bg-black/40 p-5 flex flex-col justify-center">
          <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
            {slide.title}
          </h3>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            {slide.body}
          </p>
        </div>
      </div>
    </div>
  )
}

// Facebook Layout: Image left, Facebook feed + text right
function FacebookLayout({
  slide,
}: {
  slide: Extract<ArtSlide, { layout: "facebook" }>
}) {
  return (
    <div className="flex flex-col md:flex-row h-full gap-4">
      {/* Left: hero image */}
      <div className="w-full md:w-1/3 flex-shrink-0 h-full">
        <div className="h-full rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          <img
            src={slide.heroSrc}
            alt={slide.heroAlt}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right: Facebook embed + text underneath */}
      <div className="flex-1 h-full flex flex-col gap-4">
        {/* Facebook embed */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center p-4">
          <iframe
            src={slide.facebookSrc}
            width="267"
            height="476"
            style={{
              border: "none",
              overflow: "hidden",
            }}
            scrolling="no"
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Text content underneath */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h3 className="text-xl md:text-2xl font-semibold mb-3 text-white">
            {slide.title}
          </h3>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            {slide.body}
          </p>
        </div>
      </div>
    </div>
  )
}

export type { ArtSlide }