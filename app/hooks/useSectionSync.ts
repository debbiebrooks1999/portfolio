// hooks/useSectionSync.ts
'use client';

import { useEffect, useMemo } from 'react';

export default function useSectionSync({
  count,
  start = 0,
  onActiveChange,
}: {
  count: number;
  start?: number;
  onActiveChange?: (i: number) => void;
}) {
  // Stable array of refs (if you attach them directly)
  const refs = useMemo(
    () => Array.from({ length: count }, () => ({ current: null as HTMLDivElement | null })),
    [count]
  );

  // On mount, scroll to starting section (client only)
  useEffect(() => {
    // Check for query string parameter first
    const params = new URLSearchParams(window.location.search);
    const patternParam = params.get('pattern');
    
    let initialIndex = start;
    if (patternParam !== null) {
      const parsed = parseInt(patternParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < count) {
        initialIndex = parsed;
      }
    }
    
    const el = document.querySelector<HTMLElement>(`[data-index="${initialIndex}"]`);
    el?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
    
    // Keep URL in sync initially
    const url = new URL(window.location.href);
    url.searchParams.set('pattern', String(initialIndex));
    window.history.replaceState({}, '', url);
    
    // Notify parent of initial state
    onActiveChange?.(initialIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observe which section is most visible → update URL + notify parent
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.index ?? 0);

        // Update URL without navigation (no scroll)
        const url = new URL(window.location.href);
        url.searchParams.set('pattern', String(idx));
        window.history.replaceState({}, '', url);

        onActiveChange?.(idx);
      },
      { threshold: [0.55, 0.75, 0.9] }
    );

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-index]'));
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [onActiveChange, count]);

  return { refs };
}