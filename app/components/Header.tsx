'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type HeaderProps = {
  active: number;
  onJump: (i: number) => void;
  sections: string[];
};

const slug = (s: string) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function Header({ active, onJump, sections }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Close menu on route/section change
  useEffect(() => {
    setOpen(false);
  }, [active]);

  // Close on escape and click outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const items = useMemo(
    () =>
      sections.map((label, i) => ({
        label,
        id: slug(label),
        index: i,
        isActive: i === active,
      })),
    [sections, active]
  );

  const jump = (i: number) => {
    onJump(i);
    setOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/50 bg-background/70">
      <a href={`#${items[active]?.id ?? ''}`} className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:rounded-md">
        Skip to content
      </a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center justify-between gap-4" aria-label="Primary">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-block h-8 w-8 rounded-lg bg-foreground/90"></span>
            <span className="font-semibold tracking-tight truncate">Web Augmented Ltd - WebXR | Three.js | VAT Systems | Shader Programming | Emerging Web Tech</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {items.map(({ label, index, isActive }) => (
              <button
                key={label}
                onClick={() => jump(index)}
                className={[
                  'px-3 py-2 rounded-lg text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-foreground/40',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'text-foreground/80 hover:text-foreground border-transparent hover:border-foreground/30',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              ref={btnRef}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg border border-foreground/20 text-foreground/90 hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/40"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                {open ? (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sheet */}
      <div
        className={[
          'md:hidden fixed inset-x-0 top-16 origin-top overflow-hidden transition-all',
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
        aria-hidden={!open}
      >
        <div
          ref={panelRef}
          className="mx-4 rounded-2xl border border-foreground/10 bg-background/95 backdrop-blur shadow-lg"
        >
          <div className="py-2">
            {items.map(({ label, index, isActive }) => (
              <button
                key={label}
                onClick={() => jump(index)}
                className={[
                  'w-full text-left px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-foreground/40',
                  isActive ? 'bg-foreground text-background' : 'text-foreground hover:bg-foreground/5',
                ].join(' ')}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
