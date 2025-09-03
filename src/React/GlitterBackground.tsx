import React, { useEffect, useRef } from "react";

type GlitterBackgroundProps = {
  density?: number; // particles per 100k px^2
  colors?: string[]; // glow palette
  alphaScale?: number; // 0..1 transparency multiplier for glitter
  sizeScale?: number; // particle size multiplier
  opacity?: number; // canvas overall opacity 0..1
  showBackdrop?: boolean; // soft radial glows behind glitter
  cssBlend?: React.CSSProperties["mixBlendMode"]; // CSS mix-blend-mode value
  canvasBlend?: GlobalCompositeOperation; // Canvas composite operation
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GlitterBackground: React.FC<GlitterBackgroundProps> = ({
  density = 0.12,
  colors = [
    "#FF58A6", // pink
    "#8B5CF6", // violet
    "#60A5FA", // blue
    "#34D399", // emerald
  ],
  alphaScale = 1,
  sizeScale = 1,
  opacity = 0.95,
  showBackdrop = true,
  cssBlend = "screen",
  canvasBlend = "lighter",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rm = prefersReducedMotion();

    let width = 0;
    let height = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    type Particle = {
      x: number;
      y: number;
      r: number;
      baseA: number;
      amp: number;
      freq: number;
      phase: number;
      hue: number;
    };

    let particles: Particle[] = [];

    const build = () => {
      // particle count scales with area
      const area = width * height;
      const count = Math.min(600, Math.max(40, Math.floor((area / 100000) * density * (rm ? 0.6 : 1.2))));
      particles = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 2.2 + 0.6) * sizeScale,
        baseA: (Math.random() * 0.35 + 0.08) * alphaScale,
        amp: (Math.random() * 0.55 + 0.2) * alphaScale,
        freq: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        hue: Math.floor(Math.random() * 360),
      }));
      draw(0);
    };

    let t = 0;

    const draw = (dt: number) => {
      t += dt;
      ctx.clearRect(0, 0, width, height);

      // soft multi-glow backdrop
      if (showBackdrop) {
        const glows = 3;
        for (let i = 0; i < glows; i++) {
          const cx = (i === 0 ? width * 0.2 : i === 1 ? width * 0.75 : width * 0.5) + Math.sin((t * 0.0002 + i) * 2) * 12;
          const cy = (i === 0 ? height * 0.25 : i === 1 ? height * 0.7 : height * 0.5) + Math.cos((t * 0.00025 + i) * 2) * 10;
          const rad = Math.max(width, height) * (0.55 + i * 0.12);
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
          const c = colors[i % colors.length];
          g.addColorStop(0, `${c}22`);
          g.addColorStop(1, "#00000000");
          ctx.globalCompositeOperation = canvasBlend;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // glitter particles
      ctx.globalCompositeOperation = canvasBlend;
      for (const p of particles) {
        const a = p.baseA + p.amp * (rm ? 0.2 : 0.8) * (0.5 + 0.5 * Math.sin(t * p.freq * 0.003 + p.phase));
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      if (!rm) draw(dt);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onResize = () => resize();
    resize();
    if (!rm) rafRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", onResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [colors, density]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity,
        mixBlendMode: cssBlend,
      }}
      aria-hidden
    />
  );
};

export default GlitterBackground;
