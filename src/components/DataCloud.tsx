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
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      const isDark = document.documentElement.classList.contains('dark');
      
      // Vector Ribbon Wave configuration
      const numRibbons = 4;
      const points = 100;
      
      // We will use composite operations to make the overlapping ribbons blend beautifully
      ctx.globalCompositeOperation = isDark ? "screen" : "multiply";
      
      for (let rIdx = 0; rIdx < numRibbons; rIdx++) {
        ctx.beginPath();
        
        // Create a beautiful linear gradient for each ribbon
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        
        const opacityBase = isDark ? 0.15 : 0.4;
        const opacityFaded = isDark ? 0.02 : 0.1;
        
        // Warm peach/coral colors
        gradient.addColorStop(0, `rgba(242, 120, 92, ${opacityBase})`);   // Coral
        gradient.addColorStop(0.5, `rgba(250, 209, 196, ${opacityFaded})`); // Peach
        gradient.addColorStop(1, `rgba(242, 120, 92, ${opacityBase})`);   // Coral
        
        ctx.fillStyle = gradient;
        
        // Unique phase and vertical offset for each ribbon
        const phase = rIdx * 1.8;
        const speed = time * 0.4;
        const yOffset = (rIdx - numRibbons / 2) * (height * 0.1);
        
        // Draw TOP EDGE of the ribbon (Left to Right)
        for (let j = 0; j <= points; j++) {
          const t = j / points; 
          const x = t * width;
          
          // Long sweeping vector-style curves
          const wave1 = Math.sin(x * 0.0015 + speed + phase) * (height * 0.25);
          const wave2 = Math.cos(x * 0.002 - speed * 0.5 + phase * 0.8) * (height * 0.1);
          
          const y = height / 2 + wave1 + wave2 + yOffset;
          
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Draw BOTTOM EDGE of the ribbon (Right to Left to close the polygon)
        for (let j = points; j >= 0; j--) {
          const t = j / points; 
          const x = t * width;
          
          const wave1 = Math.sin(x * 0.0015 + speed + phase) * (height * 0.25);
          const wave2 = Math.cos(x * 0.002 - speed * 0.5 + phase * 0.8) * (height * 0.1);
          
          // Ribbon thickness expands and contracts dynamically to create a 3D twist
          const thickness = height * 0.12 + Math.sin(x * 0.0025 + speed * 1.2 + phase) * (height * 0.08);
          
          const y = height / 2 + wave1 + wave2 + yOffset + thickness;
          
          ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();
      }
      
      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";
      
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
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-100"
      />
      {/* Noise overlay for premium grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}