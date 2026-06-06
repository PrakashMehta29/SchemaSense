import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export function SectionTitle({ kicker, title, sub }: { kicker?: string; title: ReactNode; sub?: string }) {
  return (
    <div className="mb-8 relative overflow-hidden rounded-2xl border glass-panel p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
      {/* Decorative top highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] glass-edge" />
      
      {kicker && (
        <div className="mb-3 flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-[0.2em] text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary glow-lime shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          {kicker}
        </div>
      )}
      <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl text-foreground">{title}</h1>
      {sub && <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">{sub}</p>}
    </div>
  );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl border glass-panel-heavy backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] ${className}`}>
      <div className="absolute top-0 left-0 w-full h-[1px] glass-edge" />
      {children}
    </div>
  );
}

export function CountUp({ to, duration = 1.6, suffix = "", decimals }: { to: number; duration?: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => {
    const dec = decimals !== undefined ? decimals : (to >= 100 || Number.isInteger(to) ? 0 : 1);
    const factor = Math.pow(10, dec);
    const n = dec === 0 ? Math.round(v) : Math.round(v * factor) / factor;
    return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
  });
  useEffect(() => {
    if (inView) animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
  }, [inView, to, duration, mv]);
  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export function Pill({ children, tone = "lime" }: { children: ReactNode; tone?: "lime" | "red" | "muted" }) {
  const styles = {
    lime: "border-primary/40 bg-primary/10 text-primary",
    red: "border-destructive/40 bg-destructive/10 text-destructive",
    muted: "border-border bg-secondary text-muted-foreground",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] uppercase tracking-wider ${styles}`}>
      {children}
    </span>
  );
}