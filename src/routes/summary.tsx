import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { GlassCard, Pill, SectionTitle, CountUp } from "@/components/ui-bits";

export const Route = createFileRoute("/summary")({
  head: () => ({ meta: [{ title: "Summary · SchemaSense" }] }),
  component: Summary,
});

const columns = [
  {
    name: "revenue_usd",
    type: "decimal(12,2)",
    min: 0, max: 18420, unique: 91241, nulls: 8.7,
    dist: [4, 12, 28, 56, 78, 92, 70, 54, 32, 18, 9, 4],
  },
  {
    name: "country",
    type: "string(2)",
    min: "AD", max: "ZW", unique: 187, nulls: 0.4,
    dist: [88, 74, 62, 48, 36, 30, 24, 18, 12, 8, 5, 3],
  },
  {
    name: "last_login",
    type: "timestamp",
    min: "2024-01-02", max: "2026-06-03", unique: 184022, nulls: 12.3,
    dist: [6, 10, 14, 22, 34, 48, 62, 78, 90, 72, 50, 28],
  },
];

const typeBreakdown = [
  { t: "string", pct: 38 },
  { t: "numeric", pct: 26 },
  { t: "timestamp", pct: 14 },
  { t: "boolean", pct: 9 },
  { t: "uuid", pct: 8 },
  { t: "enum", pct: 5 },
];

function Summary() {
  return (
    <div>
      <SectionTitle
        kicker="Step 04 / Summary"
        title={<>Statistics, <span className="text-primary">visualized.</span></>}
        sub="Distributions, nulls, uniques and ranges for every column — animated from zero on every render."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          { l: "Avg null %", v: 4.1, s: "%" },
          { l: "High-cardinality cols", v: 92 },
          { l: "Type collisions", v: 7 },
          { l: "Rows profiled", v: 1840022 },
        ].map((s) => (
          <GlassCard key={s.l} className="p-4">
            <div className="font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</div>
            <div className="mt-1 font-display text-3xl font-bold text-primary text-glow"><CountUp to={s.v} suffix={s.s ?? ""} /></div>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {columns.map((c, ci) => (
            <GlassCard key={c.name} className="p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="font-display text-xl font-semibold">{c.name}</div>
                  <div className="font-mono-tight text-xs text-muted-foreground">{c.type}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="muted">min · {String(c.min)}</Pill>
                  <Pill tone="muted">max · {String(c.max)}</Pill>
                  <Pill tone="lime">{c.unique.toLocaleString()} unique</Pill>
                  <Pill tone={c.nulls > 10 ? "red" : "muted"}>{c.nulls}% null</Pill>
                </div>
              </div>

              <div className="mt-5 flex h-32 items-end gap-1.5">
                {c.dist.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: ci * 0.1 + i * 0.03, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                    style={{ minHeight: 2 }}
                  />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-5">
          <div className="font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
            Data type breakdown
          </div>
          <div className="mt-4 space-y-3">
            {typeBreakdown.map((r, i) => (
              <div key={r.t}>
                <div className="mb-1 flex items-center justify-between font-mono-tight text-xs">
                  <span>{r.t}</span>
                  <span className="text-muted-foreground">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-primary glow-lime"
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}