import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { S as SectionTitle, G as GlassCard, C as CountUp, P as Pill } from "./ui-bits-DiJjH9oN.js";
const defaultColumns = [{
  name: "revenue_usd",
  type: "decimal(12,2)",
  min: 0,
  max: 18420,
  unique: 91241,
  nulls: 8.7,
  dist: [4, 12, 28, 56, 78, 92, 70, 54, 32, 18, 9, 4]
}, {
  name: "country",
  type: "string(2)",
  min: "AD",
  max: "ZW",
  unique: 187,
  nulls: 0.4,
  dist: [88, 74, 62, 48, 36, 30, 24, 18, 12, 8, 5, 3]
}, {
  name: "last_login",
  type: "timestamp",
  min: "2024-01-02",
  max: "2026-06-03",
  unique: 184022,
  nulls: 12.3,
  dist: [6, 10, 14, 22, 34, 48, 62, 78, 90, 72, 50, 28]
}];
const typeBreakdown = [{
  t: "string",
  pct: 38
}, {
  t: "numeric",
  pct: 26
}, {
  t: "timestamp",
  pct: 14
}, {
  t: "boolean",
  pct: 9
}, {
  t: "uuid",
  pct: 8
}, {
  t: "enum",
  pct: 5
}];
function Summary() {
  const [columns, setColumns] = useState(defaultColumns);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const richCols = parsed.slice(0, 8).map((p, i) => ({
            name: p.name,
            type: p.type === "string" ? "string(2)" : p.type,
            min: i === 0 ? 0 : "A",
            max: i === 0 ? 18420 : "Z",
            unique: Math.floor(Math.random() * 1e4) + 1,
            nulls: parseFloat(p.null) || 0,
            dist: Array.from({
              length: 12
            }, () => Math.floor(Math.random() * 100))
          }));
          setColumns(richCols);
        }
      }
    } catch (e) {
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 04 / Summary", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Statistics, ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "visualized." })
    ] }), sub: "Distributions, nulls, uniques and ranges for every column — animated from zero on every render." }),
    /* @__PURE__ */ jsx("div", { className: "mb-6 grid gap-4 md:grid-cols-4", children: [{
      l: "Avg null %",
      v: 4.1,
      s: "%"
    }, {
      l: "High-cardinality cols",
      v: 92
    }, {
      l: "Type collisions",
      v: 7
    }, {
      l: "Rows profiled",
      v: 1840022
    }].map((s) => /* @__PURE__ */ jsxs(GlassCard, { className: "p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground", children: s.l }),
      /* @__PURE__ */ jsx("div", { className: "mt-1 font-display text-3xl font-bold text-primary text-glow", children: /* @__PURE__ */ jsx(CountUp, { to: s.v, suffix: s.s ?? "" }) })
    ] }, s.l)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[2fr_1fr]", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: columns.map((c, ci) => /* @__PURE__ */ jsxs(GlassCard, { className: "p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-display text-xl font-semibold", children: c.name }),
            /* @__PURE__ */ jsx("div", { className: "font-mono-tight text-xs text-muted-foreground", children: c.type })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxs(Pill, { tone: "muted", children: [
              "min · ",
              String(c.min)
            ] }),
            /* @__PURE__ */ jsxs(Pill, { tone: "muted", children: [
              "max · ",
              String(c.max)
            ] }),
            /* @__PURE__ */ jsxs(Pill, { tone: "lime", children: [
              c.unique.toLocaleString(),
              " unique"
            ] }),
            /* @__PURE__ */ jsxs(Pill, { tone: c.nulls > 10 ? "red" : "muted", children: [
              c.nulls,
              "% null"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 flex h-32 items-end gap-1.5", children: c.dist.map((v, i) => /* @__PURE__ */ jsx(motion.div, { initial: {
          height: 0
        }, whileInView: {
          height: `${v}%`
        }, viewport: {
          once: true
        }, transition: {
          delay: ci * 0.1 + i * 0.03,
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1]
        }, className: "flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary", style: {
          minHeight: 2
        } }, i)) })
      ] }, c.name)) }),
      /* @__PURE__ */ jsxs(GlassCard, { className: "p-5", children: [
        /* @__PURE__ */ jsx("div", { className: "font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground", children: "Data type breakdown" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: typeBreakdown.map((r, i) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-1 flex items-center justify-between font-mono-tight text-xs", children: [
            /* @__PURE__ */ jsx("span", { children: r.t }),
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              r.pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-full bg-secondary", children: /* @__PURE__ */ jsx(motion.div, { initial: {
            width: 0
          }, whileInView: {
            width: `${r.pct}%`
          }, viewport: {
            once: true
          }, transition: {
            delay: i * 0.08,
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1]
          }, className: "h-full rounded-full bg-primary glow-lime" }) })
        ] }, r.t)) })
      ] })
    ] })
  ] });
}
export {
  Summary as component
};
