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
  const [showContact, setShowContact] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);
  const contactBtnRef = useRef<HTMLButtonElement | null>(null);

  const highlightColors = [
    "#ff006e",
    "#00f7ff",
    "#fee440",
    "#70d6ff",
    "#9b5de5",
    "#00ff88",
  ];

  // Close menu on route/section change
  useEffect(() => {
    setOpen(false);
  }, [active]);

  // Close on escape and click outside
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setShowContact(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (open && panelRef.current && btnRef.current) {
        if (
          !panelRef.current.contains(e.target as Node) &&
          !btnRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
        }
      }
      if (showContact && contactRef.current && contactBtnRef.current) {
        if (
          !contactRef.current.contains(e.target as Node) &&
          !contactBtnRef.current.contains(e.target as Node)
        ) {
          setShowContact(false);
        }
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open, showContact]);

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
    <>
      <style jsx>{`
        @font-face {
          font-family: "GlassTTYVT220";
          src: url("/fonts/Glass_TTY_VT220.ttf") format("truetype");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        .nav-mask {
          display: inline-block;
          overflow: hidden;
          height: 1.5rem;
          vertical-align: middle;
          cursor: pointer;
          padding: 0 0.75rem;
          border-radius: 9999px;
          transition: all 0.3s ease;
        }
        .lift-text {
          display: block;
          font-family: "GlassTTYVT220", monospace;
          font-size: 0.875rem;
          line-height: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), color 0.3s ease;
          transform: translateY(0);
        }
        .nav-mask:hover .lift-text {
          transform: translateY(-1.5rem);
          color: transparent;
        }
        .nav-mask.is-active {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .contact-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 1.5rem;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          padding: 1rem;
          min-width: 280px;
          box-shadow: 0 8px 32px rgba(0, 255, 136, 0.15);
          animation: slideDown 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          z-index: 60;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          margin: 0.25rem 0;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid transparent;
          font-family: "GlassTTYVT220", monospace;
        }
        .contact-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(0, 255, 136, 0.3);
          color: #00ff88;
          transform: translateX(4px);
        }
        .contact-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .contact-label {
          font-family: "GlassTTYVT220", monospace;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }
        .contact-button {
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          border: 1px solid rgba(0, 255, 136, 0.3);
          background: rgba(0, 255, 136, 0.05);
          color: #00ff88;
          font-family: "GlassTTYVT220", monospace;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .contact-button:hover {
          background: rgba(0, 255, 136, 0.15);
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        .contact-button.active {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }
        .brand-text {
          font-family: "GlassTTYVT220", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .mobile-nav-item {
          font-family: "GlassTTYVT220", monospace;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .contact-header {
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          font-family: "GlassTTYVT220", monospace;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
        }
        .mobile-contact-header {
          font-family: "GlassTTYVT220", monospace;
        }
        .mobile-contact-link {
          font-family: "GlassTTYVT220", monospace;
        }
        @media (max-width: 768px) {
          .brand-text { font-size: 0.65rem; }
        }
        @media (max-width: 480px) {
          .brand-text {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-foreground/10 backdrop-blur supports-[backdrop-filter]:bg-background/50 bg-background/70">
        <a 
          href={`#${items[active]?.id ?? ''}`} 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-foreground focus:text-background focus:px-3 focus:py-2 focus:rounded-md"
        >
          Skip to content
        </a>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="h-16 flex items-center justify-between gap-4" aria-label="Primary">
            {/* Brand */}
            <div className="brand-text text-foreground/80">
              Debbie Brooks — Web Augmented
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-4 relative">
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.25rem",
                  padding: "0.25rem",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {items.map(({ label, index, isActive }) => {
                  const color = highlightColors[index % highlightColors.length];

                  return (
                    <div
                      key={label}
                      onClick={() => jump(index)}
                      className={`nav-mask ${isActive ? "is-active" : ""}`}
                      style={{ borderColor: isActive ? "white" : "transparent" }}
                    >
                      <span
                        className="lift-text"
                        style={{
                          color: isActive ? "white" : "rgba(255,255,255,0.7)",
                          textShadow: `0 1.5rem ${color}`,
                          fontWeight: isActive ? "bold" : "normal",
                        }}
                      >
                        {label.split(" - ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                ref={contactBtnRef}
                className={`contact-button ${showContact ? "active" : ""}`}
                onClick={() => setShowContact(!showContact)}
              >
                Contact ✦
              </button>

              {showContact && (
                <div ref={contactRef} className="contact-dropdown">
                  <div className="contact-header">
                    Get in touch
                  </div>

                  <a
                    href="mailto:debbie.brooks@gmail.com"
                    className="contact-item"
                    onClick={() => setShowContact(false)}
                  >
                    <span className="contact-icon">✉</span>
                    <span className="contact-label">Email</span>
                  </a>

                  <a
                    href="https://wa.me/07799268897"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-item"
                    onClick={() => setShowContact(false)}
                  >
                    <span className="contact-icon">💬</span>
                    <span className="contact-label">WhatsApp</span>
                  </a>

                  <a
                    href="tel:07799268897"
                    className="contact-item"
                    onClick={() => setShowContact(false)}
                  >
                    <span className="contact-icon">📱</span>
                    <span className="contact-label">Mobile</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/debbie-brooks-8bb5664/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-item"
                    onClick={() => setShowContact(false)}
                  >
                    <span className="contact-icon">💼</span>
                    <span className="contact-label">LinkedIn</span>
                  </a>

                  <a
                    href="https://cal.com/debbie-brooks-foykr6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-item"
                    onClick={() => setShowContact(false)}
                  >
                    <span className="contact-icon">📅</span>
                    <span className="contact-label">Book a Call</span>
                  </a>
                </div>
              )}
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
                    'mobile-nav-item w-full text-left px-4 py-3 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-foreground/40',
                    isActive ? 'bg-foreground text-background' : 'text-foreground hover:bg-foreground/5',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {label}
                </button>
              ))}
              
              {/* Contact section in mobile menu */}
              <div className="mt-4 pt-4 px-4 border-t border-foreground/10">
                <div className="mobile-contact-header text-xs uppercase tracking-wider text-foreground/50 mb-3 font-medium">
                  Get in touch
                </div>
                
                <a
                  href="mailto:debbie.brooks@gmail.com"
                  className="mobile-contact-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors mb-1"
                  onClick={() => setOpen(false)}
                >
                  <span>✉</span>
                  <span>Email</span>
                </a>

                <a
                  href="https://wa.me/07799268897"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-contact-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors mb-1"
                  onClick={() => setOpen(false)}
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>

                <a
                  href="tel:07799268897"
                  className="mobile-contact-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors mb-1"
                  onClick={() => setOpen(false)}
                >
                  <span>📱</span>
                  <span>Mobile</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/debbie-brooks-8bb5664/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-contact-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors mb-1"
                  onClick={() => setOpen(false)}
                >
                  <span>💼</span>
                  <span>LinkedIn</span>
                </a>

                <a
                  href="https://cal.com/debbie-brooks-foykr6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-contact-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span>📅</span>
                  <span>Book a Call</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}