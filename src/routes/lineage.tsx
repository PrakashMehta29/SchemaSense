import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/lineage")({
  head: () => ({ meta: [{ title: "Lineage · SchemaSense" }] }),
  component: Lineage,
});

type Node = { id: string; x: number; y: number; label: string; layer: "raw" | "stg" | "mart" };
const nodes: Node[] = [
  { id: "raw_users",    x: 60,  y: 80,  label: "raw.users",    layer: "raw" },
  { id: "raw_events",   x: 60,  y: 200, label: "raw.events",   layer: "raw" },
  { id: "raw_payments", x: 60,  y: 320, label: "raw.payments", layer: "raw" },
  { id: "stg_cust",     x: 400, y: 100, label: "stg_customers",layer: "stg" },
  { id: "stg_orders",   x: 400, y: 240, label: "stg_orders",   layer: "stg" },
  { id: "stg_rev",      x: 400, y: 360, label: "stg_revenue",  layer: "stg" },
  { id: "dim_cust",     x: 740, y: 80,  label: "dim_customer", layer: "mart" },
  { id: "fact_orders",  x: 740, y: 220, label: "fact_orders",  layer: "mart" },
  { id: "mart_fin",     x: 740, y: 360, label: "mart_finance", layer: "mart" },
];
const edges: [string, string][] = [
  ["raw_users", "stg_cust"],
  ["raw_events", "stg_cust"],
  ["raw_events", "stg_orders"],
  ["raw_payments", "stg_rev"],
  ["stg_cust", "dim_cust"],
  ["stg_orders", "fact_orders"],
  ["stg_rev", "fact_orders"],
  ["stg_rev", "mart_fin"],
  ["fact_orders", "mart_fin"],
];

function Lineage() {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div>
      <SectionTitle
        kicker="Step 06 / Lineage"
        title={<>Data <span className="text-primary">flow.</span></>}
        sub="A live node-graph of every source, staging table and downstream mart."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Pill tone="muted">3 layers</Pill>
        <Pill tone="muted">{nodes.length} nodes</Pill>
        <Pill tone="lime">{edges.length} edges</Pill>
      </div>

      <GlassCard className="relative overflow-hidden p-4">
        <div className="relative aspect-[16/9] w-full">
          <svg viewBox="0 0 820 440" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="edge" x1="0" x2="1">
                <stop offset="0%" stopColor="rgba(204,255,0,0.15)" />
                <stop offset="100%" stopColor="rgba(204,255,0,0.7)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* layer labels */}
            {["RAW", "STAGING", "MART"].map((l, i) => (
              <text key={l} x={60 + i * 340} y={28} className="fill-muted-foreground" style={{ fontFamily: "JetBrains Mono", fontSize: 10, letterSpacing: 2 }}>
                {l}
              </text>
            ))}

            {edges.map(([a, b], i) => {
              const A = byId[a], B = byId[b];
              const mx = (A.x + B.x) / 2;
              const d = `M ${A.x + 80} ${A.y + 18} C ${mx} ${A.y + 18}, ${mx} ${B.y + 18}, ${B.x} ${B.y + 18}`;
              return (
                <motion.path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="url(#edge)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                />
              );
            })}

            {nodes.map((n, i) => (
              <motion.g
                key={n.id}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 240, damping: 20 }}
              >
                <rect
                  x={n.x} y={n.y} width={80} height={36} rx={8}
                  fill="rgba(11,11,12,0.85)"
                  stroke={n.layer === "mart" ? "#ccff00" : "rgba(204,255,0,0.4)"}
                  strokeWidth={n.layer === "mart" ? 1.5 : 1}
                  filter={n.layer === "mart" ? "url(#glow)" : undefined}
                />
                <text
                  x={n.x + 40} y={n.y + 22}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontFamily: "JetBrains Mono", fontSize: 10 }}
                >
                  {n.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
      </GlassCard>
    </div>
  );
}