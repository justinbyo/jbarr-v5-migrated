"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { MediaItem } from "@/lib/case-studies";

interface CaseStudyMediaProps {
  media: MediaItem[];
  alt: string;
}

const MOBILE_BREAKPOINT = "(max-width: 767px)";
const SCROLL_CENTER_PROXIMITY_RATIO = 0.35;
const SCROLL_SWITCH_HYSTERESIS_PX = 80;

type ScrollImageInstance = {
  id: number;
  getElement: () => HTMLDivElement | null;
  setActive: (active: boolean) => void;
  inView: boolean;
};

const scrollImageInstances = new Map<number, ScrollImageInstance>();
let nextScrollImageId = 1;
let activeScrollImageId: number | null = null;
let hasGlobalScrollListeners = false;
let scrollEvaluationScheduled = false;

function getScrollImageCenterDistance(instance: ScrollImageInstance): number {
  const element = instance.getElement();
  if (!element) return Number.POSITIVE_INFINITY;

  const rect = element.getBoundingClientRect();
  const centerY = rect.top + rect.height / 2;
  return Math.abs(centerY - window.innerHeight / 2);
}

function isScrollImageInViewport(instance: ScrollImageInstance): boolean {
  const element = instance.getElement();
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

function applyActiveScrollImage(nextId: number | null) {
  if (activeScrollImageId === nextId) return;

  if (activeScrollImageId !== null) {
    const previous = scrollImageInstances.get(activeScrollImageId);
    previous?.setActive(false);
  }

  activeScrollImageId = nextId;

  if (activeScrollImageId !== null) {
    const next = scrollImageInstances.get(activeScrollImageId);
    next?.setActive(true);
  }
}

function evaluateActiveScrollImage() {
  if (typeof window === "undefined") return;

  const viewportCenterThreshold =
    window.innerHeight * SCROLL_CENTER_PROXIMITY_RATIO;

  let bestId: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const instance of scrollImageInstances.values()) {
    if (!instance.inView || !isScrollImageInViewport(instance)) continue;
    const distance = getScrollImageCenterDistance(instance);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestId = instance.id;
    }
  }

  if (bestDistance > viewportCenterThreshold) {
    applyActiveScrollImage(null);
    return;
  }

  if (activeScrollImageId !== null && bestId !== activeScrollImageId) {
    const activeInstance = scrollImageInstances.get(activeScrollImageId);
    if (activeInstance && activeInstance.inView && isScrollImageInViewport(activeInstance)) {
      const activeDistance = getScrollImageCenterDistance(activeInstance);
      if (bestDistance + SCROLL_SWITCH_HYSTERESIS_PX >= activeDistance) {
        applyActiveScrollImage(activeScrollImageId);
        return;
      }
    }
  }

  applyActiveScrollImage(bestId);
}

function scheduleScrollImageEvaluation() {
  if (typeof window === "undefined") return;
  if (scrollEvaluationScheduled) return;

  scrollEvaluationScheduled = true;
  window.requestAnimationFrame(() => {
    scrollEvaluationScheduled = false;
    evaluateActiveScrollImage();
  });
}

function handleScrollImageViewportChange() {
  scheduleScrollImageEvaluation();
}

function attachScrollImageListeners() {
  if (typeof window === "undefined") return;
  if (hasGlobalScrollListeners) return;

  window.addEventListener("scroll", handleScrollImageViewportChange, {
    passive: true,
  });
  window.addEventListener("resize", handleScrollImageViewportChange);
  hasGlobalScrollListeners = true;
}

function detachScrollImageListeners() {
  if (typeof window === "undefined") return;
  if (!hasGlobalScrollListeners) return;

  window.removeEventListener("scroll", handleScrollImageViewportChange);
  window.removeEventListener("resize", handleScrollImageViewportChange);
  hasGlobalScrollListeners = false;
}

function registerScrollImageInstance(
  getElement: () => HTMLDivElement | null,
  setActive: (active: boolean) => void
) {
  const id = nextScrollImageId++;
  scrollImageInstances.set(id, {
    id,
    getElement,
    setActive,
    inView: false,
  });

  attachScrollImageListeners();
  scheduleScrollImageEvaluation();
  return id;
}

function unregisterScrollImageInstance(id: number) {
  const wasActive = activeScrollImageId === id;
  scrollImageInstances.delete(id);

  if (wasActive) {
    activeScrollImageId = null;
  }

  if (scrollImageInstances.size === 0) {
    detachScrollImageListeners();
    return;
  }

  scheduleScrollImageEvaluation();
}

function setScrollImageInstanceInView(id: number, inView: boolean) {
  const instance = scrollImageInstances.get(id);
  if (!instance) return;

  if (instance.inView !== inView) {
    instance.inView = inView;
    scheduleScrollImageEvaluation();
  }
}

/** Match a media query, updating on changes. SSR-safe (defaults to false). */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
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
    return <img src={media[0].src} alt={alt} loading="lazy" />;
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
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const instanceIdRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [isActive, setIsActive] = useState(false);

  // Register with shared coordinator (desktop only)
  useEffect(() => {
    if (isMobile) {
      if (instanceIdRef.current !== null) {
        unregisterScrollImageInstance(instanceIdRef.current);
        instanceIdRef.current = null;
      }
      setIsActive(false);
      return;
    }

    const id = registerScrollImageInstance(() => containerRef.current, setIsActive);
    instanceIdRef.current = id;

    return () => {
      unregisterScrollImageInstance(id);
      instanceIdRef.current = null;
      setIsActive(false);
    };
  }, [isMobile]);

  // Track visibility and report to coordinator
  useEffect(() => {
    if (isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (instanceIdRef.current !== null) {
          setScrollImageInstanceInView(instanceIdRef.current, entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (instanceIdRef.current !== null) {
        setScrollImageInstanceInView(instanceIdRef.current, false);
      }
    };
  }, [isMobile]);

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
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    img.style.transform = `translateY(${-eased * overflow}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isMobile || !isActive) {
      cancelAnimationFrame(rafRef.current);
      startTimeRef.current = 0;
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, isActive, isMobile]);

  // On mobile, render a simple lazy-loaded image instead of the scroll animation
  if (isMobile) {
    return <img src={src} alt={alt} loading="lazy" />;
  }

  return (
    <div ref={containerRef} className="case-study--scroll-container">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="case-study--scroll-image"
        loading="lazy"
      />
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
              <img src={item.src} alt={`${alt} – ${i + 1}`} loading="lazy" />
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
