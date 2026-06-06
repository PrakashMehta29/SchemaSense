import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { FileJson, FileSpreadsheet, FileText, CheckCircle2, Download } from "lucide-react";
import { S as SectionTitle, G as GlassCard, P as Pill } from "./ui-bits-DiJjH9oN.js";
import { useState } from "react";
const formats = [{
  i: FileJson,
  t: "JSON",
  d: "Machine-readable dictionary + lineage payload.",
  size: "412 KB"
}, {
  i: FileSpreadsheet,
  t: "CSV",
  d: "Flat column inventory for spreadsheets and BI tools.",
  size: "118 KB"
}, {
  i: FileText,
  t: "PDF",
  d: "Stakeholder-ready document with charts and definitions.",
  size: "1.4 MB"
}];
function Exporter() {
  const [processingId, setProcessingId] = useState(null);
  const [completedId, setCompletedId] = useState(null);
  const handleExport = (id) => {
    setProcessingId(id);
    setTimeout(() => {
      setProcessingId(null);
      setCompletedId(id);
      setTimeout(() => setCompletedId(null), 2e3);
    }, 2500);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 07 / Export", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Ship it ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "anywhere." })
    ] }), sub: "Quick-download cards for the most common destinations." }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: formats.map((f, i) => {
      const isProcessing = processingId === f.t;
      const isCompleted = completedId === f.t;
      return /* @__PURE__ */ jsx(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 220,
        damping: 24
      }, children: /* @__PURE__ */ jsxs(GlassCard, { className: `group relative overflow-hidden p-6 transition-colors ${isProcessing || isCompleted ? "border-primary/50" : "hover:border-primary/50"}`, children: [
        /* @__PURE__ */ jsx("div", { className: `pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all ${isProcessing || isCompleted ? "bg-primary/25" : "bg-primary/0 group-hover:bg-primary/25"}` }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${isProcessing || isCompleted ? "border-primary bg-primary/20 text-primary" : "border-primary/40 bg-primary/10 text-primary"}`, children: /* @__PURE__ */ jsx(f.i, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: f.size })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-5 font-display text-3xl font-bold", children: f.t }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: f.d }),
        /* @__PURE__ */ jsx("button", { disabled: isProcessing || isCompleted, onClick: () => handleExport(f.t), className: `mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${isCompleted ? "bg-green-500/20 text-green-500 border border-green-500/30" : isProcessing ? "bg-primary/20 text-primary animate-pulse" : "bg-primary text-primary-foreground glow-lime hover:opacity-90"}`, children: isCompleted ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "Downloaded ",
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" })
        ] }) : isProcessing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "Processing ",
          /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          "Download ",
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
        ] }) })
      ] }) }, f.t);
    }) }),
    /* @__PURE__ */ jsxs(GlassCard, { className: "mt-8 p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground", children: "Recent exports" }),
      /* @__PURE__ */ jsx("ul", { className: "mt-3 divide-y divide-border/40", children: [["revenue_dictionary.json", "2 min ago", "JSON"], ["columns_inventory.csv", "1 hr ago", "CSV"], ["q2_schema_report.pdf", "yesterday", "PDF"]].map(([n, t, k]) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between py-3 text-sm", children: [
        /* @__PURE__ */ jsx("div", { className: "font-mono-tight", children: n }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Pill, { tone: "muted", children: k }),
          /* @__PURE__ */ jsx("span", { className: "font-mono-tight text-xs", children: t })
        ] })
      ] }, n)) })
    ] })
  ] });
}
export {
  Exporter as component
};
