import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/dictionary")({
  head: () => ({ meta: [{ title: "Dictionary · SchemaSense" }] }),
  component: Dictionary,
});

const defaultRows = [
  { col: "cust_id", type: "uuid", nullable: false, def: "Unique customer identifier issued at signup.", lineage: ["raw.users", "stg_customers", "dim_customer"] },
  { col: "email", type: "string", nullable: true, def: "Primary contact email — lower-cased and trimmed during ingestion.", lineage: ["raw.users", "dim_customer"] },
  { col: "signup_ts", type: "timestamp", nullable: false, def: "UTC moment the user completed onboarding.", lineage: ["raw.events", "fact_signup"] },
  { col: "country", type: "string(2)", nullable: false, def: "ISO 3166-1 alpha-2 country code resolved from IP at signup.", lineage: ["raw.events", "dim_geo"] },
  { col: "revenue_usd", type: "decimal(12,2)", nullable: true, def: "Trailing 30-day revenue in USD, FX-normalized.", lineage: ["raw.payments", "fact_revenue", "mart_finance"] },
  { col: "is_active", type: "boolean", nullable: false, def: "True if user logged in within the last 30 days.", lineage: ["fact_sessions", "dim_customer"] },
  { col: "plan_tier", type: "enum", nullable: false, def: "One of free, pro, team, enterprise.", lineage: ["raw.subscriptions", "dim_plan"] },
  { col: "last_login", type: "timestamp", nullable: true, def: "Most recent successful authentication timestamp (UTC).", lineage: ["raw.auth", "fact_sessions"] },
  { col: "churn_risk", type: "float", nullable: true, def: "Model-scored probability the user will churn in 30d.", lineage: ["model.churn_v3", "mart_growth"] },
  { col: "lifetime_orders", type: "int", nullable: false, def: "Cumulative completed orders for this customer.", lineage: ["fact_orders", "dim_customer"] },
];

function Dictionary() {
  const [rows, setRows] = useState(defaultRows);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
           const mappedRows = parsed.map((p: any) => ({
             col: p.name,
             type: p.type,
             nullable: p.null !== "0%",
             def: `Dynamic definition generated for ${p.name}.`,
             lineage: ["raw.upload", "stg_dynamic"]
           }));
           setRows(mappedRows);
        }
      }
    } catch(e){}
  }, []);

  return (
    <div>
      <SectionTitle
        kicker="Step 02 / Dictionary"
        title={<>Every column, <span className="text-primary">defined.</span></>}
        sub="AI-written definitions, types, nullability, and lineage tags for every field — generated live."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2.5 backdrop-blur">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search columns, types, tags…"
          />
          <Pill tone="lime"><Sparkles className="h-3 w-3" /> AI</Pill>
        </div>
        <div className="flex gap-2 font-mono-tight text-xs">
          <Pill tone="muted">All ({rows.length})</Pill>
          <Pill tone="muted">Nullable</Pill>
          <Pill tone="lime">PII</Pill>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="grid grid-cols-12 gap-4 border-b border-border/60 px-5 py-3 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Column</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1">Null</div>
          <div className="col-span-3">AI Definition</div>
          <div className="col-span-3">Lineage</div>
        </div>
        <ul>
          {rows.map((r, i) => (
            <motion.li
              key={r.col}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-12 items-center gap-4 border-b border-border/40 px-5 py-4 text-sm transition-colors hover:bg-primary/5"
            >
              <div className="col-span-3 flex items-center gap-2 font-mono-tight">
                <span className="h-1.5 w-1.5 rounded-full bg-primary glow-lime" />
                {r.col}
              </div>
              <div className="col-span-2">
                <span className="font-mono-tight text-[11px] rounded bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[#E5E7EB]">
                  {r.type}
                </span>
              </div>
              <div className="col-span-1">
                {r.nullable ? <Pill tone="red">YES</Pill> : <Pill tone="muted">NO</Pill>}
              </div>
              <div className="col-span-3 text-muted-foreground">
                <TypingLine text={r.def} delay={i * 0.08 + 0.2} />
              </div>
              <div className="col-span-3 flex flex-wrap gap-1.5">
                {r.lineage.map((l) => (
                  <span key={l} className="font-mono-tight text-[10px] rounded border border-border bg-secondary/60 px-1.5 py-0.5 text-foreground/80">
                    {l}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function TypingLine({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.span
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ delay, duration: 0.7, ease: "linear" }}
      className="block overflow-hidden whitespace-nowrap"
      style={{ display: "block" }}
    >
      <span className="whitespace-normal">{text}</span>
    </motion.span>
  );
}