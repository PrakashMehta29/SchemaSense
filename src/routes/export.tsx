import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Download, FileJson, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { GlassCard, Pill, SectionTitle } from "@/components/ui-bits";

export const Route = createFileRoute("/export")({
  head: () => ({ meta: [{ title: "Export · SchemaSense" }] }),
  component: Exporter,
});

const formats = [
  { i: FileJson, t: "JSON", d: "Machine-readable dictionary + lineage payload.", size: "412 KB" },
  { i: FileSpreadsheet, t: "CSV", d: "Flat column inventory for spreadsheets and BI tools.", size: "118 KB" },
  { i: FileText, t: "PDF", d: "Stakeholder-ready document with charts and definitions.", size: "1.4 MB" },
];

import { useState } from "react";

function Exporter() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [completedId, setCompletedId] = useState<string | null>(null);

  const handleExport = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setProcessingId(null);
      setCompletedId(id);
      setTimeout(() => setCompletedId(null), 2000);
    }, 2500);
  };

  return (
    <div>
      <SectionTitle
        kicker="Step 07 / Export"
        title={<>Ship it <span className="text-primary">anywhere.</span></>}
        sub="Quick-download cards for the most common destinations."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {formats.map((f, i) => {
          const isProcessing = processingId === f.t;
          const isCompleted = completedId === f.t;
          
          return (
            <motion.div
              key={f.t}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 220, damping: 24 }}
            >
              <GlassCard className={`group relative overflow-hidden p-6 transition-colors ${isProcessing || isCompleted ? 'border-primary/50' : 'hover:border-primary/50'}`}>
                <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all ${isProcessing || isCompleted ? 'bg-primary/25' : 'bg-primary/0 group-hover:bg-primary/25'}`} />
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${isProcessing || isCompleted ? 'border-primary bg-primary/20 text-primary' : 'border-primary/40 bg-primary/10 text-primary'}`}>
                    <f.i className="h-6 w-6" />
                  </div>
                  <Pill tone="muted">{f.size}</Pill>
                </div>
                <div className="mt-5 font-display text-3xl font-bold">{f.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
                <button 
                  disabled={isProcessing || isCompleted}
                  onClick={() => handleExport(f.t)}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    isCompleted ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                    isProcessing ? 'bg-primary/20 text-primary animate-pulse' : 
                    'bg-primary text-primary-foreground glow-lime hover:opacity-90'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      Downloaded <CheckCircle2 className="h-4 w-4" />
                    </>
                  ) : isProcessing ? (
                    <>
                      Processing <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    </>
                  ) : (
                    <>
                      Download <Download className="h-4 w-4" />
                    </>
                  )}
                </button>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <GlassCard className="mt-8 p-5">
        <div className="font-mono-tight text-[10px] uppercase tracking-wider text-muted-foreground">Recent exports</div>
        <ul className="mt-3 divide-y divide-border/40">
          {[
            ["revenue_dictionary.json", "2 min ago", "JSON"],
            ["columns_inventory.csv", "1 hr ago", "CSV"],
            ["q2_schema_report.pdf", "yesterday", "PDF"],
          ].map(([n, t, k]) => (
            <li key={n} className="flex items-center justify-between py-3 text-sm">
              <div className="font-mono-tight">{n}</div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Pill tone="muted">{k}</Pill>
                <span className="font-mono-tight text-xs">{t}</span>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}