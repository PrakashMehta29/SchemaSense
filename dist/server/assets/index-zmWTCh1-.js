import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { ArrowUpRight, Activity, AlertTriangle, Cpu } from "lucide-react";
import { C as CountUp, S as SectionTitle, P as Pill } from "./ui-bits-DiJjH9oN.js";
import "react";
const tickerEvents = ["schema:orders.v3 ingested", "column cust_id flagged · type drift", "lineage rebuilt for fact_sales", "92 columns profiled in 1.4s", "AI definitions written · 14 cols", "anomaly resolved · null spike", "export queued · revenue.csv", "dictionary synced with warehouse"];
function Index() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 relative overflow-hidden rounded-3xl border glass-panel p-8 md:p-12 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 w-full h-[1px] glass-edge" }),
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-[0.25em] text-primary", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary glow-lime shadow-[0_0_8px_rgba(16,185,129,0.5)]" }),
          "Schema Intelligence · Live"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
          /* @__PURE__ */ jsxs("h1", { className: "font-display text-5xl font-bold leading-[0.95] md:text-7xl", children: [
            "Analyze Your",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-primary text-glow", children: "Schema." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-6 max-w-lg text-sm text-muted-foreground md:text-base leading-relaxed", children: "SchemaSense scans, profiles and documents your data warehouse in seconds. See every column, every flow, every anomaly — instantly." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-6 max-w-3xl mt-2", children: [{
          label: "Columns Evaluated",
          value: 1862
        }, {
          label: "Anomalies Flagged",
          value: 36.2,
          suffix: "%"
        }].map((s, i) => /* @__PURE__ */ jsxs(motion.div, { initial: {
          opacity: 0,
          y: 12
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          delay: i * 0.08,
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1]
        }, className: "glass-panel-heavy backdrop-blur-lg border rounded-xl p-6 transition-all duration-300", children: [
          /* @__PURE__ */ jsx("div", { className: `font-display text-3xl font-bold md:text-4xl ${i === 0 ? "text-primary text-glow" : ""}`, children: /* @__PURE__ */ jsx(CountUp, { to: s.value, suffix: s.suffix ?? "" }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground", children: s.label })
        ] }, s.label)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxs("a", { href: "/upload", className: "group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02]", children: [
            "Upload a schema",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" })
          ] }),
          /* @__PURE__ */ jsx("a", { href: "/dictionary", className: "inline-flex items-center gap-2 rounded-full border border-border bg-black/5 dark:bg-white/5 px-6 py-3 text-sm font-medium text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors", children: "Browse dictionary" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1 relative", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsx(StatusCard, { kicker: "LIVE · PROCESSING", dotPulse: true, title: "orders_2026.parquet", metric: "2 : 1", detail: "Throughput · 14.2k rows/s", tone: "lime", delay: 0.1 }),
        /* @__PURE__ */ jsx(StatusCard, { kicker: "TOP COLUMN ISSUES", shake: true, title: "cust_id · email · ts_created", metric: "36.2", detail: "Drift score · 3 columns affected", tone: "red", delay: 0.25 }),
        /* @__PURE__ */ jsx(StatusCard, { kicker: "SYSTEM OVERVIEW", dotPulse: true, title: "All engines nominal", metric: "99.98", detail: "Uptime % · last 30 days", tone: "lime", delay: 0.4 })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-full border glass-panel-heavy backdrop-blur-md py-3 px-2", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" }),
      /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" }),
      /* @__PURE__ */ jsx("div", { className: "flex animate-ticker whitespace-nowrap font-mono-tight text-xs text-muted-foreground", children: [...tickerEvents, ...tickerEvents].map((e, i) => /* @__PURE__ */ jsxs("span", { className: "mx-8 inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: "EVT" }),
        /* @__PURE__ */ jsx("span", { children: e })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(SectionTitle, { kicker: "Modules", title: /* @__PURE__ */ jsxs(Fragment, { children: [
        "Eight surfaces. One ",
        /* @__PURE__ */ jsx("span", { className: "text-primary", children: "brain." })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4", children: [{
        t: "Upload",
        d: "Drag, drop, ingest."
      }, {
        t: "Dictionary",
        d: "AI-written column defs."
      }, {
        t: "Ask AI",
        d: "Chat with your schema."
      }, {
        t: "Profiler",
        d: "Distributions & nulls."
      }, {
        t: "Anomalies",
        d: "Live drift alerts."
      }, {
        t: "Lineage",
        d: "Visual data graph."
      }, {
        t: "Export",
        d: "JSON · CSV · PDF."
      }, {
        t: "Engine",
        d: "Real-time, always-on."
      }].map((m, i) => /* @__PURE__ */ jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, whileInView: {
        opacity: 1,
        y: 0
      }, viewport: {
        once: true
      }, transition: {
        delay: i * 0.05
      }, className: "group relative overflow-hidden rounded-xl border glass-panel-heavy backdrop-blur-md p-5 transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "font-display text-xl font-semibold", children: m.t }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: m.d }),
        /* @__PURE__ */ jsx("div", { className: "absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/0 blur-2xl transition-all group-hover:bg-primary/30" })
      ] }, m.t)) })
    ] })
  ] });
}
function StatusCard({
  kicker,
  title,
  metric,
  detail,
  tone,
  delay = 0,
  dotPulse,
  shake
}) {
  return /* @__PURE__ */ jsx(motion.div, { initial: {
    opacity: 0,
    x: 24
  }, animate: {
    opacity: 1,
    x: 0
  }, transition: {
    delay,
    type: "spring",
    stiffness: 200,
    damping: 22
  }, className: "relative", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden glass-panel-heavy backdrop-blur-lg border rounded-xl p-6 transition-all duration-300", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-[0.2em] ${tone === "lime" ? "text-primary" : "text-destructive"}`, children: [
        dotPulse && /* @__PURE__ */ jsx("span", { className: `h-2 w-2 animate-pulse-dot rounded-full ${tone === "lime" ? "bg-primary glow-lime" : "bg-destructive"}` }),
        kicker
      ] }),
      tone === "lime" ? /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsx(AlertTriangle, { className: `h-4 w-4 text-destructive ${shake ? "animate-micro-shake" : ""}` })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "truncate font-display text-base font-semibold", children: title }),
        /* @__PURE__ */ jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: detail })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `font-display text-4xl font-bold ${tone === "lime" ? "text-primary text-glow" : "text-destructive"} ${shake ? "animate-micro-shake" : ""}`, children: metric })
    ] }),
    tone === "red" && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { tone: "red", children: "Action required" }),
      /* @__PURE__ */ jsx(Pill, { tone: "muted", children: "3 cols" })
    ] }),
    tone === "lime" && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { tone: "lime", children: "Healthy" }),
      /* @__PURE__ */ jsx(Cpu, { className: "h-3.5 w-3.5 text-muted-foreground" })
    ] })
  ] }) });
}
export {
  Index as component
};
