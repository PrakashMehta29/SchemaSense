import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { S as SectionTitle, P as Pill, G as GlassCard } from "./ui-bits-DiJjH9oN.js";
const defaultRows = [{
  col: "cust_id",
  type: "uuid",
  nullable: false,
  def: "Unique customer identifier issued at signup.",
  lineage: ["raw.users", "stg_customers", "dim_customer"]
}, {
  col: "email",
  type: "string",
  nullable: true,
  def: "Primary contact email — lower-cased and trimmed during ingestion.",
  lineage: ["raw.users", "dim_customer"]
}, {
  col: "signup_ts",
  type: "timestamp",
  nullable: false,
  def: "UTC moment the user completed onboarding.",
  lineage: ["raw.events", "fact_signup"]
}, {
  col: "country",
  type: "string(2)",
  nullable: false,
  def: "ISO 3166-1 alpha-2 country code resolved from IP at signup.",
  lineage: ["raw.events", "dim_geo"]
}, {
  col: "revenue_usd",
  type: "decimal(12,2)",
  nullable: true,
  def: "Trailing 30-day revenue in USD, FX-normalized.",
  lineage: ["raw.payments", "fact_revenue", "mart_finance"]
}, {
  col: "is_active",
  type: "boolean",
  nullable: false,
  def: "True if user logged in within the last 30 days.",
  lineage: ["fact_sessions", "dim_customer"]
}, {
  col: "plan_tier",
  type: "enum",
  nullable: false,
  def: "One of free, pro, team, enterprise.",
  lineage: ["raw.subscriptions", "dim_plan"]
}, {
  col: "last_login",
  type: "timestamp",
  nullable: true,
  def: "Most recent successful authentication timestamp (UTC).",
  lineage: ["raw.auth", "fact_sessions"]
}, {
  col: "churn_risk",
  type: "float",
  nullable: true,
  def: "Model-scored probability the user will churn in 30d.",
  lineage: ["model.churn_v3", "mart_growth"]
}, {
  col: "lifetime_orders",
  type: "int",
  nullable: false,
  def: "Cumulative completed orders for this customer.",
  lineage: ["fact_orders", "dim_customer"]
}];
function Dictionary() {
  const [rows, setRows] = useState(defaultRows);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const mappedRows = parsed.map((p) => ({
            col: p.name,
            type: p.type,
            nullable: p.null !== "0%",
            def: `Dynamic definition generated for ${p.name}.`,
            lineage: ["raw.upload", "stg_dynamic"]
          }));
          setRows(mappedRows);
        }
      }
    } catch (e) {
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 02 / Dictionary", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Every column, ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "defined." })
    ] }), sub: "AI-written definitions, types, nullability, and lineage tags for every field — generated live." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2.5 backdrop-blur", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground", placeholder: "Search columns, types, tags…" }),
        /* @__PURE__ */ jsxs(Pill, { tone: "lime", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }),
          " AI"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 font-mono-tight text-xs", children: [
        /* @__PURE__ */ jsxs(Pill, { tone: "muted", children: [
          "All (",
          rows.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx(Pill, { tone: "muted", children: "Nullable" }),
        /* @__PURE__ */ jsx(Pill, { tone: "lime", children: "PII" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(GlassCard, { className: "overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-4 border-b border-border/60 px-5 py-3 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "Column" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: "Type" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-1", children: "Null" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "AI Definition" }),
        /* @__PURE__ */ jsx("div", { className: "col-span-3", children: "Lineage" })
      ] }),
      /* @__PURE__ */ jsx("ul", { children: rows.map((r, i) => /* @__PURE__ */ jsxs(motion.li, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: i * 0.08,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1]
      }, className: "grid grid-cols-12 items-center gap-4 border-b border-border/40 px-5 py-4 text-sm transition-colors hover:bg-primary/5", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-span-3 flex items-center gap-2 font-mono-tight", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary glow-lime" }),
          r.col
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx("span", { className: "font-mono-tight text-[11px] rounded bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[#E5E7EB]", children: r.type }) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-1", children: r.nullable ? /* @__PURE__ */ jsx(Pill, { tone: "red", children: "YES" }) : /* @__PURE__ */ jsx(Pill, { tone: "muted", children: "NO" }) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-3 text-muted-foreground", children: /* @__PURE__ */ jsx(TypingLine, { text: r.def, delay: i * 0.08 + 0.2 }) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-3 flex flex-wrap gap-1.5", children: r.lineage.map((l) => /* @__PURE__ */ jsx("span", { className: "font-mono-tight text-[10px] rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-foreground/80", children: l }, l)) })
      ] }, r.col)) })
    ] })
  ] });
}
function TypingLine({
  text,
  delay
}) {
  return /* @__PURE__ */ jsx(motion.span, { initial: {
    width: 0
  }, animate: {
    width: "100%"
  }, transition: {
    delay,
    duration: 0.7,
    ease: "linear"
  }, className: "block overflow-hidden whitespace-nowrap", style: {
    display: "block"
  }, children: /* @__PURE__ */ jsx("span", { className: "whitespace-normal", children: text }) });
}
export {
  Dictionary as component
};
