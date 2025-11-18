'use client';
import React, {
  forwardRef,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

export type SectionsHandle = { scrollTo: (index: number, behavior?: ScrollBehavior) => void };

type SectionItem = {
  id: string;
  name?: string;
  /** Prefer using render to avoid rebuilding parent on active index changes */
  render?: (isActive: boolean) => React.ReactNode;
  /** Fallback: static content if you don't provide render */
  content?: React.ReactNode;
};

type Props = {
  sections: SectionItem[];
  onSectionChange?: (i: number) => void;
  initialIndex?: number;
  enableKeyboardNav?: boolean;
  enableWheelSnap?: boolean;
  onActiveChange?: (index: number, id: string) => void
  debugInView?: boolean
};

const SECTION_STYLE: React.CSSProperties = {
  minHeight: '100vh',
  scrollSnapAlign: 'start',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  pointerEvents: 'auto',
};

const SCROLLER_STYLE: React.CSSProperties = {
  height: '100vh',
  width: '100%',
  overflowY: 'auto',
  scrollSnapType: 'y mandatory',
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const Sections = forwardRef<SectionsHandle, Props>(function Sections(
  {
    sections,
    onSectionChange,
    initialIndex = 0,
    enableKeyboardNav = true,
    enableWheelSnap = false,
  },
  ref
) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const wheelCooldownRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Keep refs array aligned to sections
  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill(null);
  }, [sections.length]);

  const setSectionRef = useCallback(
    (idx: number) => (el: HTMLElement | null) => {
      sectionRefs.current[idx] = el;
    },
    []
  );

  const scrollTo = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const t = sectionRefs.current[index];
    if (t) t.scrollIntoView({ behavior, block: 'start' });
  }, []);

  useImperativeHandle(ref, () => ({ scrollTo }), [scrollTo]);

  // Initial scroll
  useEffect(() => {
    const idx = clamp(initialIndex, 0, sections.length - 1);
    const t = sectionRefs.current[idx];
    if (t) t.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
  }, [initialIndex, sections.length]);

  // Intersection observer
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        let bestIdx = activeIndex;
        let bestRatio = -1;
        for (const e of entries) {
          const idxAttr = (e.target as HTMLElement).dataset.index;
          if (idxAttr == null) continue;
          const idx = Number(idxAttr);
          if (e.intersectionRatio > bestRatio) {
            bestRatio = e.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestIdx !== -1 && bestIdx !== activeIndex) {
          setActiveIndex(bestIdx);
          onSectionChange?.(bestIdx);
        }
      },
      { root, threshold: Array.from({ length: 11 }, (_, i) => i / 10) }
    );

    sectionRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [onSectionChange, sections.length, activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav) return;
    const el = scrollerRef.current;
    if (!el) return;

    const handler = (e: KeyboardEvent) => {
      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'];
      if (!keys.includes(e.key)) return;

      e.preventDefault();
      const curr = activeIndex < 0 ? 0 : activeIndex;
      if (e.key === 'Home') return scrollTo(0);
      if (e.key === 'End') return scrollTo(sections.length - 1);

      const delta =
        e.key === 'ArrowDown' || e.key === 'PageDown'
          ? 1
          : e.key === 'ArrowUp' || e.key === 'PageUp'
          ? -1
          : 0;

      const next = clamp(curr + delta, 0, sections.length - 1);
      if (next !== curr) scrollTo(next);
    };

    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [enableKeyboardNav, sections.length, scrollTo, activeIndex]);

  // Wheel snap
  useEffect(() => {
    if (!enableWheelSnap) return;
    const el = scrollerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now < wheelCooldownRef.current) return;
      if (Math.abs(e.deltaY) < 10) return;

      e.preventDefault();
      const curr = activeIndex < 0 ? 0 : activeIndex;
      const next = clamp(curr + (e.deltaY > 0 ? 1 : -1), 0, sections.length - 1);
      if (next !== curr) {
        scrollTo(next);
        wheelCooldownRef.current = now + 450;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, [enableWheelSnap, sections.length, scrollTo, activeIndex]);

  const rendered = useMemo(
    () =>
      sections.map((s, i) => {
        const isActive = i === activeIndex;
        return (
          <section
            key={s.id ?? s.name ?? i}
            id={s.id}
            data-index={i}
            ref={setSectionRef(i)}
            style={SECTION_STYLE}
            tabIndex={0}
          >
            {s.render ? s.render(isActive) : s.content}
          </section>
        );
      }),
    [sections, setSectionRef, activeIndex]
  );

  return (
    <div ref={scrollerRef} style={SCROLLER_STYLE} tabIndex={0} aria-label="Sections scroller">
      {rendered}
    </div>
  );
});

export default Sections;
