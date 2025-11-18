import React, { useCallback, useMemo, useState } from 'react';
import Header from './Header';
import Sections from './Sections';
import CanvasBackground from './CanvasBackground';

const DEFAULT_SECTIONS = [
  'Home',
  'Showreel',
  'Mixed Reality',
  'Work', // This is section 4 - will have the SlideshowStack
  'Art Installations',
  'About',
];

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function Shell() {
  const [sections] = useState<string[]>(DEFAULT_SECTIONS);
  const [active, setActive] = useState(0);

  const ids = useMemo(() => sections.map(slug), [sections]);

  // Handle active section changes from scroll
  const handleActiveChange = useCallback((i: number) => {
    setActive(i);
  }, []);

  // Handle navigation button clicks
  const handleJump = useCallback((i: number) => {
    const id = ids[i];
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(i);
      
      // Update URL query string
      const url = new URL(window.location.href);
      url.searchParams.set('pattern', String(i));
      window.history.replaceState({}, '', url);
    }
  }, [ids]);

  return (
    <div style={{ position: 'relative' }}>
      {/* Background particles synced to active section */}
      <CanvasBackground activeIndex={active} />
      
      {/* Header navigation */}
      <Header sections={sections} active={active} onJump={handleJump} />
      
      {/* Scrollable sections with sync hook */}
      <Sections 
        sections={sections} 
        onActiveChange={handleActiveChange}
      />
      
      <div className="sr-only" aria-live="polite">
        {`Active section ${active + 1} of ${sections.length}`}
      </div>
    </div>
  );
}