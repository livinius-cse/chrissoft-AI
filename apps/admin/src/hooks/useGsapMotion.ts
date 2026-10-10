import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Checks whether user prefers reduced motion.
 */
export const isReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Hook for staggered entrance animation of child elements.
 * Ideal for KPI cards, table rows, and grid items.
 */
export const useStaggerEntrance = (
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string = '.gsap-stagger-item',
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isReducedMotion()) {
      // If user prefers reduced motion, ensure elements are immediately visible
      const elements = container.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      const items = container.querySelectorAll(selector);
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        {
          opacity: 0,
          y: 18,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef, selector, ...deps]);
};

/**
 * Hook for smooth, cursor-reactive 3D tilt on individual cards/containers.
 * Includes gentle specular glare angle adjustment.
 */
export const useCard3DTilt = <T extends HTMLElement = HTMLDivElement>(
  options: {
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    speed?: number;
  } = {}
) => {
  const elementRef = useRef<T | null>(null);
  const { maxTilt = 8, perspective = 800, scale = 1.01, speed = 0.3 } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el || isReducedMotion()) return;

    // Apply 3D perspective style
    el.style.transformStyle = 'preserve-3d';
    el.style.perspective = `${perspective}px`;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const tiltX = (0.5 - y) * maxTilt * 2;
      const tiltY = (x - 0.5) * maxTilt * 2;

      gsap.to(el, {
        rotateX: tiltX,
        rotateY: tiltY,
        scale,
        duration: speed,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.45,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [maxTilt, perspective, scale, speed]);

  return elementRef;
};

/**
 * Hook for smooth page-level route transition entrance.
 */
export const usePageEntrance = (
  containerRef: React.RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        container,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, container);

    return () => ctx.revert();
  }, [containerRef, ...deps]);
};
