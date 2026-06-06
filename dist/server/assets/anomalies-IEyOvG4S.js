import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Type, Copy, Clock, AlertTriangle } from "lucide-react";
import { S as SectionTitle, G as GlassCard, P as Pill } from "./ui-bits-DiJjH9oN.js";
const defaultItems = [{
  icon: Type,
  sev: "high",
  title: "Type mismatch · revenue_usd",
  desc: "12 rows ingested as string instead of decimal in the last hour.",
  col: "revenue_usd",
  t: "2m ago"
}, {
  icon: Copy,
  sev: "med",
  title: "Duplicate keys · cust_id",
  desc: "3 duplicated cust_id values detected in stg_customers.",
  col: "cust_id",
  t: "11m ago"
}, {
  icon: Clock,
  sev: "high",
  title: "Null spike · last_login",
  desc: "Null rate jumped from 4.1% to 12.3% over the last 30 minutes.",
  col: "last_login",
  t: "18m ago"
}, {
  icon: AlertTriangle,
  sev: "low",
  title: "Format drift · email",
  desc: "0.3% of incoming emails fail the canonical regex.",
  col: "email",
  t: "1h ago"
}, {
  icon: AlertTriangle,
  sev: "med",
  title: "Schema change · orders.v3",
  desc: "New nullable column `discount_code` appeared upstream.",
  col: "discount_code",
  t: "3h ago"
}];
function Anomalies() {
  const [items, setItems] = useState(defaultItems);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const errorTemplates = [{
            t: "Type mismatch",
            d: "rows ingested as incorrect type instead of expected format.",
            icon: Type
          }, {
            t: "Duplicate keys",
            d: "duplicated values detected bypassing unique constraint.",
            icon: Copy
          }, {
            t: "Null spike",
            d: "Null rate jumped significantly over the last 30 minutes.",
            icon: Clock
          }, {
            t: "Format drift",
            d: "% of incoming records fail the canonical regex format.",
            icon: AlertTriangle
          }, {
            t: "Schema drift",
            d: "unexpected new data shape detected upstream.",
            icon: AlertTriangle
          }];
          let hash = 0;
          parsed.forEach((p) => {
            hash += (p.name.charCodeAt(0) || 0) + p.name.length;
          });
          const maxPossible = Math.min(parsed.length, 4);
          const anomalyCount = Math.max(1, hash % maxPossible + 1);
          const mappedItems = parsed.slice(0, anomalyCount).map((p, i) => {
            const tmpl = errorTemplates[(hash + i) % errorTemplates.length];
            const prefix = i === 2 || i === 4 ? "" : (i === 3 ? (hash % 20 / 10).toFixed(1) : hash % 15 + 2) + " ";
            return {
              icon: tmpl.icon,
              sev: (hash + i) % 3 === 0 ? "high" : (hash + i) % 3 === 1 ? "med" : "low",
              title: `${tmpl.t} · ${p.name}`,
              desc: `${prefix}${tmpl.d}`,
              col: p.name,
              t: `${i * 4 + hash % 5 + 1}m ago`
            };
          });
          setItems(mappedItems);
        }
      }
    } catch (e) {
    }
  }, []);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 05 / Anomalies", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Live ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "drift & alerts." })
    ] }), sub: "Cards pulse when fresh, shake when flagged. Click to investigate the offending rows." }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: items.map((it, i) => /* @__PURE__ */ jsx(motion.div, { initial: {
      opacity: 0,
      y: 14
    }, animate: {
      opacity: 1,
      y: 0
    }, transition: {
      delay: i * 0.08,
      type: "spring",
      stiffness: 220,
      damping: 24
    }, whileHover: {
      x: [0, -1, 1, 0],
      transition: {
        duration: 0.25
      }
    }, children: /* @__PURE__ */ jsxs(GlassCard, { className: `relative overflow-hidden p-5 ${it.sev === "high" ? "border-destructive/50" : ""}`, children: [
      it.sev === "high" && /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-destructive/20 blur-3xl" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${it.sev === "high" ? "border-destructive/60 bg-destructive/10 text-destructive animate-micro-shake" : it.sev === "med" ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"}`, children: /* @__PURE__ */ jsx(it.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "font-display text-base font-semibold", children: it.title }),
            /* @__PURE__ */ jsx("span", { className: "font-mono-tight text-[10px] text-muted-foreground", children: it.t })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 text-sm text-muted-foreground", children: it.desc }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsx(Pill, { tone: it.sev === "high" ? "red" : it.sev === "med" ? "lime" : "muted", children: it.sev === "high" ? "Critical" : it.sev === "med" ? "Warning" : "Info" }),
            /* @__PURE__ */ jsxs(Pill, { tone: "muted", children: [
              "col · ",
              it.col
            ] })
          ] })
        ] })
      ] })
    ] }) }, it.title)) })
  ] });
}
export {
  Anomalies as component
};
