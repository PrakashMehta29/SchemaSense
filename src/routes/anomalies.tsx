import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AlertTriangle, Copy, Type, Clock } from "lucide-react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/anomalies")({
  head: () => ({ meta: [{ title: "Anomalies · SchemaSense" }] }),
  component: Anomalies,
});

const items = [
  { icon: Type, sev: "high", title: "Type mismatch · revenue_usd", desc: "12 rows ingested as string instead of decimal in the last hour.", col: "revenue_usd", t: "2m ago" },
  { icon: Copy, sev: "med", title: "Duplicate keys · cust_id", desc: "3 duplicated cust_id values detected in stg_customers.", col: "cust_id", t: "11m ago" },
  { icon: Clock, sev: "high", title: "Null spike · last_login", desc: "Null rate jumped from 4.1% to 12.3% over the last 30 minutes.", col: "last_login", t: "18m ago" },
  { icon: AlertTriangle, sev: "low", title: "Format drift · email", desc: "0.3% of incoming emails fail the canonical regex.", col: "email", t: "1h ago" },
  { icon: AlertTriangle, sev: "med", title: "Schema change · orders.v3", desc: "New nullable column `discount_code` appeared upstream.", col: "discount_code", t: "3h ago" },
];

function Anomalies() {
  return (
    <div>
      <SectionTitle
        kicker="Step 05 / Anomalies"
        title={<>Live <span className="text-primary">drift &amp; alerts.</span></>}
        sub="Cards pulse when fresh, shake when flagged. Click to investigate the offending rows."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 220, damping: 24 }}
            whileHover={{ x: [0, -1, 1, 0], transition: { duration: 0.25 } }}
          >
            <GlassCard className={`relative overflow-hidden p-5 ${it.sev === "high" ? "border-destructive/50" : ""}`}>
              {it.sev === "high" && (
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-destructive/20 blur-3xl" />
              )}
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  it.sev === "high"
                    ? "border-destructive/60 bg-destructive/10 text-destructive animate-micro-shake"
                    : it.sev === "med"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground"
                }`}>
                  <it.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-base font-semibold">{it.title}</div>
                    <span className="font-mono-tight text-[10px] text-muted-foreground">{it.t}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{it.desc}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Pill tone={it.sev === "high" ? "red" : it.sev === "med" ? "lime" : "muted"}>
                      {it.sev === "high" ? "Critical" : it.sev === "med" ? "Warning" : "Info"}
                    </Pill>
                    <Pill tone="muted">col · {it.col}</Pill>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}