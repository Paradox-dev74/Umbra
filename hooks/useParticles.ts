/* ═══════════════════════════════════════════════════════════
   Umbra Protocol — Canvas Particle System Hook
   ═══════════════════════════════════════════════════════════ */

"use client";

import { useEffect, useRef } from "react";
import type { ParticleConfig } from "@/lib/types";
import { randomBetween } from "@/lib/utils";

interface UseParticlesOptions {
  count?: number;
  speed?: number;
  minOpacity?: number;
  maxOpacity?: number;
  minRadius?: number;
  maxRadius?: number;
}

export function useParticles(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseParticlesOptions = {}
) {
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<ParticleConfig[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const {
      count = 150,
      speed = 0.3,
      minOpacity = 0.2,
      maxOpacity = 0.5,
      minRadius = 1,
      maxRadius = 2,
    } = options;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const initParticles = (): ParticleConfig[] => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: randomBetween(-speed, speed),
        vy: randomBetween(-speed, speed),
        opacity: randomBetween(minOpacity, maxOpacity),
        radius: randomBetween(minRadius, maxRadius),
        opacityDirection: Math.random() > 0.5 ? 1 : -1,
      }));
    };

    particlesRef.current = initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particlesRef.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        particle.opacity += particle.opacityDirection * 0.003;
        if (particle.opacity >= maxOpacity) {
          particle.opacity = maxOpacity;
          particle.opacityDirection = -1;
        } else if (particle.opacity <= minOpacity) {
          particle.opacity = minOpacity;
          particle.opacityDirection = 1;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [canvasRef, options]);
}
