// components/BackgroundVideo.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

type BackgroundVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  /** Put content on top of the video */
  children?: React.ReactNode;
  /** Optional overlay (e.g. gradient) above the video but below children */
  overlayClassName?: string;
  /** Extra classes for the wrapper */
  wrapperClassName?: string;
};

export default function BackgroundVideo({
  src,
  poster,
  children,
  className,
  overlayClassName,
  wrapperClassName,
  ...videoProps
}: BackgroundVideoProps) {
  // Pause when offscreen to save battery/CPU
  const ref = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className={clsx("relative", wrapperClassName)}>
      {/* Video layer */}
       <video
        src="/videos/bg.mp4"
        className="fixed inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        />

      {/* Optional overlay for tint/contrast */}
      <div
        aria-hidden="true"
        className={clsx(
          "pointer-events-none absolute inset-0",
          overlayClassName
        )}
      />

      {/* Foreground content */}
      <div className="relative">{children}</div>
    </div>
  );
}