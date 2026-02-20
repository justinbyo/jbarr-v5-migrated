"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { MediaItem } from "@/lib/case-studies";

interface CaseStudyMediaProps {
  media: MediaItem[];
  alt: string;
}

export default function CaseStudyMedia({ media, alt }: CaseStudyMediaProps) {
  // Single video
  if (media.length === 1 && media[0].type === "video") {
    return <VideoPlayer src={media[0].src} alt={alt} />;
  }

  // Single scroll image
  if (media.length === 1 && media[0].display === "scroll") {
    return <ScrollImage src={media[0].src} alt={alt} />;
  }

  // Single image
  if (media.length === 1 && media[0].type === "image") {
    return <img src={media[0].src} alt={alt} />;
  }

  // Multiple media items → carousel
  return <Carousel media={media} alt={alt} />;
}

/* ── Video with hover-to-play ───────────────────────────── */

function VideoPlayer({ src, alt }: { src: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      loop
      preload="metadata"
      aria-label={alt}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

/* ── Scroll image (tall image pans upward) ──────────────── */

const SCROLL_DURATION = 12000; // ms for one direction

function ScrollImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(() => {
    const img = imgRef.current;
    const container = containerRef.current;
    if (!img || !container || !img.naturalHeight || !img.naturalWidth) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    const containerWidth = container.clientWidth;
    const renderedHeight =
      (img.naturalHeight / img.naturalWidth) * containerWidth;
    const overflow = Math.max(0, renderedHeight - container.clientHeight);

    if (!startTimeRef.current) startTimeRef.current = performance.now();
    const elapsed = performance.now() - startTimeRef.current;

    // Ping-pong: 0→1→0 over 2× duration, with ease-in-out
    const cycle = (elapsed % (SCROLL_DURATION * 2)) / SCROLL_DURATION;
    const linear = cycle <= 1 ? cycle : 2 - cycle;

    // Ease-in-out with 10% dwell at each end
    let progress: number;
    if (linear <= 0.1) progress = 0;
    else if (linear >= 0.9) progress = 1;
    else progress = (linear - 0.1) / 0.8;

    // Smooth ease-in-out
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    img.style.transform = `translateY(${-eased * overflow}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return (
    <div ref={containerRef} className="case-study--scroll-container">
      <img ref={imgRef} src={src} alt={alt} className="case-study--scroll-image" />
    </div>
  );
}

/* ── Carousel with fade transition ──────────────────────── */

const CAROUSEL_INTERVAL = 4000; // ms

function Carousel({ media, alt }: { media: MediaItem[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % media.length);
    }, CAROUSEL_INTERVAL);
  }, [media.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  const goToSlide = (index: number) => {
    stopTimer();
    setActiveIndex(index);
    startTimer();
  };

  return (
    <div className="case-study--carousel">
      <div className="case-study--carousel-track">
        {media.map((item, i) => (
          <div
            key={item.src}
            className="case-study--carousel-slide"
            data-active={i === activeIndex ? "true" : "false"}
          >
            {item.type === "image" ? (
              <img src={item.src} alt={`${alt} – ${i + 1}`} />
            ) : (
              <video
                src={item.src}
                muted
                playsInline
                loop
                preload="metadata"
                aria-label={`${alt} – ${i + 1}`}
              />
            )}
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <div className="case-study--carousel-dots">
          {media.map((_, i) => (
            <button
              key={i}
              className="case-study--carousel-dot"
              data-active={i === activeIndex ? "true" : "false"}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
