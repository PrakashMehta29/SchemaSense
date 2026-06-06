import React, { useEffect, useRef } from 'react';

export default function DataCloud({ className = "", density = 40 }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.classList.contains('dark');

      const numRibbons = 4;
      const points     = 100;

      // Dark  → screen blend, higher opacity (glowing coral on deep slate)
      // Light → normal blend, lower opacity (soft pastel coral on white)
      ctx.globalCompositeOperation = isDark ? 'screen' : 'normal';

      for (let rIdx = 0; rIdx < numRibbons; rIdx++) {
        ctx.beginPath();

        const gradient = ctx.createLinearGradient(0, 0, W, 0);

        if (isDark) {
          gradient.addColorStop(0,   'rgba(242, 120, 92, 0.15)');
          gradient.addColorStop(0.5, 'rgba(250, 209, 196, 0.02)');
          gradient.addColorStop(1,   'rgba(242, 120, 92, 0.15)');
        } else {
          // Same coral hue, just much more transparent for a soft glassmorphism tint
          gradient.addColorStop(0,   'rgba(232, 97, 63, 0.09)');
          gradient.addColorStop(0.5, 'rgba(250, 209, 196, 0.05)');
          gradient.addColorStop(1,   'rgba(232, 97, 63, 0.09)');
        }

        ctx.fillStyle = gradient;

        const phase   = rIdx * 1.8;
        const speed   = time * 0.4;
        const yOffset = (rIdx - numRibbons / 2) * (H * 0.1);

        // Top edge left → right
        for (let j = 0; j <= points; j++) {
          const t = j / points;
          const x = t * W;
          const y = H / 2
            + Math.sin(x * 0.0015 + speed + phase) * (H * 0.25)
            + Math.cos(x * 0.002  - speed * 0.5 + phase * 0.8) * (H * 0.1)
            + yOffset;
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        // Bottom edge right → left (closes the ribbon)
        for (let j = points; j >= 0; j--) {
          const t         = j / points;
          const x         = t * W;
          const baseY     = H / 2
            + Math.sin(x * 0.0015 + speed + phase) * (H * 0.25)
            + Math.cos(x * 0.002  - speed * 0.5 + phase * 0.8) * (H * 0.1)
            + yOffset;
          const thickness = H * 0.12 + Math.sin(x * 0.0025 + speed * 1.2 + phase) * (H * 0.08);
          ctx.lineTo(x, baseY + thickness);
        }

        ctx.closePath();
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      time += 0.012;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [density]);

  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background transition-colors duration-500 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}