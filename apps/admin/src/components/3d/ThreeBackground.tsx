import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
}

/**
 * Genuine WebGL 3D Ambient Constellation & Particle Background
 * Built using Three.js with hardware acceleration, cursor-reactive parallax,
 * automatic visibility-based pause, and prefers-reduced-motion support.
 */
export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({
  className = '',
  particleCount = 500,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. WebGL Feature Detection
    const hasWebGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return Boolean(
          window.WebGLRenderingContext &&
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch {
        return false;
      }
    })();

    if (!hasWebGL) {
      // Graceful fallback for environments without WebGL
      container.style.background =
        'radial-gradient(circle at 50% 30%, rgba(255, 107, 0, 0.08) 0%, rgba(8, 9, 13, 1) 70%)';
      return;
    }

    // 2. Check Reduced Motion Preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3. Three.js Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 280;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    // Cap pixel ratio to 1.5 to prevent high-DPI GPU thermal throttling
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    // 4. Construct Particle Constellation BufferGeometry
    const count = prefersReducedMotion ? Math.min(particleCount, 150) : particleCount;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    // Color palette: Electric orange, warm amber, obsidian deep slate, crisp white
    const colorPalette = [
      new THREE.Color('#ff6b00'), // Electric Neon Orange
      new THREE.Color('#ff9500'), // Warm Gold Amber
      new THREE.Color('#ffa94d'), // Soft Amber Glint
      new THREE.Color('#64748b'), // Slate node
      new THREE.Color('#e2e8f0'), // Specular white node
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution with layered depth
      const radius = 100 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) + (Math.random() - 0.5) * 80;

      // Color assignment
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      scales[i] = Math.random() * 2.5 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom circle particle texture to avoid square artifacts
    const createCircleTexture = () => {
      const size = 64;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 107, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    };

    const particleTexture = createCircleTexture();

    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 5. Interactive Cursor Movement & Smooth Interpolation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / (rect.width || 1);
      const y = (e.clientY - rect.top) / (rect.height || 1);
      targetX = (x - 0.5) * 60;
      targetY = (y - 0.5) * 60;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // 7. Visibility Change: Pause Rendering When Tab Is Hidden
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 8. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible) return;

      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Subtle organic rotation
        particles.rotation.y += 0.08 * delta;
        particles.rotation.x += 0.03 * delta;

        // Smooth camera cursor parallax (lerp)
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;
        camera.position.x = mouseX;
        camera.position.y = -mouseY;
        camera.lookAt(scene.position);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Comprehensive Lifecycle Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();

      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [particleCount, interactive]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default ThreeBackground;
