import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface ThreeBusinessTokenProps {
  size?: number;
  interactive?: boolean;
  className?: string;
  badgeText?: string;
}

/**
 * Reusable 3D Hero Business Token
 * Features metallic obsidian body, electric orange rim lighting,
 * embossed facets, and GSAP-driven motion and cursor tilt.
 */
export const ThreeBusinessToken: React.FC<ThreeBusinessTokenProps> = ({
  size = 240,
  interactive = true,
  className = '',
  badgeText = 'ChrisSoft AI',
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
      // Graceful CSS Fallback
      container.innerHTML = `
        <div class="w-full h-full rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl border border-white/20">
          ${badgeText.charAt(0)}
        </div>
      `;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = interactive ? 'grab' : 'default';
    container.appendChild(canvas);

    // 3. Lighting Setup: Electric Orange Rim + Key Lights
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Key Specular Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Signature Electric Neon Orange Rim Light (Behind & Upper-Right)
    const orangeRimLight = new THREE.PointLight(0xff6b00, 8.0, 20);
    orangeRimLight.position.set(3, 2, -3);
    scene.add(orangeRimLight);

    // Subtle Cool Blue Fill Light (Lower-Left)
    const coolFillLight = new THREE.PointLight(0x38bdf8, 3.5, 20);
    coolFillLight.position.set(-4, -3, 2);
    scene.add(coolFillLight);

    // 4. Token 3D Mesh Construction
    const tokenGroup = new THREE.Group();
    scene.add(tokenGroup);

    // Materials
    const obsidianMetalMat = new THREE.MeshStandardMaterial({
      color: 0x11131a,
      metalness: 0.92,
      roughness: 0.18,
    });

    const orangeRimMat = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      emissive: 0x441900,
      metalness: 0.85,
      roughness: 0.25,
    });

    const coreGoldMat = new THREE.MeshStandardMaterial({
      color: 0xff9900,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x331400,
    });

    // Base Coin Disk
    const coinGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.42, 64);
    const coinMesh = new THREE.Mesh(coinGeo, obsidianMetalMat);
    coinMesh.rotation.x = Math.PI / 2;
    tokenGroup.add(coinMesh);

    // Outer Glowing Orange Bezel Ring
    const rimGeo = new THREE.TorusGeometry(2.42, 0.08, 24, 64);
    const rimMesh = new THREE.Mesh(rimGeo, orangeRimMat);
    tokenGroup.add(rimMesh);

    // Inner Faceted Core Emblem (ChrisSoft Core Prism)
    const coreGeo = new THREE.OctahedronGeometry(1.2, 0);
    const coreMesh = new THREE.Mesh(coreGeo, coreGoldMat);
    coreMesh.scale.set(1, 1, 0.35);
    tokenGroup.add(coreMesh);

    // Accent Orbital Rings
    const orbitGeo = new THREE.TorusGeometry(1.7, 0.03, 16, 48);
    const orbitMesh = new THREE.Mesh(orbitGeo, orangeRimMat);
    tokenGroup.add(orbitMesh);

    // 5. GSAP Motion & Timeline Integration
    const gsapContext = gsap.context(() => {
      if (!prefersReducedMotion) {
        // Entrance Pop
        gsap.from(tokenGroup.scale, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.0,
          ease: 'back.out(1.7)',
        });

        // Continuous Floating & Spinning Motion
        gsap.to(tokenGroup.rotation, {
          y: Math.PI * 2,
          duration: 18,
          repeat: -1,
          ease: 'none',
        });

        gsap.to(tokenGroup.position, {
          y: 0.22,
          duration: 2.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    });

    // 6. Interactive Cursor Reactive Tilt
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        tokenGroup.rotation.y += deltaX * 0.015;
        tokenGroup.rotation.x += deltaY * 0.015;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Smooth cursor tilt toward mouse
        gsap.to(tokenGroup.rotation, {
          x: -y * 0.45,
          z: -x * 0.25,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      canvas.style.cursor = 'grabbing';
      gsap.to(tokenGroup.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.2 });
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
      gsap.to(tokenGroup.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.3 });
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 7. Visibility Change: Pause Render Loop When Hidden
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 8. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isTabVisible) {
        renderer.render(scene, camera);
      }
    };
    animate();

    // 9. Comprehensive Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      gsapContext.revert();

      coinGeo.dispose();
      rimGeo.dispose();
      coreGeo.dispose();
      orbitGeo.dispose();
      obsidianMetalMat.dispose();
      orangeRimMat.dispose();
      coreGoldMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();

      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [size, interactive, badgeText]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative select-none flex items-center justify-center ${className}`}
      title={`${badgeText} - Interactive 3D Business Token`}
    />
  );
};

export default ThreeBusinessToken;
