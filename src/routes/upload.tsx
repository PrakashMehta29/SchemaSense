import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { UploadCloud, FileSpreadsheet, Database, CheckCircle2 } from "lucide-react";
import { SectionTitle, Pill, GlassCard } from "@/components/ui-bits";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload · SchemaSense" },
      { name: "description", content: "Drag and drop your dataset to begin schema analysis." },
    ],
  }),
  component: UploadPage,
});

const detectedColumns = [
  { name: "cust_id", type: "uuid", null: "0%" },
  { name: "email", type: "string", null: "2.1%" },
  { name: "signup_ts", type: "timestamp", null: "0%" },
  { name: "country", type: "string", null: "0.4%" },
  { name: "revenue_usd", type: "decimal(12,2)", null: "8.7%" },
  { name: "is_active", type: "boolean", null: "0%" },
  { name: "plan_tier", type: "enum", null: "0%" },
  { name: "last_login", type: "timestamp", null: "12.3%" },
];

function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = () => {
    setIsProcessing(true);
    setStarted(false);
    setTimeout(() => {
      setIsProcessing(false);
      setStarted(true);
    }, 3000);
  };

  return (
    <div>
      <SectionTitle
        kicker="Step 01 / Upload"
        title={<>Drop your dataset to <span className="text-primary">begin</span>.</>}
        sub="CSV, Parquet, JSON, or a live warehouse connection. SchemaSense profiles the structure on contact."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard
          className={`relative overflow-hidden p-10 transition-colors ${
            dragOver ? "border-primary/60 bg-primary/5" : ""
          }`}
        >
          {isProcessing ? (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-primary shadow-[0_0_10px_rgba(242,120,92,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.9, ease: "linear" }}
              />
              
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse" />
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/50 bg-primary/10"
                >
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                    <Database className="h-8 w-8 text-primary animate-pulse" />
                  </motion.div>
                </motion.div>
              </div>
              
              <div className="font-display text-xl font-bold tracking-tight">Profiling Schema</div>
              <div className="mt-1 text-sm text-muted-foreground">Reading 2.4M rows...</div>
              
              <div className="w-full max-w-xs mt-8">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground font-mono-tight mb-2">
                  <span>Inferring Data Types</span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    Processing
                  </motion.span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/50">
                  <motion.div 
                    className="h-full bg-primary glow-lime" 
                    initial={{ width: "0%" }} 
                    animate={{ width: "100%" }} 
                    transition={{ duration: 2.8, ease: "circOut" }} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
              onClick={handleUpload}
              className="flex min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/70 p-8 text-center hover:border-primary/40 transition-colors"
            >
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: [0, -8, 0], opacity: 1 }}
                transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6 } }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
                  <UploadCloud className="h-10 w-10 text-primary" />
                </div>
              </motion.div>
              <div className="font-display text-2xl font-semibold">Drag & drop a file</div>
              <div className="mt-2 text-sm text-muted-foreground">or click to browse · max 5 GB</div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Pill tone="muted">.csv</Pill>
                <Pill tone="muted">.parquet</Pill>
                <Pill tone="muted">.json</Pill>
                <Pill tone="muted">.xlsx</Pill>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { i: FileSpreadsheet, t: "Sample CSV" },
              { i: Database, t: "Connect Warehouse" },
              { i: UploadCloud, t: "Paste URL" },
            ].map(({ i: Icon, t }) => (
              <button key={t} className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm hover:border-primary/40 hover:text-primary transition-colors">
                <Icon className="h-4 w-4" /> {t}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="font-mono-tight text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Detected columns
            </div>
            <Pill tone={isProcessing ? "lime" : started ? "lime" : "muted"}>
              {isProcessing ? "Scanning..." : started ? "Complete" : "Idle"}
            </Pill>
          </div>
          <ul className="mt-4 divide-y divide-border/60">
            {detectedColumns.map((c, i) => (
              <motion.li
                key={c.name}
                initial={{ opacity: 0, x: -10 }}
                animate={started ? { opacity: 1, x: 0 } : { opacity: 0.25, x: -10 }}
                transition={{ delay: started ? i * 0.12 : 0, duration: 0.4 }}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="font-mono-tight text-sm">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono-tight">{c.type}</span>
                  <span className="tabular-nums">{c.null}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}