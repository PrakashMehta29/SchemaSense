import React, { useEffect, useRef } from 'react';

export default function DataCloud({ className = "", density }: { density?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      tick += 0.002; // Smooth, slow liquid wave speed
      
      // Base ultra-dark background canvas
      ctx.fillStyle = '#020403';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Smooth moving coordinates using sine and cosine waves
      const x1 = canvas.width * (0.3 + Math.sin(tick) * 0.1);
      const y1 = canvas.height * (0.4 + Math.cos(tick * 1.2) * 0.1);
      const r1 = Math.min(canvas.width, canvas.height) * 0.6;

      const x2 = canvas.width * (0.7 + Math.cos(tick * 0.8) * 0.15);
      const y2 = canvas.height * (0.6 + Math.sin(tick * 1.1) * 0.1);
      const r2 = Math.min(canvas.width, canvas.height) * 0.7;

      // Wave 1: Electric Mint Green
      const gradient1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      gradient1.addColorStop(0, 'rgba(0, 255, 102, 0.22)');
      gradient1.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
      gradient1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wave 2: Deep Ambient Teal
      const gradient2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      gradient2.addColorStop(0, 'rgba(0, 229, 255, 0.15)');
      gradient2.addColorStop(0.6, 'rgba(4, 120, 87, 0.05)');
      gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ 
        width: '100vw', 
        height: '100vh',
        filter: 'blur(60px) contrast(1.2)',
        display: 'block'
      }}
    />
  );
}