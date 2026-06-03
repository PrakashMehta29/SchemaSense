import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Activity, AlertTriangle, Cpu } from "lucide-react";
import { CountUp, GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · SchemaSense" },
      { name: "description", content: "Live overview of your data schema health, columns evaluated and anomalies." },
      { property: "og:title", content: "SchemaSense Dashboard" },
      { property: "og:description", content: "Analyze your schema in real time." },
    ],
  }),
  component: Index,
});

const tickerEvents = [
  "schema:orders.v3 ingested",
  "column cust_id flagged · type drift",
  "lineage rebuilt for fact_sales",
  "92 columns profiled in 1.4s",
  "AI definitions written · 14 cols",
  "anomaly resolved · null spike",
  "export queued · revenue.csv",
  "dictionary synced with warehouse",
];

function Index() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative">
          <div className="mb-6 flex items-center gap-2 font-mono-tight text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary glow-lime" />
            Schema Intelligence · Live
          </div>
          <div className="mb-8">
            <h1 className="font-display text-5xl font-bold leading-[0.95] md:text-7xl">
              Analyze Your
              <br />
              <span className="text-primary text-glow">Schema.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm text-muted-foreground md:text-base">
              SchemaSense scans, profiles and documents your data warehouse in seconds.
              See every column, every flow, every anomaly — instantly.
            </p>
          </div>

          {/* Big stat grid */}
          <div className="grid grid-cols-2 gap-6 max-w-3xl mt-2">
            {[
              { label: "Columns Evaluated", value: 1862 },
              { label: "Anomalies Flagged", value: 36.2, suffix: "%" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="bg-black/30 backdrop-blur-lg border border-white/[0.08] rounded-xl p-6 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div className={`font-display text-3xl font-bold md:text-4xl ${i === 0 ? "text-primary text-glow" : ""}`}>
                  <CountUp to={s.value} suffix={s.suffix ?? ""} />
                </div>
                <div className="mt-1 font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/upload" className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-lime transition-transform hover:scale-[1.02]">
              Upload a schema
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="/dictionary" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-foreground hover:bg-white/10 transition-colors">
              Browse dictionary
            </a>
          </div>
        </div>

        {/* Floating status cards */}
        <div className="lg:col-span-1 relative">
          <div className="flex flex-col gap-6">
            <StatusCard
              kicker="LIVE · PROCESSING"
              dotPulse
              title="orders_2026.parquet"
              metric="2 : 1"
              detail="Throughput · 14.2k rows/s"
              tone="lime"
              delay={0.1}
            />
            <StatusCard
              kicker="TOP COLUMN ISSUES"
              shake
              title="cust_id · email · ts_created"
              metric="36.2"
              detail="Drift score · 3 columns affected"
              tone="red"
              delay={0.25}
            />
            <StatusCard
              kicker="SYSTEM OVERVIEW"
              dotPulse
              title="All engines nominal"
              metric="99.98"
              detail="Uptime % · last 30 days"
              tone="lime"
              delay={0.4}
            />
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="relative overflow-hidden rounded-full border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md py-3 px-2">
        <div className="absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex animate-ticker whitespace-nowrap font-mono-tight text-xs text-muted-foreground">
          {[...tickerEvents, ...tickerEvents].map((e, i) => (
            <span key={i} className="mx-8 inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span className="text-foreground/80">EVT</span>
              <span>{e}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div>
        <SectionTitle kicker="Modules" title={<>Eight surfaces. One <span className="text-primary">brain.</span></>} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Upload", d: "Drag, drop, ingest." },
            { t: "Dictionary", d: "AI-written column defs." },
            { t: "Ask AI", d: "Chat with your schema." },
            { t: "Profiler", d: "Distributions & nulls." },
            { t: "Anomalies", d: "Live drift alerts." },
            { t: "Lineage", d: "Visual data graph." },
            { t: "Export", d: "JSON · CSV · PDF." },
            { t: "Engine", d: "Real-time, always-on." },
          ].map((m, i) => (
            <motion.div
              key={m.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md p-5 transition-colors hover:border-primary/40"
            >
              <div className="font-display text-xl font-semibold">{m.t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{m.d}</div>
              <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/0 blur-2xl transition-all group-hover:bg-primary/30" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  kicker, title, metric, detail, tone, delay = 0, dotPulse, shake,
}: {
  kicker: string; title: string; metric: string; detail: string;
  tone: "lime" | "red"; delay?: number; dotPulse?: boolean; shake?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 22 }}
      className="relative"
    >
      <div className="overflow-hidden bg-black/30 backdrop-blur-lg border border-white/[0.08] rounded-xl p-6 transition-all duration-300 hover:border-white/[0.15]">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 font-mono-tight text-[10px] uppercase tracking-[0.2em] ${tone === "lime" ? "text-primary" : "text-destructive"}`}>
            {dotPulse && <span className={`h-2 w-2 animate-pulse-dot rounded-full ${tone === "lime" ? "bg-primary glow-lime" : "bg-destructive"}`} />}
            {kicker}
          </div>
          {tone === "lime" ? <Activity className="h-4 w-4 text-primary" /> : <AlertTriangle className={`h-4 w-4 text-destructive ${shake ? "animate-micro-shake" : ""}`} />}
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate font-display text-base font-semibold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
          </div>
          <div className={`font-display text-4xl font-bold ${tone === "lime" ? "text-primary text-glow" : "text-destructive"} ${shake ? "animate-micro-shake" : ""}`}>
            {metric}
          </div>
        </div>

        {tone === "red" && (
          <div className="mt-3 flex items-center gap-2">
            <Pill tone="red">Action required</Pill>
            <Pill tone="muted">3 cols</Pill>
          </div>
        )}
        {tone === "lime" && (
          <div className="mt-3 flex items-center gap-2">
            <Pill tone="lime">Healthy</Pill>
            <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
