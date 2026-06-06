import { jsxs, jsx } from "react/jsx-runtime";
import { useInView, useMotionValue, useTransform, animate, motion } from "motion/react";
import { useRef, useEffect } from "react";
function SectionTitle({ kicker, title, sub }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-8 relative overflow-hidden rounded-2xl border glass-panel p-6 md:p-8 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-[1px] glass-edge" }),
    kicker && /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-[0.2em] text-primary", children: [
      /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary glow-lime shadow-[0_0_8px_rgba(16,185,129,0.5)]" }),
      kicker
    ] }),
    /* @__PURE__ */ jsx("h1", { className: "font-display text-3xl font-bold leading-tight md:text-4xl text-foreground", children: title }),
    sub && /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed", children: sub })
  ] });
}
function GlassCard({ children, className = "" }) {
  return /* @__PURE__ */ jsxs("div", { className: `relative rounded-2xl border glass-panel-heavy backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.15)] ${className}`, children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-[1px] glass-edge" }),
    children
  ] });
}
function CountUp({ to, duration = 1.6, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => {
    const n = to >= 100 ? Math.round(v) : Math.round(v * 10) / 10;
    return n.toLocaleString();
  });
  useEffect(() => {
    if (inView) animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
  }, [inView, to, duration, mv]);
  return /* @__PURE__ */ jsxs("span", { ref, className: "tabular-nums", children: [
    /* @__PURE__ */ jsx(motion.span, { children: rounded }),
    suffix
  ] });
}
function Pill({ children, tone = "lime" }) {
  const styles = {
    lime: "border-primary/40 bg-primary/10 text-primary",
    red: "border-destructive/40 bg-destructive/10 text-destructive",
    muted: "border-border bg-secondary text-muted-foreground"
  }[tone];
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono-tight text-[10px] uppercase tracking-wider ${styles}`, children });
}
export {
  CountUp as C,
  GlassCard as G,
  Pill as P,
  SectionTitle as S
};
