import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { GlassCard, Pill, SectionTitle, CountUp } from "@/components/ui-bits";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/summary")({
  head: () => ({ meta: [{ title: "Summary · SchemaSense" }] }),
  component: Summary,
});

type ColumnData = {
  name: string;
  type: string;
  min: string | number;
  max: string | number;
  unique: number;
  nulls: number;
  dist: number[];
};

const defaultColumns: ColumnData[] = [
  {
    name: "cust_id",
    type: "uuid",
    min: "0001bc5a",
    max: "fffe402a",
    unique: 1840022,
    nulls: 0,
    dist: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  },
  {
    name: "email",
    type: "email",
    min: "a@company.com",
    max: "z@domain.io",
    unique: 1540321,
    nulls: 2.1,
    dist: [12, 18, 24, 45, 67, 89, 76, 54, 32, 21, 14, 8],
  },
  {
    name: "revenue_usd",
    type: "decimal(12,2)",
    min: 0,
    max: 18420,
    unique: 91241,
    nulls: 8.7,
    dist: [4, 12, 28, 56, 78, 92, 70, 54, 32, 18, 9, 4],
  },
  {
    name: "country",
    type: "string(2)",
    min: "AD",
    max: "ZW",
    unique: 187,
    nulls: 0.4,
    dist: [88, 74, 62, 48, 36, 30, 24, 18, 12, 8, 5, 3],
  },
  {
    name: "last_login",
    type: "timestamp",
    min: "2024-01-02",
    max: "2026-06-03",
    unique: 184022,
    nulls: 12.3,
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

function AlertBadge({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-mono-tight text-[9px] font-bold uppercase tracking-wider text-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.2)]">
      <AlertTriangle className="h-3 w-3 shrink-0" />
      {title}
    </span>
  );
}

interface Anomaly {
  col: string;
  title: string;
  sev: string;
  desc: string;
}

interface Metric {
  l: string;
  v: number;
  s: string;
  subtitle?: string;
  decimals?: number;
}

function GlobalAlertBanner({ anomalies }: { anomalies: Anomaly[] }) {
  if (anomalies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 backdrop-blur-xl shadow-[0_8px_32px_rgba(239,68,68,0.04)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-destructive/30 to-transparent" />
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono-tight text-[9px] font-bold uppercase tracking-[0.2em] text-destructive leading-none">
              Critical Schema Alert
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          </div>
          <h2 className="mt-1 font-display text-base font-bold text-foreground leading-tight">
            Schema drift detected upstream
          </h2>
          <div className="mt-3.5 space-y-2.5">
            {anomalies.map((anom, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-l-2 border-destructive/40 pl-3">
                <span className="font-mono-tight text-[10px] font-bold text-destructive uppercase tracking-wider">
                  {anom.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed font-mono-tight">
                  {anom.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ContextAwareSummaryCard({
  column,
  anomaly,
  index,
}: {
  column: ColumnData;
  anomaly?: Anomaly;
  index: number;
}) {
  const type = column.type.toLowerCase();
  const name = column.name.toLowerCase();
  const hasAnomaly = !!anomaly;

  return (
    <GlassCard
      className={`p-5 transition-all duration-300 ${hasAnomaly ? "border-destructive/30 shadow-[0_4px_20px_rgba(239,68,68,0.03)]" : ""}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="font-display text-xl font-semibold">{column.name}</div>
            {hasAnomaly && <AlertBadge title={anomaly.title} />}
          </div>
          <div className="font-mono-tight text-xs text-muted-foreground mt-0.5">{column.type}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="muted">min · {String(column.min)}</Pill>
          <Pill tone="muted">max · {String(column.max)}</Pill>
          <Pill tone="lime">{column.unique.toLocaleString()} unique</Pill>
          <Pill tone={column.nulls > 10 ? "red" : "muted"}>{column.nulls}% null</Pill>
        </div>
      </div>

      {/* Conditionally Render Interior based on Column Type */}
      {(() => {
        if (type === "enum" || type === "boolean") {
          // Precise bar chart mapping category elements exactly
          const categories =
            name === "country"
              ? [
                  { label: "US", pct: 54 },
                  { label: "UK", pct: 28 },
                  { label: "DE", pct: 18 },
                ]
              : name === "is_active"
                ? [
                    { label: "true", pct: 64 },
                    { label: "false", pct: 36 },
                  ]
                : name === "plan_tier"
                  ? [
                      { label: "premium", pct: 45 },
                      { label: "basic", pct: 39 },
                      { label: "free", pct: 16 },
                    ]
                  : [
                      { label: "Value A", pct: 50 },
                      { label: "Value B", pct: 30 },
                      { label: "Value C", pct: 20 },
                    ];

          return (
            <div>
              <div className="mt-5 flex h-20 items-end justify-around gap-6 border-b border-border/30 pb-1 px-4">
                {categories.map((cat, i) => (
                  <div
                    key={cat.label}
                    className="flex-1 flex flex-col items-center h-full justify-end max-w-[80px]"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: `${cat.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="w-full rounded-t bg-gradient-to-t from-primary/40 to-primary glow-lime"
                      style={{ minHeight: 2 }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between gap-4 text-[9px] font-mono-tight text-muted-foreground uppercase border-t border-border/20 pt-2.5">
                <span>Top Categorical:</span>
                <div className="flex gap-4 text-foreground font-bold">
                  {categories.map((cat) => (
                    <span key={cat.label}>
                      {cat.label} ({cat.pct}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        if (type === "uuid" || type === "email") {
          // Data Quality Ring + text metrics (Format Conformity, Null Rate)
          const uniqueness = name === "cust_id" ? 100 : 92.4;
          const formatConformity = name === "cust_id" ? "100.0%" : "99.7%";
          const nullRate = `${column.nulls}%`;

          const cx = 32;
          const cy = 32;
          const r = 24;
          const stroke = 4.5;
          const circumference = r * 2 * Math.PI;
          const strokeDashoffset = circumference - (uniqueness / 100) * circumference;

          return (
            <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4 flex items-center justify-between h-32 gap-6 shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]">
              {/* Quality Ring */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative flex items-center justify-center h-16 w-16">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      className="text-secondary"
                      strokeWidth={stroke}
                      stroke="currentColor"
                      fill="transparent"
                      r={r}
                      cx={cx}
                      cy={cy}
                    />
                    <motion.circle
                      className="text-primary"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + " " + circumference}
                      style={{ strokeDashoffset }}
                      r={r}
                      cx={cx}
                      cy={cy}
                      strokeLinecap="round"
                      fill="transparent"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute font-mono-tight text-[10px] font-bold text-primary">
                    {uniqueness}%
                  </span>
                </div>
                <div>
                  <div className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground">
                    Uniqueness
                  </div>
                  <div className="font-display text-[10px] font-semibold text-primary">
                    Data Quality Ring
                  </div>
                </div>
              </div>

              {/* Text Metrics */}
              <div className="flex-1 grid grid-cols-2 gap-4 border-l border-border/40 pl-6 text-[10px] font-mono-tight uppercase tracking-wider">
                <div>
                  <div className="text-muted-foreground text-[8px] mb-0.5">Format Conformity</div>
                  <div className="font-bold text-foreground text-xs">{formatConformity}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[8px] mb-0.5">Null Rate</div>
                  <div className="font-bold text-foreground text-xs">{nullRate}</div>
                </div>
              </div>
            </div>
          );
        }

        if (type === "numeric" || type === "decimal" || type.includes("decimal")) {
          // Histogram + percentiles (Median, P90, P99)
          const minVal = typeof column.min === "number" ? column.min : 0;
          const maxVal = typeof column.max === "number" ? column.max : 100;
          const median = (minVal + maxVal) * 0.45;
          const p90 = minVal + (maxVal - minVal) * 0.85;
          const p99 = minVal + (maxVal - minVal) * 0.98;

          const formatVal = (val: number) => {
            return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
          };

          return (
            <div>
              <div className="mt-5 flex h-20 items-end gap-[2px] border-b border-border/20 pb-0.5">
                {[4, 12, 28, 56, 78, 92, 70, 54, 32, 18, 9, 4].map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${v}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 + i * 0.02, duration: 0.6 }}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/80 hover:from-primary hover:to-primary transition-colors"
                    style={{ minHeight: 2 }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground border-t border-border/20 pt-2.5 mt-2">
                <div>
                  <span className="text-[7.5px] text-muted-foreground block mb-0.5">Median</span>
                  <span className="font-bold text-foreground text-xs">{formatVal(median)}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-muted-foreground block mb-0.5">P90</span>
                  <span className="font-bold text-foreground text-xs">{formatVal(p90)}</span>
                </div>
                <div>
                  <span className="text-[7.5px] text-muted-foreground block mb-0.5">P99</span>
                  <span className="font-bold text-foreground text-xs">{formatVal(p99)}</span>
                </div>
              </div>
            </div>
          );
        }

        if (type === "timestamp") {
          // Sparkline velocity curve (SVG Line)
          const points = [12, 45, 30, 70, 50, 95, 88, 110, 85, 130, 115, 140];
          const width = 500;
          const height = 80;

          const pathD = points
            .map((p, i) => {
              const x = (i / (points.length - 1)) * width;
              const y = height - (p / 150) * height;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");

          const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

          return (
            <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4 flex flex-col justify-between h-32 relative overflow-hidden shadow-[inset_0_0_12px_rgba(16,185,129,0.02)]">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse glow-lime" />
                  <span className="font-mono-tight text-[10px] text-primary font-bold uppercase tracking-wider">
                    Row Velocity Curve
                  </span>
                </div>
                <span className="font-mono-tight text-[8px] text-muted-foreground uppercase">
                  Real-time Ingest Activity
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-20">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${width} ${height}`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="spark-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d={areaD}
                    fill="url(#spark-grad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
              </div>
            </div>
          );
        }

        // Fallback for string or generic types (standard bar chart)
        return (
          <div className="mt-5 flex h-32 items-end gap-1.5">
            {column.dist.map((v, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${v}%` }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1 + i * 0.03,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                style={{ minHeight: 2 }}
              />
            ))}
          </div>
        );
      })()}

      {/* Embedded Anomaly Alert Banner */}
      {hasAnomaly && (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-3 shadow-[inset_0_0_12px_rgba(239,68,68,0.02)]">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive mt-0.5">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono-tight text-[9px] font-bold uppercase tracking-wider text-destructive leading-none">
              Active Alert · {anomaly.title}
            </div>
            <div className="mt-1 text-xs text-muted-foreground leading-normal font-mono-tight">
              {anomaly.desc}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

function Summary() {
  const [columns, setColumns] = useState<ColumnData[]>(defaultColumns);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([
    { l: "Avg null %", v: 4.1, s: "%" },
    { l: "High-cardinality cols", v: 89.5, s: "%" },
    { l: "Type collisions", v: 7, s: "", decimals: 0 },
    { l: "Rows profiled", v: 1840022, s: "", decimals: 0 },
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const richCols = parsed
            .slice(0, 8)
            .map((p: { name: string; type: string; null?: string | number }, i: number) => {
              let inferredType = p.type;
              const nameLower = p.name.toLowerCase();
              const typeLower = p.type.toLowerCase();

              if (nameLower === "cust_id" || typeLower === "uuid") inferredType = "uuid";
              else if (nameLower === "email") inferredType = "email";
              else if (
                typeLower === "number" ||
                typeLower === "integer" ||
                typeLower.includes("decimal")
              )
                inferredType = "numeric";
              else if (nameLower === "is_active" || typeLower === "boolean")
                inferredType = "boolean";
              else if (nameLower === "plan_tier" || typeLower === "enum") inferredType = "enum";
              else if (
                nameLower === "signup_ts" ||
                nameLower === "last_login" ||
                nameLower.includes("time") ||
                nameLower.includes("date") ||
                nameLower.includes("login") ||
                nameLower.includes("ts") ||
                typeLower === "timestamp"
              ) {
                inferredType = "timestamp";
              }

              return {
                name: p.name,
                type: inferredType,
                min:
                  p.name === "cust_id"
                    ? "0001bc5a"
                    : p.name === "email"
                      ? "a@company.com"
                      : i === 4
                        ? 0
                        : "A",
                max:
                  p.name === "cust_id"
                    ? "fffe402a"
                    : p.name === "email"
                      ? "z@domain.io"
                      : i === 4
                        ? 18420
                        : "Z",
                unique:
                  p.name === "cust_id"
                    ? 1840022
                    : p.name === "email"
                      ? 1540321
                      : Math.floor(Math.random() * 10000) + 1,
                nulls: p.null ? parseFloat(String(p.null)) || 0 : 0,
                dist: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
              };
            });
          setColumns(richCols);

          // Generate matching anomalies list logic to look up warning badges
          let hash = 0;
          parsed.forEach((p: { name: string }) => {
            hash += (p.name.charCodeAt(0) || 0) + p.name.length;
          });
          const maxPossible = Math.min(parsed.length, 4);
          const anomalyCount = Math.max(1, (hash % maxPossible) + 1);

          const errorTemplates = [
            {
              t: "Type mismatch",
              d: "rows ingested as incorrect type instead of expected format.",
              sev: "high",
            },
            {
              t: "Duplicate keys",
              d: "duplicated values detected bypassing unique constraint.",
              sev: "med",
            },
            {
              t: "Null spike",
              d: "Null rate jumped significantly over the last 30 minutes.",
              sev: "high",
            },
            {
              t: "Format drift",
              d: "% of incoming records fail the canonical regex format.",
              sev: "low",
            },
            { t: "Schema drift", d: "unexpected new data shape detected upstream.", sev: "med" },
          ];

          const mappedAnomalies = parsed
            .slice(0, anomalyCount)
            .map((p: { name: string }, i: number) => {
              const tmpl = errorTemplates[(hash + i) % errorTemplates.length];
              const prefix =
                i === 2 || i === 4
                  ? ""
                  : (i === 3 ? ((hash % 20) / 10).toFixed(1) : (hash % 15) + 2) + " ";
              return {
                col: p.name,
                title: tmpl.t,
                sev: tmpl.sev,
                desc: `${prefix}${tmpl.d}`,
              };
            });

          // Dynamic schema drift alert for uploaded datasets
          const dynamicAnomalies = [...mappedAnomalies];
          if (parsed.length > 3) {
            dynamicAnomalies.push({
              col: "discount_code",
              title: "Schema Drift · orders.v3",
              sev: "high",
              desc: "Critical: Ingestion stream orders.v3 detected a missing column `discount_code` upstream in schema profile.",
            });
          }
          setAnomalies(dynamicAnomalies);

          // Calculate dynamic metrics based on richCols
          const avgNull =
            richCols.reduce((acc: number, c: ColumnData) => acc + c.nulls, 0) / richCols.length;

          const highCardCount = richCols.filter((c: ColumnData) => c.unique > 1000).length;
          const highCardPct = (highCardCount / richCols.length) * 100;

          const typeCollisions = (hash % 3) + 1;
          const rowsProfiled = 50000 + ((hash * 12345) % 4500000);

          setMetrics([
            { l: "Avg null %", v: parseFloat(avgNull.toFixed(1)), s: "%" },
            { l: "High-cardinality cols", v: parseFloat(highCardPct.toFixed(1)), s: "%" },
            { l: "Type collisions", v: typeCollisions, s: "", decimals: 0 },
            { l: "Rows profiled", v: rowsProfiled, s: "", decimals: 0 },
          ]);
        }
      }
    } catch (err) {
      console.warn("Could not calculate summary metrics:", err);
    }
  }, []);

  // Filter out anomalies referring to columns not present in columns array (Schema-level drift)
  const schemaAnomalies = anomalies.filter((a) => !columns.some((c) => c.name === a.col));

  return (
    <div>
      <SectionTitle
        kicker="Step 04 / Summary"
        title={
          <>
            Statistics, <span className="text-primary">visualized.</span>
          </>
        }
        sub="Distributions, nulls, uniques and ranges for every column — animated from zero on every render."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {metrics.map((s) => (
          <GlassCard key={s.l} className="p-4">
            <div className="font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
              {s.l}
            </div>
            <div className="mt-1 font-display text-3xl font-bold text-primary text-glow">
              <CountUp to={s.v} suffix={s.s ?? ""} decimals={s.decimals} />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlobalAlertBanner anomalies={schemaAnomalies} />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {columns.map((c, ci) => {
            const colAnomaly = anomalies.find((a) => a.col === c.name);
            return (
              <ContextAwareSummaryCard key={c.name} column={c} anomaly={colAnomaly} index={ci} />
            );
          })}
        </div>

        <div className="space-y-6">
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
    </div>
  );
}
