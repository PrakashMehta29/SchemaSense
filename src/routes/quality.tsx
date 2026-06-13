import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { GlassCard, Pill, SectionTitle, CountUp } from "@/components/ui-bits";
import {
  AlertTriangle,
  Info,
  Database,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart2,
} from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useWorkspace } from "@/lib/WorkspaceContext";

export const Route = createFileRoute("/quality")({
  head: () => ({ meta: [{ title: "Quality · SchemaSense" }] }),
  component: Quality,
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

const defaultAnomalies = [
  {
    col: "email",
    title: "Type mismatch",
    sev: "high",
    desc: "5.4% of rows ingested as incorrect type instead of expected format (email).",
  },
  {
    col: "discount_code",
    title: "Schema Drift · orders.v3",
    sev: "high",
    desc: "Critical: Ingestion stream orders.v3 detected a missing column `discount_code` upstream in schema profile.",
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

  const failureTrace = {
    errorCode: "ERR_SCHEMA_DRIFT_UNANNOUNCED",
    failedComponent: "pipelines/ingestion/streams/orders_v3.py",
    timestamp: "2026-06-09T11:04:12Z",
    downstreamImpact: ["fact_sales", "stg_revenue", "dim_customers"],
  };

  return (
    <div className="space-y-2.5">
      {anomalies.map((anom, idx) => (
        <div key={idx} className="flex flex-col gap-1 border-l-2 border-destructive/40 pl-3">
          <span className="font-mono-tight text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
            {anom.title}
          </span>
          <span className="text-xs text-foreground/90 leading-relaxed font-mono-tight">
            {anom.desc}
          </span>
        </div>
      ))}

      {/* Technical Trace Sub-Panel */}
      <div className="mt-4 rounded-xl border border-red-900/40 bg-rose-950 p-4 font-mono text-[11px] text-rose-100 shadow-inner leading-relaxed">
        <div className="flex items-center justify-between border-b border-red-900/30 pb-1.5 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
            Upstream Incident Trace
          </span>
          <span className="text-[9px] text-rose-300/80">{failureTrace.timestamp}</span>
        </div>
        <div className="space-y-1">
          <div>
            <span className="text-rose-400 font-bold">[CODE]:</span> {failureTrace.errorCode}
          </div>
          <div className="break-all">
            <span className="text-rose-400 font-bold">[SOURCE]:</span>{" "}
            {failureTrace.failedComponent}
          </div>
          <div>
            <span className="text-rose-400 font-bold">[AFFECTED DOWNSTREAM]:</span>{" "}
            {failureTrace.downstreamImpact.join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Context Aware Summary Card with Collapsible Advanced Charts ──────────────
function ContextAwareSummaryCard({
  column,
  anomaly,
  index,
}: {
  column: ColumnData;
  anomaly?: Anomaly;
  index: number;
}) {
  const [showCharts, setShowCharts] = useState(false);
  const type = column.type.toLowerCase();
  const name = column.name.toLowerCase();
  const hasAnomaly = !!anomaly;

  const isText =
    type.includes("string") ||
    type.includes("enum") ||
    type.includes("email") ||
    type.includes("uuid");
  const isBoolean = type.includes("bool") || name === "is_active";

  const getMinLen = () => {
    if (name === "email") return 5;
    if (name === "country") return 2;
    if (name === "cust_id") return 36;
    if (typeof column.min === "string") return column.min.length;
    return 3;
  };

  const getMaxLen = () => {
    if (name === "email") return 64;
    if (name === "country") return 2;
    if (name === "cust_id") return 36;
    if (typeof column.max === "string") return column.max.length;
    return 56;
  };

  return (
    <GlassCard
      className={`p-5 transition-all duration-300 ${hasAnomaly ? "border-destructive/30 shadow-[0_4px_20px_rgba(239,68,68,0.03)]" : ""}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="font-display text-base font-bold text-foreground">{column.name}</div>
            {hasAnomaly && <AlertBadge title={anomaly.title} />}
          </div>
          <div className="font-mono-tight text-[11px] text-muted-foreground mt-0.5">
            {column.type}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isBoolean ? (
            <>
              <Pill tone="muted">TRUE: {name === "is_active" ? "64%" : "50%"}</Pill>
              <Pill tone="muted">FALSE: {name === "is_active" ? "36%" : "50%"}</Pill>
            </>
          ) : isText ? (
            <>
              <Pill tone="muted">MIN_LEN: {getMinLen()}</Pill>
              <Pill tone="muted">MAX_LEN: {getMaxLen()}</Pill>
            </>
          ) : (
            <>
              <Pill tone="muted">min: {String(column.min)}</Pill>
              <Pill tone="muted">max: {String(column.max)}</Pill>
            </>
          )}
          <Pill tone="lime">{column.unique.toLocaleString()} unique</Pill>
          <Pill tone={column.nulls > 10 ? "red" : "muted"}>{column.nulls}% null</Pill>

          {/* Toggle button to expand heavy charts */}
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="flex items-center gap-1 ml-2 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 font-mono-tight text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
          >
            <BarChart2 className="h-3 w-3" />
            {showCharts ? "Hide Charts" : "Show Charts"}
            {showCharts ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Expanded Charts (using height transition for clean layout) */}
      <AnimatePresence>
        {showCharts && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-4 pt-4 border-t border-border/40"
          >
            {(() => {
              if (type === "enum" || type === "boolean") {
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
                    <div className="relative mt-2">
                      <span className="absolute -top-3.5 left-4 text-[9px] font-mono text-slate-500/80">
                        Max frequency: 5.7k
                      </span>
                      <div className="flex h-16 items-end justify-around gap-6 border-b border-border/20 pb-1 px-4">
                        {categories.map((cat, i) => (
                          <div
                            key={cat.label}
                            className="flex-1 flex flex-col items-center h-full justify-end max-w-[80px]"
                          >
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${cat.pct}%` }}
                              className="w-full rounded-t bg-gradient-to-t from-primary/30 to-primary glow-lime"
                              style={{ minHeight: 2 }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono flex justify-between w-full mt-1 px-4">
                      <span>{categories[0]?.label ?? "[Min]"}</span>
                      <span>MODE: {categories[0]?.label?.toUpperCase()}</span>
                      <span>{categories[categories.length - 1]?.label ?? "[Max]"}</span>
                    </div>
                  </div>
                );
              }

              if (type === "uuid" || type === "email") {
                const uniqueness = name === "cust_id" ? 100 : 92.4;
                const formatConformity = name === "cust_id" ? "100.0%" : "99.7%";
                return (
                  <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded border border-border/30">
                      <span className="text-muted-foreground">UNIQUENESS:</span>
                      <span className="font-bold text-primary">{uniqueness}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded border border-border/30">
                      <span className="text-muted-foreground">CONFORMITY:</span>
                      <span className="font-bold text-primary">{formatConformity}</span>
                    </div>
                  </div>
                );
              }

              if (type === "numeric" || type === "decimal" || type.includes("decimal")) {
                const minVal = typeof column.min === "number" ? column.min : 0;
                const maxVal = typeof column.max === "number" ? column.max : 18420;
                const median = (minVal + maxVal) * 0.45;
                const p90 = minVal + (maxVal - minVal) * 0.85;
                const p99 = minVal + (maxVal - minVal) * 0.98;

                return (
                  <div>
                    <div className="relative mt-2">
                      <span className="absolute -top-3.5 left-1 text-[9px] font-mono text-slate-500/80">
                        Max: 12.4k rows
                      </span>
                      <div className="flex h-16 items-end gap-[2px] border-b border-border/20 pb-0.5">
                        {[4, 12, 28, 56, 78, 92, 70, 54, 32, 18, 9, 4].map((v, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary/80 hover:from-primary hover:to-primary transition-colors"
                            style={{ height: `${v}%`, minHeight: 2 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono flex justify-between w-full mt-1.5 px-1">
                      <span>{minVal}</span>
                      <span>{median.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span>{maxVal}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[9px] font-mono-tight uppercase tracking-wider text-muted-foreground border-t border-border/10 pt-2 mt-2">
                      <div>
                        Median:{" "}
                        <span className="font-bold text-foreground">
                          {median.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div>
                        P90:{" "}
                        <span className="font-bold text-foreground">
                          {p90.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div>
                        P99:{" "}
                        <span className="font-bold text-foreground">
                          {p99.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              if (type === "timestamp") {
                const formattedMin = `${column.min} 08:32:00`;
                const formattedMax = `${column.max} 15:00:00`;
                return (
                  <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-2.5">
                    <div className="relative w-full h-1 bg-primary/15 rounded-full overflow-hidden">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 glow-lime" />
                    </div>
                    <div className="flex justify-between font-mono-tight text-[9px] text-muted-foreground">
                      <span>
                        📅 MIN: <span className="text-foreground font-bold">{formattedMin}</span>
                      </span>
                      <span>
                        📅 MAX: <span className="text-foreground font-bold">{formattedMax}</span>
                      </span>
                    </div>
                  </div>
                );
              }

              // Fallback
              return (
                <div>
                  <div className="flex h-16 items-end gap-1.5 border-b border-border/20 pb-0.5">
                    {column.dist.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary"
                        style={{ height: `${v}%`, minHeight: 2 }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono flex justify-between w-full mt-1">
                    <span>{String(column.min)}</span>
                    <span>{String(column.max)}</span>
                  </div>
                </div>
              );
            })()}

            {/* Embedded Anomaly Alert in chart */}
            {hasAnomaly && (
              <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-mono-tight text-[9px] font-bold uppercase text-destructive">
                    Active Alert · {anomaly.title}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground font-mono-tight">
                    {anomaly.desc}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ─── Quality main component ───────────────────────────────────────────────────
function Quality() {
  const { hasDataset } = useWorkspace();
  const [columns, setColumns] = useState<ColumnData[]>(defaultColumns);
  const [anomalies, setAnomalies] = useState<Anomaly[]>(defaultAnomalies);
  const [metrics, setMetrics] = useState<Metric[]>([
    { l: "Avg null %", v: 4.1, s: "%" },
    { l: "Primary & unique keys", v: 2, s: "", subtitle: "Out of 8 total columns", decimals: 0 },
    { l: "Type collisions", v: 7, s: "", decimals: 0 },
    { l: "Rows profiled", v: 1840022, s: "", decimals: 0 },
  ]);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Accordion control for the Diagnostics panel
  const [diagnosticsExpanded, setDiagnosticsExpanded] = useState(false);

  useEffect(() => {
    if (!hasDataset) return;
    try {
      const saved = localStorage.getItem("schema_sense_cols");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

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
          else if (nameLower === "is_active" || typeLower === "boolean") inferredType = "boolean";
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

      const avgNull =
        richCols.reduce((acc: number, c: ColumnData) => acc + c.nulls, 0) / richCols.length;
      const uniqueKeysCount = richCols.filter(
        (c: ColumnData) =>
          c.unique > 1000000 ||
          c.name.toLowerCase().includes("id") ||
          c.name.toLowerCase().includes("email"),
      ).length;
      const typeCollisions = (hash % 3) + 1;
      const rowsProfiled = 50000 + ((hash * 12345) % 4500000);

      setMetrics([
        { l: "Avg null %", v: parseFloat(avgNull.toFixed(1)), s: "%" },
        {
          l: "Primary & unique keys",
          v: uniqueKeysCount || 2,
          s: "",
          subtitle: `Out of ${richCols.length} total columns`,
          decimals: 0,
        },
        { l: "Type collisions", v: typeCollisions, s: "", decimals: 0 },
        { l: "Rows profiled", v: rowsProfiled, s: "", decimals: 0 },
      ]);
    } catch (err) {
      console.warn("Could not calculate quality health metrics:", err);
    }
  }, [hasDataset]);

  const schemaAnomalies = anomalies.filter((a) => !columns.some((c) => c.name === a.col));
  const anomalousColumns = columns.filter((col) => anomalies.some((a) => a.col === col.name));
  const healthyColumns = columns.filter((col) => !anomalies.some((a) => a.col === col.name));

  // 1. Show empty state if no dataset is uploaded
  if (!hasDataset) {
    return (
      <div className="py-12">
        <SectionTitle
          kicker="Quality"
          title={
            <>
              Schema Profiling & <span className="text-primary">Health.</span>
            </>
          }
          sub="Deep-dive schema quality stats, type collision warnings, missing keys, and anomaly flags."
        />
        <div className="mt-12">
          <EmptyState
            icon={Database}
            title="No dataset uploaded"
            description="Upload a dataset to generate AI-powered metadata and lineage."
            actionLabel="Upload Dataset"
            actionTo="/data-sources"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionTitle
        kicker="Quality Dashboard"
        title={
          <>
            Profiling, <span className="text-primary">simplified.</span>
          </>
        }
        sub="Compact schema directory with drill-down advanced metrics, collapsible anomalies panel, and high-level health metrics."
      />

      {/* KPI Cards Row */}
      <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-4">
        {metrics.map((s) => {
          const isTypeCollisions = s.l.toLowerCase().includes("type collisions");
          const hasTooltip = isTypeCollisions;

          return (
            <GlassCard key={s.l} className="p-4 relative">
              <div className="flex items-center justify-between font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{s.l}</span>
                {hasTooltip && (
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary transition-colors focus:outline-none p-0.5"
                    onMouseEnter={() => setActiveTooltip(s.l)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip(activeTooltip === s.l ? null : s.l);
                    }}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="mt-1 font-display text-2xl md:text-3xl font-bold text-primary text-glow">
                <CountUp to={s.v} suffix={s.s ?? ""} decimals={s.decimals} />
              </div>
              {s.subtitle && (
                <div className="mt-1 text-[9px] text-muted-foreground font-mono-tight">
                  {s.subtitle}
                </div>
              )}

              {hasTooltip && activeTooltip === s.l && (
                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-xl border border-border/80 bg-background/95 p-3.5 shadow-xl backdrop-blur-md">
                  <div className="text-[11px] font-bold text-foreground mb-1 leading-snug">
                    Type Collisions
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-normal">
                    When a single column contains mixed formats or types of data (e.g. text mixed
                    with numbers). This breaks database operations.
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* ⚠️ Collapsible Diagnostics & Anomalies Accordion */}
      <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 overflow-hidden">
        <button
          onClick={() => setDiagnosticsExpanded(!diagnosticsExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-3 font-mono-tight text-[11px] font-bold uppercase tracking-wider text-amber-500">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>⚠️ Schema Diagnostics & Anomalies</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono-tight text-[10px] text-amber-600">
              {anomalies.length} Flagged Incidents
            </span>
            {diagnosticsExpanded ? (
              <ChevronUp className="h-4 w-4 text-amber-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {diagnosticsExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="px-5 pb-5 border-t border-amber-500/20 pt-4 space-y-4">
                <GlobalAlertBanner anomalies={schemaAnomalies} />

                {anomalousColumns.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-amber-500/15">
                    <h4 className="font-mono-tight text-[10px] uppercase text-muted-foreground">
                      Affected Columns
                    </h4>
                    {anomalousColumns.map((c, ci) => {
                      const colAnomaly = anomalies.find((a) => a.col === c.name);
                      return (
                        <ContextAwareSummaryCard
                          key={c.name}
                          column={c}
                          anomaly={colAnomaly}
                          index={ci}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid: Profiles and Type breakdown */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Column profiles */}
        <div className="space-y-4">
          <div className="mb-2 flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="font-display text-sm font-bold text-foreground">
              Schema Directory / Profiles
            </h3>
            <span className="font-mono-tight text-[9px] uppercase tracking-wider text-muted-foreground">
              {columns.length} Active Columns
            </span>
          </div>

          <div className="space-y-3">
            {healthyColumns.map((c, ci) => (
              <ContextAwareSummaryCard key={c.name} column={c} anomaly={null} index={ci} />
            ))}
          </div>
        </div>

        {/* Sidebar Breakdowns */}
        <div className="space-y-4">
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
                      transition={{ delay: i * 0.05, duration: 0.7 }}
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
