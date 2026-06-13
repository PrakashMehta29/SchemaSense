import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { S as SectionTitle, P as Pill, G as GlassCard } from "./ui-bits-DiJjH9oN.js";
import "react";
const nodes = [{
  id: "raw_users",
  x: 60,
  y: 80,
  label: "raw.users",
  layer: "raw"
}, {
  id: "raw_events",
  x: 60,
  y: 200,
  label: "raw.events",
  layer: "raw"
}, {
  id: "raw_payments",
  x: 60,
  y: 320,
  label: "raw.payments",
  layer: "raw"
}, {
  id: "stg_cust",
  x: 400,
  y: 100,
  label: "stg_customers",
  layer: "stg"
}, {
  id: "stg_orders",
  x: 400,
  y: 240,
  label: "stg_orders",
  layer: "stg"
}, {
  id: "stg_rev",
  x: 400,
  y: 360,
  label: "stg_revenue",
  layer: "stg"
}, {
  id: "dim_cust",
  x: 740,
  y: 80,
  label: "dim_customer",
  layer: "mart"
}, {
  id: "fact_orders",
  x: 740,
  y: 220,
  label: "fact_orders",
  layer: "mart"
}, {
  id: "mart_fin",
  x: 740,
  y: 360,
  label: "mart_finance",
  layer: "mart"
}];
const edges = [["raw_users", "stg_cust"], ["raw_events", "stg_cust"], ["raw_events", "stg_orders"], ["raw_payments", "stg_rev"], ["stg_cust", "dim_cust"], ["stg_orders", "fact_orders"], ["stg_rev", "fact_orders"], ["stg_rev", "mart_fin"], ["fact_orders", "mart_fin"]];
function Lineage() {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 06 / Lineage", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Data ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "flow." })
    ] }), sub: "A live node-graph of every source, staging table and downstream mart." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { tone: "muted", children: "3 layers" }),
      /* @__PURE__ */ jsxs(Pill, { tone: "muted", children: [
        nodes.length,
        " nodes"
      ] }),
      /* @__PURE__ */ jsxs(Pill, { tone: "lime", children: [
        edges.length,
        " edges"
      ] })
    ] }),
    /* @__PURE__ */ jsx(GlassCard, { className: "relative overflow-hidden p-4", children: /* @__PURE__ */ jsx("div", { className: "relative aspect-[16/9] w-full", children: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 820 440", className: "absolute inset-0 h-full w-full", children: [
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: "edge", x1: "0", x2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "var(--primary)", stopOpacity: 0.15 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "var(--primary)", stopOpacity: 0.7 })
        ] }),
        /* @__PURE__ */ jsxs("filter", { id: "glow", children: [
          /* @__PURE__ */ jsx("feGaussianBlur", { stdDeviation: "3", result: "b" }),
          /* @__PURE__ */ jsxs("feMerge", { children: [
            /* @__PURE__ */ jsx("feMergeNode", { in: "b" }),
            /* @__PURE__ */ jsx("feMergeNode", { in: "SourceGraphic" })
          ] })
        ] })
      ] }),
      ["RAW", "STAGING", "MART"].map((l, i) => /* @__PURE__ */ jsx("text", { x: 60 + i * 340, y: 28, className: "fill-muted-foreground", style: {
        fontFamily: "JetBrains Mono",
        fontSize: 10,
        letterSpacing: 2
      }, children: l }, l)),
      edges.map(([a, b], i) => {
        const A = byId[a], B = byId[b];
        const mx = (A.x + B.x) / 2;
        const d = `M ${A.x + 80} ${A.y + 18} C ${mx} ${A.y + 18}, ${mx} ${B.y + 18}, ${B.x} ${B.y + 18}`;
        return /* @__PURE__ */ jsx(motion.path, { d, fill: "none", stroke: "url(#edge)", strokeWidth: 1.5, initial: {
          pathLength: 0,
          opacity: 0
        }, animate: {
          pathLength: 1,
          opacity: 1
        }, transition: {
          delay: 0.2 + i * 0.08,
          duration: 0.8,
          ease: "easeOut"
        } }, i);
      }),
      nodes.map((n, i) => /* @__PURE__ */ jsxs(motion.g, { initial: {
        opacity: 0,
        scale: 0.6
      }, animate: {
        opacity: 1,
        scale: 1
      }, transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 240,
        damping: 20
      }, children: [
        /* @__PURE__ */ jsx("rect", { x: n.x, y: n.y, width: 80, height: 36, rx: 8, fill: "var(--card)", stroke: n.layer === "mart" ? "var(--primary)" : "var(--primary)", strokeOpacity: n.layer === "mart" ? 1 : 0.4, strokeWidth: n.layer === "mart" ? 1.5 : 1, filter: n.layer === "mart" ? "url(#glow)" : void 0 }),
        /* @__PURE__ */ jsx("text", { x: n.x + 40, y: n.y + 22, textAnchor: "middle", className: "fill-foreground", style: {
          fontFamily: "JetBrains Mono",
          fontSize: 10
        }, children: n.label })
      ] }, n.id))
    ] }) }) })
  ] });
}
export {
  Lineage as component
};
