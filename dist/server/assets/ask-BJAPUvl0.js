import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { S as SectionTitle, G as GlassCard, P as Pill } from "./ui-bits-DiJjH9oN.js";
import { B as BrandLogo } from "./router-BoVz9pK2.js";
import "@tanstack/react-query";
import "@tanstack/react-router";
const seed = [{
  id: "1",
  role: "user",
  text: "What does cust_id mean?"
}, {
  id: "2",
  role: "ai",
  text: "cust_id is a uuid uniquely identifying each customer. It originates in raw.users and propagates to stg_customers and dim_customer. It is non-nullable and tagged as PII."
}, {
  id: "3",
  role: "user",
  text: "Which columns are most at risk of drift?"
}, {
  id: "4",
  role: "ai",
  text: "Top 3: revenue_usd (8.7% null spike), last_login (12.3% nulls today vs 4.1% baseline), and email (format drift detected on 0.3% of rows). I'd open Anomalies → Drift to inspect."
}];
const suggestions = ["What does churn_risk mean?", "Show me PII columns", "Which tables feed mart_finance?", "Summarize today's anomalies"];
function Ask() {
  const [messages, setMessages] = useState(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, typing]);
  const send = (text) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    setMessages((m) => [...m, {
      id,
      role: "user",
      text
    }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: crypto.randomUUID(),
        role: "ai",
        text: "Indexing schema… here is what I found: that column is referenced in 4 downstream models. Its definition was last refined 2 hours ago and matches the source contract."
      }]);
    }, 1100);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(SectionTitle, { kicker: "Step 03 / Ask AI", title: /* @__PURE__ */ jsxs(Fragment, { children: [
      "Chat with your ",
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "schema." })
    ] }), sub: "Ask anything about a column, a table, or the lineage between them. SchemaSense answers in real time." }),
    /* @__PURE__ */ jsxs(GlassCard, { className: "flex h-[68vh] flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { ref: scrollRef, className: "flex-1 space-y-4 overflow-y-auto p-6", children: /* @__PURE__ */ jsxs(AnimatePresence, { initial: false, children: [
        messages.map((m) => /* @__PURE__ */ jsx(motion.div, { initial: {
          opacity: 0,
          y: 14,
          scale: 0.96
        }, animate: {
          opacity: 1,
          y: 0,
          scale: 1
        }, exit: {
          opacity: 0
        }, transition: {
          type: "spring",
          stiffness: 260,
          damping: 22
        }, className: `flex ${m.role === "user" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxs("div", { className: `max-w-[78%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card/80 text-foreground"}`, children: [
          m.role === "ai" && /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center gap-1.5 font-mono-tight text-[10px] uppercase tracking-wider text-primary", children: [
            /* @__PURE__ */ jsx(BrandLogo, { className: "h-4 w-4" }),
            " SchemaSense"
          ] }),
          m.text
        ] }) }, m.id)),
        typing && /* @__PURE__ */ jsx(motion.div, { initial: {
          opacity: 0,
          y: 8
        }, animate: {
          opacity: 1,
          y: 0
        }, className: "flex justify-start", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 rounded-2xl border border-border/60 bg-card/80 px-4 py-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(motion.span, { animate: {
          y: [0, -4, 0],
          opacity: [0.4, 1, 0.4]
        }, transition: {
          duration: 0.9,
          repeat: Infinity,
          delay: i * 0.12
        }, className: "h-1.5 w-1.5 rounded-full bg-primary" }, i)) }) })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-border/60 p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3 flex flex-wrap gap-2", children: suggestions.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => send(s), className: "rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs hover:border-primary/40 hover:text-primary", children: s }, s)) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
          e.preventDefault();
          send(input);
        }, className: "flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2", children: [
          /* @__PURE__ */ jsx(Pill, { tone: "lime", children: "AI" }),
          /* @__PURE__ */ jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: 'Ask: "What does cust_id mean?"', className: "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" }),
          /* @__PURE__ */ jsxs("button", { type: "submit", className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground glow-lime", children: [
            "Send ",
            /* @__PURE__ */ jsx(Send, { className: "h-3 w-3" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Ask as component
};
