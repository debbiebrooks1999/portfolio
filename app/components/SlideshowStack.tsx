import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface SlideContent {
  image: string;
  title: string;
  actions: { label: string; href: string }[];
}

interface SlideshowStackProps {
  slides?: SlideContent[];
  className?: string;
  transitionSec?: number;
  expandedFr?: number;
}

const defaultSlides: SlideContent[] = [
  {
    image: 'https://placehold.co/1920x1080/667eea/ffffff/png?text=Panel+1',
    title: 'Timeless bags and modular kits designed for life in motion',
    actions: [
      { label: 'Shop Luggage', href: '#' },
      { label: 'Shop Bags', href: '#' }
    ]
  },
  {
    image: 'https://placehold.co/1920x1080/f093fb/ffffff/png?text=Panel+2',
    title: 'Sustainable, innovative design for conscious travelers',
    actions: [
      { label: 'Explore Collection', href: '#' },
      { label: 'Learn More', href: '#' }
    ]
  },
  {
    image: 'https://placehold.co/1920x1080/4facfe/ffffff/png?text=Panel+3',
    title: 'Crafted for adventure, built to last a lifetime of exploration',
    actions: [
      { label: 'Shop Adventure', href: '#' },
      { label: 'View Stories', href: '#' }
    ]
  },
  {
    image: 'https://placehold.co/1920x1080/00f2c3/ffffff/png?text=Panel+4',
    title: 'Premium materials, thoughtful details, and uncompromising quality',
    actions: [
      { label: 'Discover More', href: '#' },
      { label: 'Shop Premium', href: '#' }
    ]
  }
];

// --- math + utils ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const mixArrays = (from: number[], to: number[], t: number) => from.map((v, i) => lerp(v, to[i] ?? v, t));
const formatGrid = (sizes: number[]) => sizes.map(n => `${n}fr`).join(' ');
const makeSizes = (total: number, activeIndex: number, expanded: number) =>
  Array(total).fill(1).map((_, i) => (i === activeIndex ? expanded : 1));

const SlideshowStack: React.FC<SlideshowStackProps> = ({
  slides = defaultSlides,
  className = '',
  transitionSec = 1.2,
  expandedFr = 20
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<any>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const totalTabs = slides.length;

  const killTween = useCallback(() => {
    if (tweenRef.current) {
      tweenRef.current.kill();
      tweenRef.current = null;
    }
  }, []);

  const setGridFromSizes = useCallback((sizes: number[]) => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--active-tab', formatGrid(sizes));
    }
  }, []);

  const writeCurrentLayout = useCallback(
    (index: number) => {
      setGridFromSizes(makeSizes(totalTabs, index, expandedFr));
    },
    [setGridFromSizes, totalTabs, expandedFr]
  );

  // --- transition animation ---
  const animateToTab = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= totalTabs || nextIndex === activeTab) return;

      killTween();

      const from = makeSizes(totalTabs, activeTab, expandedFr);
      const to = makeSizes(totalTabs, nextIndex, expandedFr);
      const state = { t: 0 };

      tweenRef.current = gsap.to(state, {
        t: 1,
        duration: transitionSec,
        ease: 'power2.inOut',
        onUpdate: () => setGridFromSizes(mixArrays(from, to, state.t)),
        onComplete: () => {
          setActiveTab(nextIndex);
          tweenRef.current = null;
        }
      });

      // Immediately update active content for fade timing
      setActiveTab(nextIndex);
    },
    [activeTab, expandedFr, totalTabs, transitionSec, setGridFromSizes, killTween]
  );

  // --- drag handlers ---
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const target = event.target as HTMLElement;
      const tab = target.closest('[role="tab"]') as HTMLElement | null;
      if (!tab) return;

      const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
      const tabIndex = tabs.indexOf(tab);
      if (tabIndex === -1 || tabIndex === activeTab) return;

      const containerRect = container.getBoundingClientRect();
      const panels = container.querySelector('.slideshow-stack__panels') as HTMLElement | null;
      const isHorizontal = panels
        ? window.getComputedStyle(panels).gridTemplateColumns.split(' ').length > 1
        : true;

      dragStateRef.current = {
        tabIndex,
        targetTabIndex: tabIndex,
        activeIndex: activeTab,
        isHorizontal,
        startX: event.clientX,
        startY: event.clientY,
        isDragging: false,
        currentProgress: 0,
        originalSizes: makeSizes(totalTabs, activeTab, expandedFr),
        maxDistance: (isHorizontal ? containerRect.width : containerRect.height) * 0.8,
        expandLeft: tabIndex > activeTab
      };

      event.preventDefault();
    },
    [activeTab, totalTabs, expandedFr]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragStateRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const delta = drag.isHorizontal ? dx : dy;
      const traveled = Math.hypot(dx, dy);

      if (!drag.isDragging && traveled >= 5) {
        drag.isDragging = true;
        setIsDragging(true);
        killTween();
      }

      if (!drag.isDragging) return;

      const correctDir = drag.expandLeft ? delta < 0 : delta > 0;
      if (!correctDir) return;

      const progress = clamp01(Math.abs(delta) / drag.maxDistance);
      drag.currentProgress = progress;

      const to = makeSizes(totalTabs, drag.targetTabIndex, expandedFr);
      const mixed = mixArrays(drag.originalSizes, to, progress);
      setGridFromSizes(mixed);
    },
    [setGridFromSizes, expandedFr, totalTabs, killTween]
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragStateRef.current;
    if (!drag) return;

    setIsDragging(false);

    if (drag.isDragging && drag.currentProgress >= 0.5) {
      animateToTab(drag.targetTabIndex);
    } else {
      writeCurrentLayout(drag.activeIndex);
    }

    dragStateRef.current = null;
  }, [animateToTab, writeCurrentLayout]);

  useEffect(() => {
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // --- initialize layout ---
  useEffect(() => {
    if (containerRef.current) {
      writeCurrentLayout(activeTab);
      containerRef.current.style.setProperty('--total-tabs', String(totalTabs));
    }
  }, [activeTab, totalTabs, writeCurrentLayout]);

  // --- render ---
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        data-dragging={isDragging || undefined}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '2rem',
          overflow: 'hidden',
          touchAction: 'none',
          containerType: 'inline-size',
          ['--button-width' as any]: '4rem',
          ['--panel-padding' as any]: '2rem',
          ['--border-width' as any]: '2px',
          ['--border-color' as any]: 'rgba(255, 255, 255, 0.2)',
          ['--total-tabs' as any]: totalTabs
        }}
      >
        {/* Tab buttons overlay */}
        <div
          className="slideshow-stack__tablist"
          role="tablist"
          aria-label="Featured content"
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--active-tab)',
            listStyle: 'none',
            padding: 0,
            position: 'absolute',
            inset: 0,
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            transition: isDragging ? 'none' : 'grid-template-columns 1.2s cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          {slides.map((_, index) => (
            <div key={index} style={{ width: 'var(--button-width)', height: '100%' }}>
              <button
                role="tab"
                aria-selected={index === activeTab}
                aria-controls={`panel-${index + 1}`}
                id={`tab-${index + 1}`}
                tabIndex={index === activeTab ? 0 : -1}
                onClick={() => animateToTab(index)}
                onPointerDown={handlePointerDown}
                style={{
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'all',
                  opacity: 0,
                  cursor: index === activeTab ? 'default' : 'grab',
                  border: 'none',
                  background: 'transparent'
                }}
              >
                <span className="sr-only">Tab {index + 1}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Panels */}
        <div
          className="slideshow-stack__panels"
          style={{
            display: 'grid',
            gridTemplateColumns: 'var(--active-tab)',
            height: '100%',
            overflow: 'hidden',
            transition: isDragging ? 'none' : 'grid-template-columns 1.2s cubic-bezier(0.65, 0, 0.35, 1)'
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              role="tabpanel"
              tabIndex={0}
              id={`panel-${index + 1}`}
              aria-labelledby={`tab-${index + 1}`}
              {...(index !== activeTab ? { inert: true as any } : {})}
              style={{
                position: 'relative',
                height: '100%',
                minWidth: 'var(--button-width)',
                borderRadius: '2rem',
                zIndex: totalTabs - index
              }}
            >
              <div
                style={{
                  border: 'var(--border-width) solid var(--border-color)',
                  borderRadius: '2rem',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  overflow: 'hidden',
                  width:
                    index === 0
                      ? 'calc((100cqi - ((var(--total-tabs) - 1) * var(--button-width))))'
                      : 'calc((100cqi - ((var(--total-tabs) - 1) * var(--button-width))) + 4rem)'
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding:
                      index !== 0
                        ? 'var(--panel-padding) var(--panel-padding) var(--panel-padding) calc(4rem + var(--panel-padding))'
                        : 'var(--panel-padding)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6) 40%)',
                    containerType: 'inline-size'
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(1.5rem, 5cqi, 3rem)',
                      color: '#fff',
                      lineHeight: 1.2,
                      fontWeight: 300,
                      maxWidth: '75%',
                      zIndex: 2,
                      display: 'grid',
                      gap: '1rem',
                      opacity: index === activeTab ? 1 : 0,
                      transform: index === activeTab ? 'translateY(0)' : 'translateY(0.5lh)',
                      transition:
                        'opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1), transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
                      transitionDelay: index === activeTab ? '0.4s' : '0s'
                    }}
                  >
                    <p style={{ textWrap: 'balance', margin: 0 }}>{slide.title}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {slide.actions.map((action, i) => (
                        <a
                          key={i}
                          href={action.href}
                          style={{
                            borderRadius: '100px',
                            background: 'transparent',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.875rem',
                            border: '2px solid #fff',
                            color: '#fff',
                            textDecoration: 'none',
                            fontWeight: 'normal',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fff';
                            e.currentTarget.style.color = '#000';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#fff';
                          }}
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        [data-dragging] * {
          cursor: grabbing !important;
        }

        [data-dragging] .slideshow-stack__tablist,
        [data-dragging] .slideshow-stack__panels {
          transition: none !important;
        }

        @media (max-width: 500px) {
          .slideshow-stack__tablist {
            grid-template-columns: unset !important;
            grid-template-rows: var(--active-tab) !important;
          }

          .slideshow-stack__tablist button {
            width: 100% !important;
            height: var(--button-width) !important;
          }

          .slideshow-stack__panels {
            grid-template-columns: unset !important;
            grid-template-rows: var(--active-tab) !important;
          }

          [role="tabpanel"] {
            width: 100% !important;
            min-height: var(--button-width) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SlideshowStack;